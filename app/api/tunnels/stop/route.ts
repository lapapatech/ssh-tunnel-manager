import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

    // For now, simulate tunnel stop
    // In production, this would signal the tunnel-service to close the SSH connection
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Update status to stopped
    await db.tunnel.update({
      where: { id },
      data: {
        status: 'stopped',
        startedAt: null,
        errorMessage: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Tunnel ${id} stopped`,
    })
  } catch (error) {
    console.error('Failed to stop tunnel:', error)
    return NextResponse.json(
      { error: 'Failed to stop tunnel' },
      { status: 500 }
    )
  }
}
