
import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import net from 'net'

const PROXY_DB = '/tmp/hermes-proxies.json'

interface ProxyEntry {
  id: string; url: string; tunnelId: string; technique: string
  sni: string; useTLS: boolean; healthy: boolean; latencyMs: number | null
}

async function getProxies(): Promise<ProxyEntry[]> {
  try { return JSON.parse(await readFile(PROXY_DB, 'utf-8')) } catch { return [] }
}

async function findBestProxy(): Promise<ProxyEntry | null> {
  const proxies = await getProxies()
  const healthy = proxies.filter(p => p.healthy)
  if (healthy.length === 0) return null
  healthy.sort((a, b) => {
    if (b.useTLS !== a.useTLS) return b.useTLS ? 1 : -1
    return (a.latencyMs || 999) - (b.latencyMs || 999)
  })
  return healthy[0]
}

async function testConnectivity(proxyUrl: string): Promise<boolean> {
  return new Promise(resolve => {
    try {
      const url = new URL(proxyUrl)
      const socket = new net.Socket()
      socket.setTimeout(3000)
      socket.on('connect', () => { socket.destroy(); resolve(true) })
      socket.on('error', () => resolve(false))
      socket.on('timeout', () => { socket.destroy(); resolve(false) })
      socket.connect(parseInt(url.port || '1080'), url.hostname)
    } catch { resolve(false) }
  })
}

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get('action')
  
  if (action === 'proxy-url' || !action) {
    const proxy = await findBestProxy()
    if (!proxy) {
      return NextResponse.json({ available: false, proxy: null, message: 'No hay proxies SOCKS activos. Arranca un túnel con SOCKS primero.' })
    }
    const alive = await testConnectivity(proxy.url)
    return NextResponse.json({
      available: alive,
      proxy: proxy.url,
      tunnelId: proxy.tunnelId,
      technique: proxy.technique,
      sni: proxy.sni,
      tls: proxy.useTLS,
      latency: proxy.latencyMs,
    })
  }
  
  if (action === 'list') {
    const proxies = await getProxies()
    return NextResponse.json({ proxies, count: proxies.length })
  }
  
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
