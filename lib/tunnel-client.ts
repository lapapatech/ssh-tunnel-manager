import { io, Socket } from 'socket.io-client'

const TUNNEL_SERVICE_URL = process.env.TUNNEL_SERVICE_URL || 'http://localhost:3003'

let socket: Socket | null = null

function getSocket(): Socket {
  if (!socket || !socket.connected) {
    socket = io(TUNNEL_SERVICE_URL, {
      path: '/socket.io',
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    })
  }
  return socket
}

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

export function startTunnel(config: TunnelConfig): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    const s = getSocket()
    const timeout = setTimeout(() => {
      cleanup()
      resolve({ success: false, error: 'Timeout waiting for tunnel-service response' })
    }, 15000)

    function cleanup() {
      clearTimeout(timeout)
      s.off('tunnel:started', onStarted)
      s.off('tunnel:error', onError)
    }

    function onStarted(data: { id: string }) {
      if (data.id === config.id) {
        cleanup()
        resolve({ success: true })
      }
    }

    function onError(data: { id: string; error: string }) {
      if (data.id === config.id) {
        cleanup()
        resolve({ success: false, error: data.error })
      }
    }

    s.on('tunnel:started', onStarted)
    s.on('tunnel:error', onError)
    s.emit('tunnel:start', config)
  })
}

export function stopTunnel(id: string): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    const s = getSocket()
    const timeout = setTimeout(() => {
      cleanup()
      resolve({ success: false, error: 'Timeout waiting for tunnel-service response' })
    }, 10000)

    function cleanup() {
      clearTimeout(timeout)
      s.off('tunnel:stopped', onStopped)
      s.off('tunnel:error', onError)
    }

    function onStopped(data: { id: string }) {
      if (data.id === id) {
        cleanup()
        resolve({ success: true })
      }
    }

    function onError(data: { id: string; error: string }) {
      if (data.id === id) {
        cleanup()
        resolve({ success: false, error: data.error })
      }
    }

    s.on('tunnel:stopped', onStopped)
    s.on('tunnel:error', onError)
    s.emit('tunnel:stop', { id })
  })
}
