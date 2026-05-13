import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { deployReverseTunnel, DeployProgress } from '@/lib/deployer'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Deployment ID is required' }, { status: 400 })

    const deployment = await db.deployment.findUnique({ where: { id } })
    if (!deployment) return NextResponse.json({ error: 'Deployment not found' }, { status: 404 })

    if (deployment.status === 'deploying') {
      return NextResponse.json({ error: 'Deployment already in progress' }, { status: 409 })
    }

    // Mark as deploying
    await db.deployment.update({
      where: { id },
      data: { status: 'deploying', currentPhase: 'starting', errorMessage: null },
    })

    const progressLog: DeployProgress[] = []

    const result = await deployReverseTunnel(
      {
        target: {
          host: deployment.targetHost,
          port: deployment.targetPort,
          user: deployment.targetUser,
          password: deployment.targetPassword ?? undefined,
          privateKey: deployment.targetKeyPath ?? undefined,
        },
        vps: {
          host: deployment.vpsHost,
          port: deployment.vpsPort,
          user: deployment.vpsUser,
          password: deployment.vpsPassword ?? undefined,
          privateKey: deployment.vpsKeyPath ?? undefined,
        },
        remotePort: deployment.remotePort,
        localPort: deployment.localPort,
        serviceName: deployment.serviceName,
        camouflage: deployment.camouflage,
        ipQosBackground: deployment.ipQosBackground,
      },
      (progress: DeployProgress) => {
        progressLog.push(progress)
      }
    )

    // Update DB with result
    const newStatus = result.error ? 'error' : result.phase === 'complete-warning' ? 'active' : 'active'
    await db.deployment.update({
      where: { id },
      data: {
        status: newStatus,
        currentPhase: result.phase,
        sshPublicKey: result.sshPublicKey ?? undefined,
        errorMessage: result.error ?? (result.phase === 'complete-warning' ? result.message : undefined),
        deployedAt: newStatus === 'active' ? new Date() : undefined,
      },
    })

    return NextResponse.json({
      success: !result.error,
      deployment: await db.deployment.findUnique({ where: { id } }),
      progress: progressLog,
      finalMessage: result.message,
    })
  } catch (error: any) {
    console.error('Failed to deploy:', error)
    const errorMsg = error.message || 'Deploy failed'
    try {
      const { searchParams } = new URL(request.url)
      const id = searchParams.get('id')
      if (id) {
        await db.deployment.update({
          where: { id },
          data: { status: 'error', errorMessage: errorMsg },
        })
      }
    } catch {}
    return NextResponse.json({ error: errorMsg, progress: [] }, { status: 500 })
  }
}