import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Client, ConnectConfig } from 'ssh2'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Deployment ID is required' }, { status: 400 })

    const deployment = await db.deployment.findUnique({ where: { id } })
    if (!deployment) return NextResponse.json({ error: 'Deployment not found' }, { status: 404 })
    if (!deployment.sshPublicKey) {
      return NextResponse.json({ status: 'unknown', message: 'No SSH key found. Deploy first.' })
    }

    // Try connecting to VPS and checking if the tunnel port is listening
    let tunnelUp = false
    let errorMsg = ''
    let vpsClient: Client | null = null

    try {
      const vpsConfig: ConnectConfig = {
        host: deployment.vpsHost,
        port: deployment.vpsPort,
        username: deployment.vpsUser,
        password: deployment.vpsPassword ?? undefined,
        privateKey: deployment.vpsKeyPath ?? undefined,
        readyTimeout: 10000,
        keepaliveInterval: 10000,
        keepaliveCountMax: 2,
      }

      vpsClient = await new Promise((resolve, reject) => {
        const c = new Client()
        c.on('ready', () => resolve(c))
        c.on('error', reject)
        c.connect(vpsConfig)
      })

      const result = await new Promise<{ stdout: string; code: number }>((resolve, reject) => {
        vpsClient!.exec(`nc -z -w3 127.0.0.1 ${deployment.remotePort} && echo OK || echo FAIL`, (err, stream) => {
          if (err) return reject(err)
          let stdout = ''
          stream.on('data', (d: Buffer) => { stdout += d.toString() })
          stream.on('close', (code: number) => resolve({ stdout, code }))
          stream.on('error', reject)
        })
      })

      tunnelUp = result.stdout.trim() === 'OK'
    } catch (err: any) {
      errorMsg = err.message || 'Failed to check tunnel status'
    } finally {
      if (vpsClient) { try { vpsClient.end() } catch {} }
    }

    // Update lastSeen
    await db.deployment.update({
      where: { id },
      data: { lastSeen: new Date() },
    })

    return NextResponse.json({
      status: tunnelUp ? 'active' : 'down',
      tunnelUp,
      message: tunnelUp
        ? `Túnel activo en ${deployment.vpsHost}:${deployment.remotePort}`
        : `Túnel caído en ${deployment.vpsHost}:${deployment.remotePort}${errorMsg ? ': ' + errorMsg : ''}`,
    })
  } catch (error: any) {
    console.error('Failed to check deployment:', error)
    return NextResponse.json({ error: error.message || 'Check failed' }, { status: 500 })
  }
}