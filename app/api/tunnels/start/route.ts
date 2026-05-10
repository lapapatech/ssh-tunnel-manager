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

    // Update status to starting
    await db.tunnel.update({
      where: { id },
      data: { status: 'starting' },
    })

    // For now, simulate tunnel start
    // In production, this would connect to the tunnel-service via socket.io
    // and the tunnel service would create the actual SSH connection
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Update status to active
    await db.tunnel.update({
      where: { id },
      data: {
        status: 'active',
        startedAt: new Date(),
        errorMessage: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Tunnel ${id} started`,
    })
  } catch (error) {
    console.error('Failed to start tunnel:', error)

    // Try to update status to error
    try {
      const { searchParams } = new URL(request.url)
      const id = searchParams.get('id')
      if (id) {
        await db.tunnel.update({
          where: { id },
          data: {
            status: 'error',
            errorMessage: 'Failed to start tunnel',
          },
        })
      }
    } catch {}

    return NextResponse.json(
      { error: 'Failed to start tunnel' },
      { status: 500 }
    )
  }
}
