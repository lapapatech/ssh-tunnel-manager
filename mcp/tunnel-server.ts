import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"

const APP_URL = process.env.TUNNEL_MANAGER_URL || "http://localhost:3000"
const TUNNEL_SERVICE_URL = process.env.TUNNEL_SERVICE_URL || "http://localhost:3003"
const EPHEMERAL_PREFIX = "mcp-ephemeral-"

type JsonValue = Record<string, unknown> | unknown[] | string | number | boolean | null
type TechniqueType = "chisel" | "ligolo" | "dns" | "icmp" | "wstunnel" | "frp" | "quic" | "proxyjump"

const TECHNIQUE_BINARIES: Record<TechniqueType, string> = {
  chisel: "chisel",
  ligolo: "ligolo-ng",
  dns: "iodine",
  icmp: "ptunnel-ng",
  wstunnel: "wstunnel",
  frp: "frpc",
  quic: "hysteria",
  proxyjump: "ssh",
}

// ═══════════════════════════════════════════════════════════════════
// Command Builders — construct the raw command from structured params
// ═══════════════════════════════════════════════════════════════════

function buildTechniqueCommand(technique: TechniqueType, params: Record<string, unknown>): string {
  switch (technique) {
    case "chisel": {
      const mode = params.mode || "server"
      if (mode === "server") {
        const port = params.relayPort || 9000
        const auth = params.token ? `--authfile <(echo "${params.token}")` : "--reverse"
        return `chisel server --host 0.0.0.0 --port ${port} ${auth}`
      }
      if (mode === "socks") {
        const host = params.relayHost || "localhost"
        const port = params.relayPort || 9000
        return `chisel client ${host}:${port} socks`
      }
      // client-reverse
      const host = params.relayHost || "localhost"
      const port = params.relayPort || 9000
      const bind = params.localBindAddr || "127.0.0.1"
      const dest = params.remoteBindAddr || "127.0.0.1"
      const destPort = params.remotePort || 22
      return `chisel client ${host}:${port} R:${bind}:${dest}:${destPort}`
    }

    case "ligolo": {
      const mode = params.mode || "server"
      if (mode === "server") {
        const ip = params.localBindAddr || "0.0.0.0"
        const port = params.localPort || 9001
        return `ligolo-ng server -laddr ${ip}:${port}`
      }
      const server = params.sshHost || "localhost"
      const port = params.localPort || 9001
      return `ligolo-ng agent -connect ${server}:${port} -ignore-cert`
    }

    case "dns": {
      const mode = params.mode || "server"
      const secret = params.sshPassword || "tunnel-secret"
      const domain = params.sshHost || "tunnel.example.com"
      if (mode === "server") {
        const ip = params.localBindAddr || "10.0.0.1"
        return `iodined -f -c -P "${secret}" ${domain} ${ip}`
      }
      const server = params.localBindAddr || "127.0.0.1"
      return `iodine -f -r -P "${secret}" ${domain}@${server}`
    }

    case "icmp": {
      const mode = params.mode || "server"
      if (mode === "server") {
        const port = params.localPort || 9999
        return `ptunnel-ng -l ${port} -p 9998`
      }
      const server = params.sshHost || "localhost"
      const port = params.localPort || 9999
      const local = params.remotePort || 1080
      return `ptunnel-ng -x 127.0.0.1 -p ${server}:${port} -r ${local} -l 127.0.0.1`
    }

    case "wstunnel": {
      const mode = params.mode || "server"
      if (mode === "server") {
        const port = params.localPort || 8080
        return `wstunnel -s ws://0.0.0.0:${port} --http-transport`
      }
      const host = params.sshHost || "localhost"
      const port = params.localPort || 8080
      const bind = params.localBindAddr || "127.0.0.1"
      const dest = params.remoteBindAddr || "127.0.0.1"
      const destPort = params.remotePort || 22
      return `wstunnel -L ${bind}:${destPort}:${dest}:${destPort} wss://${host}:${port}`
    }

    case "frp": {
      const mode = params.mode || "client"
      if (mode === "server") {
        return `frps -c ${params.command || "/etc/frp/frps.ini"}`
      }
      return `frpc -c ${params.command || "/etc/frp/frpc.ini"}`
    }

    case "quic": {
      const mode = params.mode || "server"
      const config = params.command || "/etc/hysteria/config.yaml"
      return `hysteria ${mode} -c ${config}`
    }

    case "proxyjump": {
      const jumpHost = params.sshHost || "jumphost"
      const jumpPort = params.sshPort || 22
      const destHost = params.remoteBindAddr || params.sshHost || "destination"
      const jumpUser = params.sshUser || "root"
      const key = params.sshKeyPath ? `-i ${params.sshKeyPath}` : ""
      const password = params.sshPassword || ""
      // For password-based proxyjump via sshpass
      if (password && !key) {
        return `sshpass -p "${password}" ssh -J ${jumpUser}@${jumpHost}:${jumpPort} root@${destHost} -N`
      }
      return `ssh ${key} -J ${jumpUser}@${jumpHost}:${jumpPort} root@${destHost} -N`
    }

    default:
      return ""
  }
}

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════

function jsonText(data: JsonValue) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  }
}

function redactTunnel(tunnel: Record<string, unknown>) {
  return {
    ...tunnel,
    sshPassword: tunnel.sshPassword ? "[redacted]" : tunnel.sshPassword,
  }
}

function redactDeployment(deployment: Record<string, unknown>) {
  return {
    ...deployment,
    targetPassword: deployment.targetPassword ? "[redacted]" : deployment.targetPassword,
    vpsPassword: deployment.vpsPassword ? "[redacted]" : deployment.vpsPassword,
  }
}

async function requestJson(path: string, init?: RequestInit) {
  const response = await fetch(`${APP_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  })

  const body = await response.text()
  const data = body ? JSON.parse(body) : null

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : `HTTP ${response.status}`
    throw new Error(message)
  }

  return data
}

async function requestServiceHealth() {
  const response = await fetch(`${TUNNEL_SERVICE_URL}/health`)
  const body = await response.text()
  const data = body ? JSON.parse(body) : null

  if (!response.ok) {
    throw new Error(`tunnel-service health returned HTTP ${response.status}`)
  }

  return data
}

async function requestSocketTool(event: string, payload: Record<string, unknown>, successEvent: string) {
  const { io } = await import("socket.io-client")

  return new Promise<Record<string, unknown>>((resolve, reject) => {
    const socket = io(TUNNEL_SERVICE_URL, {
      path: "/socket.io",
      transports: ["websocket"],
      reconnection: false,
      timeout: 10000,
    })

    const timeout = setTimeout(() => {
      cleanup()
      reject(new Error(`Timed out waiting for ${successEvent}`))
    }, 20000)

    function cleanup() {
      clearTimeout(timeout)
      socket.off(successEvent, onSuccess)
      socket.off("tunnel:error", onError)
      socket.disconnect()
    }

    function onSuccess(data: Record<string, unknown>) {
      if (data.id === payload.id) {
        cleanup()
        resolve(data)
      }
    }

    function onError(data: { id?: string; error?: string }) {
      if (!data.id || data.id === payload.id) {
        cleanup()
        reject(new Error(data.error || "tunnel-service returned an error"))
      }
    }

    socket.on("connect", () => {
      socket.emit(event, payload)
    })

    socket.on(successEvent, onSuccess)
    socket.on("tunnel:error", onError)
    socket.on("connect_error", (error) => {
      cleanup()
      reject(error)
    })
  })
}

function requireForwardingFields(input: {
  type: "local" | "remote" | "dynamic"
  remoteBindAddr?: string
  remotePort?: number
  technique?: string
}) {
  // Skip forwarding field checks for technique tunnels
  if (input.technique) return

  if (input.type !== "dynamic" && !input.remotePort) {
    throw new Error("remotePort is required for local and remote tunnels")
  }

  if (input.type === "local" && !input.remoteBindAddr) {
    throw new Error("remoteBindAddr is required for local tunnels")
  }
}

// ═══════════════════════════════════════════════════════════════════
// Schemas
// ═══════════════════════════════════════════════════════════════════

const tunnelInputSchema = {
  name: z.string().min(1).describe("Human-readable tunnel name"),
  type: z.enum(["local", "remote", "dynamic"]).describe("Tunnel type: local (-L), remote (-R), or dynamic SOCKS (-D)"),
  sshHost: z.string().min(1).describe("SSH server hostname or IP"),
  sshPort: z.number().int().min(1).max(65535).default(22).describe("SSH server port"),
  sshUser: z.string().min(1).describe("SSH username"),
  sshPassword: z.string().optional().describe("SSH password. Prefer sshKeyPath when possible."),
  sshKeyPath: z.string().optional().describe("Path to private key on the machine running the app"),
  localBindAddr: z.string().default("127.0.0.1").describe("Local bind address or local target address for remote tunnels"),
  localPort: z.number().int().min(1).max(65535).describe("Local port. For dynamic tunnels this is the SOCKS listen port."),
  remoteBindAddr: z.string().optional().describe("Remote bind/target address. Required for local tunnels."),
  remotePort: z.number().int().min(1).max(65535).optional().describe("Remote port. Required for local and remote tunnels."),
  technique: z.enum(["chisel", "ligolo", "dns", "icmp", "wstunnel", "frp", "quic", "proxyjump"]).optional().describe("External technique to use instead of native SSH"),
  command: z.string().optional().describe("Raw command for technique execution. If omitted, it is built from other params."),
}

const ephemeralTunnelInputSchema = {
  id: z.string().optional().describe("Optional runtime id. If omitted, one is generated with mcp-ephemeral-* prefix."),
  ...tunnelInputSchema,
}

const techniqueTunnelInputSchema = {
  id: z.string().optional().describe("Optional runtime id. Auto-generated if omitted."),
  technique: z.enum(["chisel", "ligolo", "dns", "icmp", "wstunnel", "frp", "quic", "proxyjump"]).describe("Technique to execute"),
  mode: z.enum(["server", "client", "agent", "socks"]).optional().describe("Execution mode"),
  sshHost: z.string().default("127.0.0.1").describe("Target host or relay server"),
  sshPort: z.number().int().min(1).max(65535).default(22).describe("SSH port or relay port"),
  sshUser: z.string().default("root").describe("SSH user (for proxyjump)"),
  sshPassword: z.string().optional().describe("SSH password, auth token, or pre-shared secret"),
  sshKeyPath: z.string().optional().describe("Path to private key"),
  localBindAddr: z.string().default("127.0.0.1").describe("Local bind address"),
  localPort: z.number().int().min(1).max(65535).default(9000).describe("Local or listen port"),
  remoteBindAddr: z.string().optional().describe("Remote target address"),
  remotePort: z.number().int().min(1).max(65535).optional().describe("Remote target port"),
  command: z.string().optional().describe("Raw command override"),
}

const deploymentInputSchema = {
  name: z.string().min(1).describe("Human-readable deployment name"),
  targetHost: z.string().min(1).describe("Target machine host/IP behind NAT"),
  targetPort: z.number().int().min(1).max(65535).default(22).describe("Target SSH port"),
  targetUser: z.string().min(1).default("root").describe("Target SSH admin user"),
  targetPassword: z.string().optional().describe("Target SSH password. Prefer targetKeyPath when possible."),
  targetKeyPath: z.string().optional().describe("Private key path for target SSH access"),
  vpsHost: z.string().min(1).describe("Public VPS host/IP"),
  vpsPort: z.number().int().min(1).max(65535).default(22).describe("VPS SSH port"),
  vpsUser: z.string().min(1).default("root").describe("VPS SSH admin user used during deployment"),
  vpsPassword: z.string().optional().describe("VPS SSH password. Prefer vpsKeyPath when possible."),
  vpsKeyPath: z.string().optional().describe("Private key path for VPS SSH access"),
  remotePort: z.number().int().min(1).max(65535).default(2222).describe("Port that will listen on the VPS"),
  localPort: z.number().int().min(1).max(65535).default(22).describe("Target local service port exposed through the reverse tunnel"),
  serviceName: z.string().min(1).default("network-connectivity").describe("systemd service name installed on target"),
  camouflage: z.boolean().default(true).describe("Whether to camouflage autossh process path"),
  ipQosBackground: z.boolean().default(false).describe("Whether to mark service traffic as background QoS"),
}

async function listDeploymentsToolResponse() {
  const data = await requestJson("/api/deployments")
  const deployments = Array.isArray(data?.deployments)
    ? data.deployments.map((deployment: Record<string, unknown>) => redactDeployment(deployment))
    : []
  return jsonText({ deployments })
}

async function createDeploymentToolResponse(input: {
  targetPassword?: string
  targetKeyPath?: string
  vpsPassword?: string
  vpsKeyPath?: string
  [key: string]: unknown
}) {
  if (!input.targetPassword && !input.targetKeyPath) {
    throw new Error("Either targetPassword or targetKeyPath is required")
  }

  if (!input.vpsPassword && !input.vpsKeyPath) {
    throw new Error("Either vpsPassword or vpsKeyPath is required")
  }

  const data = await requestJson("/api/deployments", {
    method: "POST",
    body: JSON.stringify(input),
  })

  return jsonText({
    deployment: redactDeployment(data.deployment),
    next: "Call deploy_reverse_tunnel with this deployment id to install autossh/systemd.",
  })
}

// ═══════════════════════════════════════════════════════════════════
// MCP Server
// ═══════════════════════════════════════════════════════════════════

const server = new McpServer({
  name: "ssh-tunnel-manager",
  version: "2.0.0",
})

server.registerTool(
  "get_tunnel_service_health",
  {
    title: "Get Tunnel Service Health",
    description: "Check whether the tunnel-service is running and return active tunnel counts.",
    inputSchema: {},
  },
  async () => jsonText(await requestServiceHealth())
)

server.registerTool(
  "list_tunnels",
  {
    title: "List Tunnels",
    description: "List configured SSH tunnels from SSH Tunnel Manager.",
    inputSchema: {},
  },
  async () => {
    const data = await requestJson("/api/tunnels")
    const tunnels = Array.isArray(data?.tunnels)
      ? data.tunnels.map((tunnel: Record<string, unknown>) => redactTunnel(tunnel))
      : []
    return jsonText({
      tunnels,
      note: "Persistent reverse tunnels created by Reverse Tunnel Deployer are deployments. Use list_deployments or list_reverse_tunnel_deployments for those.",
    })
  }
)

server.registerTool(
  "create_tunnel",
  {
    title: "Create Tunnel",
    description: "Create a configured SSH tunnel. Use start_tunnel afterwards to activate it. Supports techniques: chisel, ligolo, dns, icmp, wstunnel, frp, quic, proxyjump.",
    inputSchema: tunnelInputSchema,
    annotations: {
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  async (input) => {
    requireForwardingFields(input as any)

    if (!input.sshPassword && !input.sshKeyPath && !input.technique) {
      throw new Error("Either sshPassword or sshKeyPath is required")
    }

    const data = await requestJson("/api/tunnels", {
      method: "POST",
      body: JSON.stringify(input),
    })

    return jsonText({
      tunnel: redactTunnel(data.tunnel),
      next: input.technique
        ? "Call start_tunnel with this tunnel id to execute the technique."
        : "Call start_tunnel with this tunnel id to activate it.",
    })
  }
)

server.registerTool(
  "start_technique_tunnel",
  {
    title: "Start Technique Tunnel (Ephemeral)",
    description: "Start a runtime-only tunnel using an external technique (chisel, ligolo, dns, icmp, wstunnel, frp, quic, proxyjump). The command is auto-built from parameters. Does NOT persist to database.",
    inputSchema: techniqueTunnelInputSchema,
    annotations: {
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  async (input) => {
    const technique = input.technique as TechniqueType
    const command = input.command || buildTechniqueCommand(technique, input as Record<string, unknown>)

    if (!command) {
      throw new Error(`Could not build command for technique: ${technique}`)
    }

    const id = input.id || `${EPHEMERAL_PREFIX}${technique}-${Date.now()}`
    const payload = {
      id,
      name: `${technique}-${id}`,
      type: "local" as const,
      sshHost: input.sshHost || "127.0.0.1",
      sshPort: input.sshPort || 22,
      sshUser: input.sshUser || "root",
      sshPassword: input.sshPassword,
      sshKeyPath: input.sshKeyPath,
      localBindAddr: input.localBindAddr || "127.0.0.1",
      localPort: input.localPort || 9000,
      remoteBindAddr: input.remoteBindAddr,
      remotePort: input.remotePort,
      technique,
      command,
    }

    const result = await requestSocketTool("tunnel:start", payload, "tunnel:started")

    return jsonText({
      id,
      technique,
      command,
      runtimeOnly: true,
      result,
      next: "Use stop_ephemeral_tunnel with this id to stop it.",
    })
  }
)

server.registerTool(
  "start_ephemeral_tunnel",
  {
    title: "Start Ephemeral Tunnel",
    description: "Start a runtime-only SSH tunnel through tunnel-service without creating or deleting any database record. Supports techniques for external tools.",
    inputSchema: ephemeralTunnelInputSchema,
    annotations: {
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  async (input) => {
    requireForwardingFields(input as any)

    if (!input.sshPassword && !input.sshKeyPath && !input.technique) {
      throw new Error("Either sshPassword, sshKeyPath, or a technique is required")
    }

    const id = input.id || `${EPHEMERAL_PREFIX}${Date.now()}`
    const result = await requestSocketTool("tunnel:start", { ...input, id }, "tunnel:started")

    return jsonText({
      id,
      runtimeOnly: true,
      result,
      next: "Use stop_ephemeral_tunnel with this id to stop it. This tunnel is not saved in the database.",
    })
  }
)

server.registerTool(
  "stop_ephemeral_tunnel",
  {
    title: "Stop Ephemeral Tunnel",
    description: "Stop a runtime-only tunnel by id. This does not delete any database record.",
    inputSchema: {
      id: z.string().min(1).describe("Ephemeral tunnel runtime id"),
    },
    annotations: {
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  async ({ id }) => {
    const result = await requestSocketTool("tunnel:stop", { id }, "tunnel:stopped")
    return jsonText({ id, runtimeOnly: true, result })
  }
)

server.registerTool(
  "start_tunnel",
  {
    title: "Start Tunnel",
    description: "Start an existing tunnel by id. Works for both native SSH tunnels and technique-based tunnels.",
    inputSchema: {
      id: z.string().min(1).describe("Tunnel id"),
    },
    annotations: {
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  async ({ id }) => jsonText(await requestJson(`/api/tunnels/start?id=${encodeURIComponent(id)}`, { method: "POST" }))
)

server.registerTool(
  "stop_tunnel",
  {
    title: "Stop Tunnel",
    description: "Stop an existing tunnel by id. Safe to call if the runtime tunnel is already gone.",
    inputSchema: {
      id: z.string().min(1).describe("Tunnel id"),
    },
    annotations: {
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  async ({ id }) => jsonText(await requestJson(`/api/tunnels/stop?id=${encodeURIComponent(id)}`, { method: "POST" }))
)

server.registerTool(
  "list_deployments",
  {
    title: "List Reverse Tunnel Deployments",
    description: "List configured persistent reverse tunnel deployments.",
    inputSchema: {},
  },
  async () => listDeploymentsToolResponse()
)

server.registerTool(
  "list_reverse_tunnel_deployments",
  {
    title: "List Reverse Tunnel Deployer Tunnels",
    description: "List persistent reverse tunnels created by Reverse Tunnel Deployer/autossh.",
    inputSchema: {},
  },
  async () => listDeploymentsToolResponse()
)

server.registerTool(
  "create_deployment",
  {
    title: "Create Reverse Tunnel Deployment",
    description: "Create a persistent reverse tunnel deployment config. Use deploy_reverse_tunnel afterwards to install autossh/systemd.",
    inputSchema: deploymentInputSchema,
    annotations: {
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  async (input) => createDeploymentToolResponse(input)
)

server.registerTool(
  "create_reverse_tunnel_deployment",
  {
    title: "Create Reverse Tunnel Deployer Tunnel",
    description: "Create a Reverse Tunnel Deployer config for a persistent reverse tunnel with autossh on a target machine behind NAT.",
    inputSchema: deploymentInputSchema,
    annotations: {
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  async (input) => createDeploymentToolResponse(input)
)

server.registerTool(
  "deploy_reverse_tunnel",
  {
    title: "Deploy Reverse Tunnel",
    description: "Execute a reverse tunnel deployment. This connects to the target and VPS, creates users/keys, installs autossh and systemd service, and verifies the tunnel.",
    inputSchema: {
      id: z.string().min(1).describe("Deployment id"),
    },
    annotations: {
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  async ({ id }) => {
    const data = await requestJson(`/api/deployments/deploy?id=${encodeURIComponent(id)}`, { method: "POST" })
    if (data?.deployment && typeof data.deployment === "object") {
      data.deployment = redactDeployment(data.deployment)
    }
    return jsonText(data)
  }
)

server.registerTool(
  "check_deployment",
  {
    title: "Check Reverse Tunnel Deployment",
    description: "Check whether a deployed reverse tunnel is reachable on the VPS.",
    inputSchema: {
      id: z.string().min(1).describe("Deployment id"),
    },
    annotations: {
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  async ({ id }) => jsonText(await requestJson(`/api/deployments/check?id=${encodeURIComponent(id)}`))
)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((error) => {
  console.error("[mcp:tunnels]", error)
  process.exit(1)
})
