import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, mkdir, access } from 'fs/promises'
import { join } from 'path'
import { randomBytes } from 'crypto'

const PROXY_DB = '/tmp/hermes-proxies.json'

interface ProxyEntry {
  id: string
  url: string
  tunnelId: string
  technique: string
  target: string
  sni: string
  useTLS: boolean
  created: string
  lastHealth: string | null
  healthy: boolean
  latencyMs: number | null
}

async function readProxies(): Promise<ProxyEntry[]> {
  try {
    await access(PROXY_DB)
    const data = await readFile(PROXY_DB, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function writeProxies(proxies: ProxyEntry[]) {
  const dir = PROXY_DB.substring(0, PROXY_DB.lastIndexOf('/'))
  await mkdir(dir, { recursive: true })
  await writeFile(PROXY_DB, JSON.stringify(proxies, null, 2))
}

// GET /api/proxies — list all proxies
export async function GET(request: NextRequest) {
  const proxies = await readProxies()
  const healthy = request.nextUrl.searchParams.get('healthy')
  let result = proxies
  if (healthy === 'true') {
    result = proxies.filter(p => p.healthy)
  }
  return NextResponse.json({ proxies: result, count: result.length })
}

// POST /api/proxies — register new proxy (called when tunnel starts with SOCKS)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // body: { url, tunnelId, technique, target, sni, useTLS }

    const proxies = await readProxies()
    const entry: ProxyEntry = {
      id: randomBytes(8).toString('hex'),
      url: body.url || '',
      tunnelId: body.tunnelId || '',
      technique: body.technique || '',
      target: body.target || '',
      sni: body.sni || '',
      useTLS: body.useTLS || false,
      created: new Date().toISOString(),
      lastHealth: null,
      healthy: true,
      latencyMs: null,
    }

    // Remove duplicate URLs
    const filtered = proxies.filter(p => p.url !== entry.url)
    filtered.push(entry)
    await writeProxies(filtered)

    return NextResponse.json({ success: true, proxy: entry })
  } catch (error) {
    console.error('Proxy registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}

// PUT /api/proxies — update proxy health
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    // { id, healthy, latencyMs }
    const proxies = await readProxies()
    const idx = proxies.findIndex(p => p.id === body.id)
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    proxies[idx].healthy = body.healthy ?? proxies[idx].healthy
    proxies[idx].latencyMs = body.latencyMs ?? proxies[idx].latencyMs
    proxies[idx].lastHealth = new Date().toISOString()
    await writeProxies(proxies)

    return NextResponse.json({ success: true, proxy: proxies[idx] })
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

// DELETE /api/proxies?id=xxx — remove proxy
export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const proxies = await readProxies()
  const filtered = proxies.filter(p => p.id !== id)
  await writeProxies(filtered)

  return NextResponse.json({ success: true, removed: proxies.length - filtered.length })
}