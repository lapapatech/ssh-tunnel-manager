'use client'

import { create } from 'zustand'
import { toast } from 'sonner'
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
        set({ tunnels: data.tunnels || [], isLoading: false })
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
      const res = await fetch(`/api/tunnels?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        set((state) => ({
          tunnels: state.tunnels.filter((t) => t.id !== id),
        }))
        toast.success(getToast('tunnelDeleted'))
      } else {
        toast.error(getToast('deleteFailed'))
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

  setActiveTab: (tab) => set({ activeTab: tab }),
}))
