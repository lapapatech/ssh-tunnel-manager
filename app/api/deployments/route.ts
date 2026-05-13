import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const deployments = await db.deployment.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ deployments })
  } catch (error) {
    console.error('Failed to fetch deployments:', error)
    return NextResponse.json({ error: 'Failed to fetch deployments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name, targetHost, targetPort, targetUser, targetPassword, targetKeyPath,
      vpsHost, vpsPort, vpsUser, vpsPassword, vpsKeyPath,
      remotePort, localPort, serviceName, camouflage, ipQosBackground,
    } = body

    if (!name || !targetHost || !targetUser || !vpsHost) {
      return NextResponse.json(
        { error: 'Missing required fields: name, targetHost, targetUser, vpsHost' },
        { status: 400 }
      )
    }

    const deployment = await db.deployment.create({
      data: {
        name,
        status: 'pending',
        targetHost, targetPort: targetPort || 22, targetUser, targetPassword: targetPassword || null, targetKeyPath: targetKeyPath || null,
        vpsHost, vpsPort: vpsPort || 22, vpsUser: vpsUser || 'tunneluser', vpsPassword: vpsPassword || null, vpsKeyPath: vpsKeyPath || null,
        remotePort: remotePort || 2222, localPort: localPort || 22,
        serviceName: serviceName || 'network-connectivity',
        camouflage: camouflage !== false,
        ipQosBackground: ipQosBackground || false,
      },
    })

    return NextResponse.json({ deployment }, { status: 201 })
  } catch (error) {
    console.error('Failed to create deployment:', error)
    return NextResponse.json({ error: 'Failed to create deployment' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    const body = await request.json()
    const deployment = await db.deployment.update({ where: { id }, data: body })
    return NextResponse.json({ deployment })
  } catch (error) {
    console.error('Failed to update deployment:', error)
    return NextResponse.json({ error: 'Failed to update deployment' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    await db.deployment.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete deployment:', error)
    return NextResponse.json({ error: 'Failed to delete deployment' }, { status: 500 })
  }
}