import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const tunnels = await db.tunnel.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ tunnels })
  } catch (error) {
    console.error('Failed to fetch tunnels:', error)
    return NextResponse.json({ error: 'Failed to fetch tunnels' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      name,
      type,
      sshHost,
      sshPort,
      sshUser,
      sshKeyPath,
      sshPassword,
      localBindAddr,
      localPort,
      remoteBindAddr,
      remotePort,
    } = body

    if (!name || !type || !sshHost || !sshUser) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, sshHost, sshUser' },
        { status: 400 }
      )
    }

    const tunnel = await db.tunnel.create({
      data: {
        name,
        type,
        status: 'stopped',
        sshHost,
        sshPort: sshPort || 22,
        sshUser,
        sshKeyPath: sshKeyPath || null,
        sshPassword: sshPassword || null,
        localBindAddr: localBindAddr || '127.0.0.1',
        localPort: localPort || 8080,
        remoteBindAddr: remoteBindAddr || null,
        remotePort: remotePort || null,
      },
    })

    return NextResponse.json({ tunnel }, { status: 201 })
  } catch (error) {
    console.error('Failed to create tunnel:', error)
    return NextResponse.json({ error: 'Failed to create tunnel' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const body = await request.json()

    const tunnel = await db.tunnel.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({ tunnel })
  } catch (error) {
    console.error('Failed to update tunnel:', error)
    return NextResponse.json({ error: 'Failed to update tunnel' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await db.tunnel.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete tunnel:', error)
    return NextResponse.json({ error: 'Failed to delete tunnel' }, { status: 500 })
  }
}
