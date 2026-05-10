import { createServer } from 'http'
import { Server } from 'socket.io'
import { Client, ConnectConfig } from 'ssh2'
import * as net from 'net'
import * as fs from 'fs'
import { spawn, ChildProcess } from 'child_process'

const PORT = 3003

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// ─── Types ───────────────────────────────────────────────────────────────────

interface TunnelConfig {
  id: string
  name: string
  type: 'local' | 'remote' | 'dynamic'
  sshHost: string
  sshPort: number
  sshUser: string
  sshKeyPath?: string
  sshPassword?: string
  localBindAddr: string
  localPort: number
  remoteBindAddr?: string
  remotePort?: number
}

type TunnelStatus = 'connecting' | 'connected' | 'disconnecting' | 'disconnected' | 'error'

interface ActiveTunnel {
  config: TunnelConfig
  status: TunnelStatus
  sshClient: Client | null
  sshProcess: ChildProcess | null
  localServer: net.Server | null
  connections: number
  totalBytesIn: number
  totalBytesOut: number
  startedAt: Date | null
  error?: string
}

// ─── State ───────────────────────────────────────────────────────────────────

const tunnels = new Map<string, ActiveTunnel>()

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateSSHCommand(config: TunnelConfig): string {
  const parts = ['ssh']

  if (config.sshPort !== 22) {
    parts.push('-p', String(config.sshPort))
  }

  switch (config.type) {
    case 'local':
      parts.push(
        '-L',
        `${config.localBindAddr}:${config.localPort}:${config.remoteBindAddr || '127.0.0.1'}:${config.remotePort}`
      )
      break
    case 'remote':
      parts.push(
        '-R',
        `${config.remoteBindAddr || '0.0.0.0'}:${config.remotePort}:${config.localBindAddr}:${config.localPort}`
      )
      break
    case 'dynamic':
      parts.push('-D', `${config.localBindAddr}:${config.localPort}`)
      break
  }

  if (config.sshKeyPath) {
    parts.push('-i', config.sshKeyPath)
  }

  parts.push(`${config.sshUser}@${config.sshHost}`)
  return parts.join(' ')
}

function getTunnelStats(id: string) {
  const tunnel = tunnels.get(id)
  if (!tunnel) return null

  return {
    id,
    name: tunnel.config.name,
    type: tunnel.config.type,
    status: tunnel.status,
    connections: tunnel.connections,
    totalBytesIn: tunnel.totalBytesIn,
    totalBytesOut: tunnel.totalBytesOut,
    startedAt: tunnel.startedAt?.toISOString() ?? null,
    uptime: tunnel.startedAt ? Date.now() - tunnel.startedAt.getTime() : null,
    error: tunnel.error ?? null,
    config: {
      sshHost: tunnel.config.sshHost,
      sshPort: tunnel.config.sshPort,
      sshUser: tunnel.config.sshUser,
      localBindAddr: tunnel.config.localBindAddr,
      localPort: tunnel.config.localPort,
      remoteBindAddr: tunnel.config.remoteBindAddr,
      remotePort: tunnel.config.remotePort,
    },
  }
}

function emitStatusUpdate() {
  const allStats = Array.from(tunnels.keys()).map(getTunnelStats).filter(Boolean)
  io.emit('tunnel:status-update', allStats)
}

// ─── Tunnel Management ───────────────────────────────────────────────────────

function buildSSHConfig(config: TunnelConfig): ConnectConfig {
  const sshConfig: ConnectConfig = {
    host: config.sshHost,
    port: config.sshPort,
    username: config.sshUser,
    readyTimeout: 15000,
    keepaliveInterval: 10000,
    keepaliveCountMax: 3,
  }

  if (config.sshKeyPath) {
    sshConfig.privateKey = fs.readFileSync(config.sshKeyPath)
  } else if (config.sshPassword) {
    sshConfig.password = config.sshPassword
  }

  return sshConfig
}

function startLocalTunnel(tunnel: ActiveTunnel): void {
  const { config } = tunnel
  const remoteAddr = config.remoteBindAddr || '127.0.0.1'
  const remotePort = config.remotePort!

  const sshClient = new Client()
  tunnel.sshClient = sshClient

  sshClient.on('ready', () => {
    console.log(`[tunnel:${config.id}] SSH conectado`)

    const localServer = net.createServer((socket) => {
      tunnel.connections++

      sshClient.forwardOut(
        '127.0.0.1',
        config.localPort,
        remoteAddr,
        remotePort,
        (err, stream) => {
          if (err) {
            console.error(`[tunnel:${config.id}] forwardOut error:`, err.message)
            socket.destroy()
            tunnel.connections--
            emitStatusUpdate()
            return
          }

          socket.pipe(stream).pipe(socket)

          let closed = false
          const cleanup = () => {
            if (closed) return
            closed = true
            tunnel.connections--
            emitStatusUpdate()
            try { socket.destroy() } catch {}
            try { stream.close() } catch {}
          }

          stream.on('close', cleanup)
          socket.on('close', cleanup)
          socket.on('error', cleanup)
          stream.on('error', cleanup)

          emitStatusUpdate()
        }
      )
    })

    tunnel.localServer = localServer

    localServer.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        tunnel.status = 'error'
        tunnel.error = `Puerto ${config.localPort} ya está en uso`
        io.emit('tunnel:error', { id: config.id, error: tunnel.error })
        emitStatusUpdate()
      }
    })

    localServer.listen(config.localPort, config.localBindAddr, () => {
      tunnel.status = 'connected'
      tunnel.startedAt = new Date()
      tunnel.error = undefined
      console.log(`[tunnel:${config.id}] Túnel local activo en ${config.localBindAddr}:${config.localPort} → ${remoteAddr}:${remotePort}`)
      io.emit('tunnel:started', { id: config.id, status: 'connected' })
      emitStatusUpdate()
    })
  })

  sshClient.on('error', (err) => {
    tunnel.status = 'error'
    tunnel.error = err.message
    console.error(`[tunnel:${config.id}] SSH error:`, err.message)
    io.emit('tunnel:error', { id: config.id, error: err.message })
    emitStatusUpdate()
  })

  sshClient.on('close', () => {
    if (tunnel.status !== 'disconnecting') {
      tunnel.status = 'error'
      tunnel.error = 'Conexión SSH cerrada inesperadamente'
      io.emit('tunnel:error', { id: config.id, error: tunnel.error })
    }
    emitStatusUpdate()
  })

  const sshConfig = buildSSHConfig(config)
  sshClient.connect(sshConfig)
}

function startRemoteTunnel(tunnel: ActiveTunnel): void {
  const { config } = tunnel

  const sshClient = new Client()
  tunnel.sshClient = sshClient

  sshClient.on('ready', () => {
    const remoteAddr = config.remoteBindAddr || '0.0.0.0'
    const remotePort = config.remotePort!

    sshClient.forwardIn(remoteAddr, remotePort, (err, actualPort) => {
      if (err) {
        tunnel.status = 'error'
        tunnel.error = `Remote forward failed: ${err.message}`
        io.emit('tunnel:error', { id: config.id, error: tunnel.error })
        emitStatusUpdate()
        return
      }

      tunnel.status = 'connected'
      tunnel.startedAt = new Date()
      tunnel.error = undefined
      console.log(`[tunnel:${config.id}] Remote tunnel active on ${remoteAddr}:${actualPort}`)
      io.emit('tunnel:started', { id: config.id, status: 'connected', actualPort })
      emitStatusUpdate()
    })
  })

  sshClient.on('tcp connection', (info, accept, reject) => {
    const channel = accept()

    tunnel.connections++

    // Connect to local service
    const localSocket = net.connect(config.localPort, config.localBindAddr)

    let bytesIn = 0
    let bytesOut = 0

    localSocket.on('data', (data: Buffer) => {
      bytesIn += data.length
      tunnel.totalBytesIn += data.length
    })

    channel.on('data', (data: Buffer) => {
      bytesOut += data.length
      tunnel.totalBytesOut += data.length
    })

    channel.pipe(localSocket)
    localSocket.pipe(channel)

    localSocket.on('close', () => {
      tunnel.connections--
      emitStatusUpdate()
      try { channel.close() } catch {}
    })

    channel.on('close', () => {
      tunnel.connections--
      emitStatusUpdate()
      try { localSocket.destroy() } catch {}
    })

    localSocket.on('error', (err) => {
      console.error(`[tunnel:${config.id}] Local connection error:`, err.message)
      tunnel.connections--
      emitStatusUpdate()
      try { channel.close() } catch {}
    })

    channel.on('error', () => {
      tunnel.connections--
      emitStatusUpdate()
      try { localSocket.destroy() } catch {}
    })

    emitStatusUpdate()
  })

  sshClient.on('error', (err) => {
    tunnel.status = 'error'
    tunnel.error = err.message
    console.error(`[tunnel:${config.id}] SSH error:`, err.message)
    io.emit('tunnel:error', { id: config.id, error: err.message })
    emitStatusUpdate()
  })

  sshClient.on('close', () => {
    if (tunnel.status !== 'disconnecting') {
      tunnel.status = 'disconnected'
      tunnel.error = 'SSH connection closed unexpectedly'
      io.emit('tunnel:error', { id: config.id, error: 'SSH connection closed unexpectedly' })
    }
    emitStatusUpdate()
  })

  // Connect SSH
  const sshConfig = buildSSHConfig(config)
  sshClient.connect(sshConfig)
}

function startDynamicTunnel(tunnel: ActiveTunnel): void {
  const { config } = tunnel

  const sshClient = new Client()
  tunnel.sshClient = sshClient

  sshClient.on('ready', () => {
    tunnel.status = 'connected'
    tunnel.startedAt = new Date()
    tunnel.error = undefined
    console.log(`[tunnel:${config.id}] SSH connected for dynamic/SOCKS tunnel`)
    io.emit('tunnel:started', { id: config.id, status: 'connected' })
    emitStatusUpdate()
  })

  sshClient.on('error', (err) => {
    tunnel.status = 'error'
    tunnel.error = err.message
    console.error(`[tunnel:${config.id}] SSH error:`, err.message)
    io.emit('tunnel:error', { id: config.id, error: err.message })
    emitStatusUpdate()
  })

  sshClient.on('close', () => {
    if (tunnel.status !== 'disconnecting') {
      tunnel.status = 'disconnected'
      tunnel.error = 'SSH connection closed unexpectedly'
      io.emit('tunnel:error', { id: config.id, error: 'SSH connection closed unexpectedly' })
    }
    emitStatusUpdate()
  })

  // Create SOCKS5 proxy server
  const localServer = net.createServer((socket) => {
    if (!sshClient || tunnel.status !== 'connected') {
      socket.destroy()
      return
    }

    // Minimal SOCKS5 handshake
    socket.once('data', (data: Buffer) => {
      // SOCKS5 greeting
      if (data[0] !== 0x05) {
        socket.destroy()
        return
      }

      // No auth required
      socket.write(Buffer.from([0x05, 0x00]))

      socket.once('data', (request: Buffer) => {
        if (request[0] !== 0x05 || request[1] !== 0x01) {
          // Only CONNECT supported
          socket.write(Buffer.from([0x05, 0x07, 0x00, 0x01, 0, 0, 0, 0, 0, 0]))
          socket.destroy()
          return
        }

        let destHost: string
        let destPort: number
        let offset: number

        const addrType = request[3]
        if (addrType === 0x01) {
          // IPv4
          destHost = `${request[4]}.${request[5]}.${request[6]}.${request[7]}`
          destPort = request.readUInt16BE(8)
          offset = 10
        } else if (addrType === 0x03) {
          // Domain
          const domainLen = request[4]
          destHost = request.subarray(5, 5 + domainLen).toString()
          destPort = request.readUInt16BE(5 + domainLen)
          offset = 5 + domainLen + 2
        } else if (addrType === 0x04) {
          // IPv6
          const ipv6Parts: string[] = []
          for (let i = 0; i < 16; i += 2) {
            ipv6Parts.push(request.readUInt16BE(4 + i).toString(16))
          }
          destHost = ipv6Parts.join(':')
          destPort = request.readUInt16BE(20)
          offset = 22
        } else {
          socket.write(Buffer.from([0x05, 0x08, 0x00, 0x01, 0, 0, 0, 0, 0, 0]))
          socket.destroy()
          return
        }

        tunnel.connections++

        sshClient.forwardOut(
          socket.remoteAddress || '127.0.0.1',
          socket.remotePort || 0,
          destHost,
          destPort,
          (err, channel) => {
            if (err) {
              // Connection refused
              socket.write(Buffer.from([0x05, 0x05, 0x00, 0x01, 0, 0, 0, 0, 0, 0]))
              socket.destroy()
              tunnel.connections--
              emitStatusUpdate()
              return
            }

            // Success
            socket.write(Buffer.from([0x05, 0x00, 0x00, 0x01, 0, 0, 0, 0, 0, 0]))

            socket.on('data', (d: Buffer) => {
              tunnel.totalBytesOut += d.length
            })

            channel.on('data', (d: Buffer) => {
              tunnel.totalBytesIn += d.length
            })

            socket.pipe(channel)
            channel.pipe(socket)

            channel.on('close', () => {
              tunnel.connections--
              emitStatusUpdate()
              try { socket.destroy() } catch {}
            })

            socket.on('close', () => {
              tunnel.connections--
              emitStatusUpdate()
              try { channel.close() } catch {}
            })

            socket.on('error', () => {
              tunnel.connections--
              emitStatusUpdate()
              try { channel.close() } catch {}
            })

            channel.on('error', () => {
              tunnel.connections--
              emitStatusUpdate()
              try { socket.destroy() } catch {}
            })

            emitStatusUpdate()
          }
        )
      })
    })

    socket.on('error', () => {
      // Silently handle socket errors
    })
  })

  tunnel.localServer = localServer

  localServer.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      tunnel.status = 'error'
      tunnel.error = `Port ${config.localPort} is already in use`
      io.emit('tunnel:error', { id: config.id, error: tunnel.error })
      emitStatusUpdate()
    } else {
      console.error(`[tunnel:${config.id}] SOCKS server error:`, err.message)
    }
  })

  localServer.listen(config.localPort, config.localBindAddr, () => {
    console.log(`[tunnel:${config.id}] SOCKS server listening on ${config.localBindAddr}:${config.localPort}`)
    const sshConfig = buildSSHConfig(config)
    sshClient.connect(sshConfig)
  })
}

function stopTunnel(id: string): boolean {
  const tunnel = tunnels.get(id)
  if (!tunnel) return false

  tunnel.status = 'disconnecting'

  // Close local server
  if (tunnel.localServer) {
    try {
      tunnel.localServer.close()
    } catch {}
    tunnel.localServer = null
  }

  // Kill native SSH process
  if (tunnel.sshProcess) {
    try { tunnel.sshProcess.kill('SIGTERM') } catch {}
    tunnel.sshProcess = null
  }

  // Close SSH client (for remote/dynamic tunnels using ssh2)
  if (tunnel.sshClient) {
    try {
      if (tunnel.config.type === 'remote' && tunnel.config.remotePort) {
        const remoteAddr = tunnel.config.remoteBindAddr || '0.0.0.0'
        try {
          tunnel.sshClient.unforwardIn(remoteAddr, tunnel.config.remotePort)
        } catch {}
      }
      tunnel.sshClient.end()
    } catch {}
    tunnel.sshClient = null
  }

  tunnel.status = 'disconnected'
  tunnel.connections = 0

  tunnels.delete(id)

  console.log(`[tunnel:${id}] Tunnel stopped and removed`)
  io.emit('tunnel:stopped', { id })
  emitStatusUpdate()

  return true
}

function stopAllTunnels(): void {
  for (const id of tunnels.keys()) {
    stopTunnel(id)
  }
}

// ─── Socket.io Event Handlers ───────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`[socket] Client connected: ${socket.id}`)

  // Send current status on connect
  const currentStatus = Array.from(tunnels.keys()).map(getTunnelStats).filter(Boolean)
  socket.emit('tunnel:status-update', currentStatus)

  // Start a tunnel
  socket.on('tunnel:start', (config: TunnelConfig) => {
    console.log(`[socket] tunnel:start request for ${config.id} (${config.type})`)

    // Validate config
    if (!config.id || !config.sshHost || !config.sshUser) {
      socket.emit('tunnel:error', {
        id: config.id || 'unknown',
        error: 'Missing required fields: id, sshHost, sshUser',
      })
      return
    }

    if (tunnels.has(config.id)) {
      socket.emit('tunnel:error', {
        id: config.id,
        error: 'Tunnel with this ID already exists',
      })
      return
    }

    if (config.type === 'local' && (!config.remotePort || !config.remoteBindAddr)) {
      socket.emit('tunnel:error', {
        id: config.id,
        error: 'Local tunnels require remoteBindAddr and remotePort',
      })
      return
    }

    if (config.type === 'remote' && (!config.remotePort)) {
      socket.emit('tunnel:error', {
        id: config.id,
        error: 'Remote tunnels require remotePort',
      })
      return
    }

    if (!config.sshKeyPath && !config.sshPassword) {
      socket.emit('tunnel:error', {
        id: config.id,
        error: 'Either sshKeyPath or sshPassword must be provided',
      })
      return
    }

    const tunnel: ActiveTunnel = {
      config,
      status: 'connecting',
      sshClient: null,
      sshProcess: null,
      localServer: null,
      connections: 0,
      totalBytesIn: 0,
      totalBytesOut: 0,
      startedAt: null,
    }

    tunnels.set(config.id, tunnel)

    switch (config.type) {
      case 'local':
        startLocalTunnel(tunnel)
        break
      case 'remote':
        startRemoteTunnel(tunnel)
        break
      case 'dynamic':
        startDynamicTunnel(tunnel)
        break
    }
  })

  // Stop a tunnel
  socket.on('tunnel:stop', (data: { id: string }) => {
    console.log(`[socket] tunnel:stop request for ${data.id}`)

    if (!tunnels.has(data.id)) {
      socket.emit('tunnel:error', {
        id: data.id,
        error: 'Tunnel not found',
      })
      return
    }

    stopTunnel(data.id)
  })

  // Get status of all tunnels
  socket.on('tunnel:status', () => {
    const allStats = Array.from(tunnels.keys()).map(getTunnelStats).filter(Boolean)
    socket.emit('tunnel:status-update', allStats)
  })

  // Generate SSH command equivalent
  socket.on('tunnel:command', (config: TunnelConfig) => {
    const command = generateSSHCommand(config)
    socket.emit('tunnel:command', { id: config.id, command })
  })

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log(`[socket] Client disconnected: ${socket.id} (${reason})`)
  })

  socket.on('error', (error) => {
    console.error(`[socket] Error on ${socket.id}:`, error)
  })
})

// ─── Graceful Shutdown ───────────────────────────────────────────────────────

function gracefulShutdown(signal: string) {
  console.log(`\n[shutdown] Received ${signal}, shutting down gracefully...`)

  // Stop all active tunnels
  stopAllTunnels()

  // Close Socket.io
  io.disconnectSockets(true)

  // Close HTTP server
  httpServer.close(() => {
    console.log('[shutdown] Server closed')
    process.exit(0)
  })

  // Force exit after 5 seconds
  setTimeout(() => {
    console.error('[shutdown] Forced shutdown after timeout')
    process.exit(1)
  }, 5000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// ─── Start Server ────────────────────────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log(`[tunnel-service] SSH Tunnel Management Service running on port ${PORT}`)
  console.log(`[tunnel-service] WebSocket endpoint: /?XTransformPort=${PORT}`)
})
