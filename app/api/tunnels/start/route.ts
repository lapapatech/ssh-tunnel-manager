import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { startTunnel } from "@/lib/tunnel-client"

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Tunnel ID is required" }, { status: 400 })
    }

    const tunnel = await db.tunnel.findUnique({ where: { id } })

    if (!tunnel) {
      return NextResponse.json({ error: "Tunnel not found" }, { status: 404 })
    }

    await db.tunnel.update({
      where: { id },
      data: { status: "starting" },
    })

    const result = await startTunnel({
      id: tunnel.id,
      name: tunnel.name,
      type: tunnel.type as "local" | "remote" | "dynamic",
      sshHost: tunnel.sshHost,
      sshPort: tunnel.sshPort,
      sshUser: tunnel.sshUser,
      sshKeyPath: tunnel.sshKeyPath ?? undefined,
      sshPassword: tunnel.sshPassword ?? undefined,
      localBindAddr: tunnel.localBindAddr,
      localPort: tunnel.localPort,
      remoteBindAddr: tunnel.remoteBindAddr ?? undefined,
      remotePort: tunnel.remotePort ?? undefined,
      technique: tunnel.technique ?? undefined,
      command: tunnel.command ?? undefined,
    })

    if (!result.success) {
      await db.tunnel.update({
        where: { id },
        data: { status: "error", errorMessage: result.error || "Failed to start tunnel" },
      })
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    await db.tunnel.update({
      where: { id },
      data: { status: "active", startedAt: new Date(), errorMessage: null },
    })

    return NextResponse.json({ success: true, message: `Tunnel ${id} started` })
  } catch (error) {
    console.error("Failed to start tunnel:", error)

    try {
      const { searchParams } = new URL(request.url)
      const id = searchParams.get("id")
      if (id) {
        await db.tunnel.update({
          where: { id },
          data: { status: "error", errorMessage: "Failed to start tunnel" },
        })
      }
    } catch {}

    return NextResponse.json({ error: "Failed to start tunnel" }, { status: 500 })
  }
}
