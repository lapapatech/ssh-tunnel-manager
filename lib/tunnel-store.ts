'use client'

import { create } from 'zustand'
import { toast } from 'sonner'
import { io, Socket } from 'socket.io-client'
import { getTranslation } from '@/lib/i18n'

export interface Tunnel {
  id: string
  name: string
  type: 'local' | 'remote' | 'dynamic'
  status: 'stopped' | 'starting' | 'active' | 'error'
  sshHost: string
  sshPort: number
  sshUser: string
  sshKeyPath?: string
  sshPassword?: string
  localBindAddr: string
  localPort: number
  remoteBindAddr?: string
  remotePort?: number
  errorMessage?: string
  startedAt?: Date
  createdAt: Date
}

interface TunnelServiceStats {
  id: string
  status: 'connecting' | 'connected' | 'disconnecting' | 'disconnected' | 'error'
  startedAt: string | null
  error: string | null
}

const TUNNEL_SERVICE_URL =
  process.env.NEXT_PUBLIC_TUNNEL_SERVICE_URL ||
  process.env.TUNNEL_SERVICE_URL ||
  'http://localhost:3003'

let realtimeSocket: Socket | null = null
let realtimeSubscribers = 0
let latestServiceStats = new Map<string, TunnelServiceStats>()
let hasServiceSnapshot = false

function mapServiceStatus(status: TunnelServiceStats['status']): Tunnel['status'] {
  switch (status) {
    case 'connecting':
      return 'starting'
    case 'connected':
      return 'active'
    case 'error':
      return 'error'
    case 'disconnecting':
    case 'disconnected':
    default:
      return 'stopped'
  }
}

function mergeServiceStats(tunnels: Tunnel[]): Tunnel[] {
  return tunnels.map((tunnel) => {
    const stat = latestServiceStats.get(tunnel.id)
    if (!stat) {
      if (hasServiceSnapshot && (tunnel.status === 'active' || tunnel.status === 'starting')) {
        return {
          ...tunnel,
          status: 'stopped',
          startedAt: undefined,
          errorMessage: undefined,
        }
      }
      return tunnel
    }

    return {
      ...tunnel,
      status: mapServiceStatus(stat.status),
      startedAt: stat.startedAt ? new Date(stat.startedAt) : undefined,
      errorMessage: stat.error || undefined,
    }
  })
}

// Helper to get a toast message based on current locale
function getToast(subKey: string): string {
  return getTranslation(`toasts.${subKey}`)
}

interface TunnelStore {
  tunnels: Tunnel[]
  activeTab: string
  isLoading: boolean
  fetchTunnels: () => Promise<void>
  addTunnel: (tunnel: Omit<Tunnel, 'id' | 'createdAt' | 'status'>) => Promise<void>
  removeTunnel: (id: string) => Promise<void>
  updateTunnel: (id: string, updates: Partial<Tunnel>) => Promise<void>
  startTunnel: (id: string) => Promise<void>
  stopTunnel: (id: string) => Promise<void>
  subscribeToTunnelEvents: () => () => void
  setActiveTab: (tab: string) => void
}

export const useTunnelStore = create<TunnelStore>((set, get) => ({
  tunnels: [],
  activeTab: 'local',
  isLoading: false,

  fetchTunnels: async () => {
    set({ isLoading: true })
    try {
      const res = await fetch('/api/tunnels')
      if (res.ok) {
        const data = await res.json()
        set({ tunnels: mergeServiceStats(data.tunnels || []), isLoading: false })
      } else {
        set({ isLoading: false })
      }
    } catch {
      set({ isLoading: false })
    }
  },

  addTunnel: async (tunnelData) => {
    try {
      const res = await fetch('/api/tunnels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tunnelData),
      })
      if (res.ok) {
        const data = await res.json()
        set((state) => ({
          tunnels: [...state.tunnels, data.tunnel],
        }))
        toast.success(getToast('tunnelCreated'))
      } else {
        const data = await res.json()
        toast.error(data.error || getToast('createFailed'))
      }
    } catch {
      toast.error(getToast('createFailed'))
    }
  },

  removeTunnel: async (id) => {
    try {
      const res = await fetch(`/api/tunnels?id=${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmDelete: true }),
      })
      if (res.ok) {
        set((state) => ({
          tunnels: state.tunnels.filter((t) => t.id !== id),
        }))
        toast.success(getToast('tunnelDeleted'))
      } else {
        const data = await res.json().catch(() => null)
        toast.error(data?.error || getToast('deleteFailed'))
      }
    } catch {
      toast.error(getToast('deleteFailed'))
    }
  },

  updateTunnel: async (id, updates) => {
    try {
      const res = await fetch(`/api/tunnels?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        set((state) => ({
          tunnels: state.tunnels.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }))
      } else {
        toast.error(getToast('updateFailed'))
      }
    } catch {
      toast.error(getToast('updateFailed'))
    }
  },

  startTunnel: async (id) => {
    set((state) => ({
      tunnels: state.tunnels.map((t) =>
        t.id === id ? { ...t, status: 'starting' as const } : t
      ),
    }))
    try {
      const res = await fetch(`/api/tunnels/start?id=${id}`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        set((state) => ({
          tunnels: state.tunnels.map((t) =>
            t.id === id
              ? { ...t, status: 'active' as const, startedAt: new Date(), errorMessage: undefined }
              : t
          ),
        }))
        toast.success(getToast('tunnelStarted'))
      } else {
        const data = await res.json()
        set((state) => ({
          tunnels: state.tunnels.map((t) =>
            t.id === id
              ? { ...t, status: 'error' as const, errorMessage: data.error || getToast('failedToStart') }
              : t
          ),
        }))
        toast.error(data.error || getToast('startFailed'))
      }
    } catch {
      set((state) => ({
        tunnels: state.tunnels.map((t) =>
          t.id === id ? { ...t, status: 'error' as const, errorMessage: getToast('networkError') } : t
        ),
      }))
      toast.error(getToast('startFailed'))
    }
  },

  stopTunnel: async (id) => {
    try {
      const res = await fetch(`/api/tunnels/stop?id=${id}`, { method: 'POST' })
      if (res.ok) {
        set((state) => ({
          tunnels: state.tunnels.map((t) =>
            t.id === id
              ? { ...t, status: 'stopped' as const, startedAt: undefined, errorMessage: undefined }
              : t
          ),
        }))
        toast.success(getToast('tunnelStopped'))
      } else {
        toast.error(getToast('stopFailed'))
      }
    } catch {
      toast.error(getToast('stopFailed'))
    }
  },

  subscribeToTunnelEvents: () => {
    realtimeSubscribers += 1

    if (!realtimeSocket) {
      realtimeSocket = io(TUNNEL_SERVICE_URL, {
        path: '/socket.io',
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        timeout: 10000,
      })

      realtimeSocket.on('tunnel:status-update', (stats: TunnelServiceStats[]) => {
        hasServiceSnapshot = true
        latestServiceStats = new Map(stats.map((stat) => [stat.id, stat]))

        set((state) => ({
          tunnels: mergeServiceStats(state.tunnels),
        }))
      })

      realtimeSocket.on('tunnel:started', (data: { id: string }) => {
        latestServiceStats.set(data.id, {
          id: data.id,
          status: 'connected',
          startedAt: new Date().toISOString(),
          error: null,
        })
        set((state) => ({
          tunnels: state.tunnels.map((tunnel) =>
            tunnel.id === data.id
              ? { ...tunnel, status: 'active' as const, startedAt: new Date(), errorMessage: undefined }
              : tunnel
          ),
        }))
      })

      realtimeSocket.on('tunnel:stopped', (data: { id: string }) => {
        latestServiceStats.set(data.id, {
          id: data.id,
          status: 'disconnected',
          startedAt: null,
          error: null,
        })
        set((state) => ({
          tunnels: state.tunnels.map((tunnel) =>
            tunnel.id === data.id
              ? { ...tunnel, status: 'stopped' as const, startedAt: undefined, errorMessage: undefined }
              : tunnel
          ),
        }))
      })

      realtimeSocket.on('tunnel:error', (data: { id: string; error: string }) => {
        latestServiceStats.set(data.id, {
          id: data.id,
          status: 'error',
          startedAt: null,
          error: data.error,
        })
        set((state) => ({
          tunnels: state.tunnels.map((tunnel) =>
            tunnel.id === data.id
              ? { ...tunnel, status: 'error' as const, errorMessage: data.error }
              : tunnel
          ),
        }))
      })
    }

    realtimeSocket.emit('tunnel:status')

    return () => {
      realtimeSubscribers = Math.max(0, realtimeSubscribers - 1)
      if (realtimeSubscribers === 0 && realtimeSocket) {
        realtimeSocket.disconnect()
        realtimeSocket = null
      }
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
}))
