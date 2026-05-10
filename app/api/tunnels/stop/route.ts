import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { stopTunnel } from '@/lib/tunnel-client'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Tunnel ID is required' }, { status: 400 })
    }

    const tunnel = await db.tunnel.findUnique({ where: { id } })

    if (!tunnel) {
      return NextResponse.json({ error: 'Tunnel not found' }, { status: 404 })
    }

    const result = await stopTunnel(id)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    await db.tunnel.update({
      where: { id },
      data: { status: 'stopped', startedAt: null, errorMessage: null },
    })

    return NextResponse.json({ success: true, message: `Tunnel ${id} stopped` })
  } catch (error) {
    console.error('Failed to stop tunnel:', error)
    return NextResponse.json({ error: 'Failed to stop tunnel' }, { status: 500 })
  }
}
