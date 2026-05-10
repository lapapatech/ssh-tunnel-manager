'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Square,
  Trash2,
  Copy,
  AlertCircle,
  Clock,
  Globe,
  ArrowRightLeft,
  Network,
  Loader2,
  Server,
  Wifi,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useTunnelStore, type Tunnel } from '@/lib/tunnel-store'
import { useTranslation } from '@/lib/i18n'
import { toast } from 'sonner'

interface TunnelListProps {
  type: 'local' | 'remote' | 'dynamic'
}

function StatusDot({ status }: { status: Tunnel['status'] }) {
  const colors: Record<Tunnel['status'], string> = {
    stopped: 'bg-zinc-400 dark:bg-zinc-500',
    starting: 'bg-amber-400 dark:bg-amber-500 animate-pulse',
    active: 'bg-emerald-500 dark:bg-emerald-400',
    error: 'bg-red-500 dark:bg-red-400',
  }
  return <span className={`inline-block size-2.5 rounded-full ${colors[status]}`} />
}

function StatusBadge({ status }: { status: Tunnel['status'] }) {
  const { t } = useTranslation()
  const statusLabels: Record<Tunnel['status'], string> = {
    stopped: t('list').stopped,
    starting: t('list').starting,
    active: t('list').activeStatus,
    error: t('list').error,
  }
  const variants: Record<Tunnel['status'], string> = {
    stopped: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
    starting: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${variants[status]}`}>
      <StatusDot status={status} />
      {statusLabels[status]}
    </span>
  )
}

function TypeBadge({ type }: { type: Tunnel['type'] }) {
  const variants: Record<Tunnel['type'], { label: string; className: string; icon: React.ReactNode }> = {
    local: {
      label: 'Local',
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      icon: <ArrowRightLeft className="size-3" />,
    },
    remote: {
      label: 'Remote',
      className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-violet-200 dark:border-violet-800',
      icon: <Globe className="size-3" />,
    },
    dynamic: {
      label: 'SOCKS',
      className: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
      icon: <Network className="size-3" />,
    },
  }
  const v = variants[type]
  return (
    <Badge variant="outline" className={`gap-1 ${v.className}`}>
      {v.icon}
      {v.label}
    </Badge>
  )
}

function getTunnelCommand(tunnel: Tunnel): string {
  switch (tunnel.type) {
    case 'local':
      return `ssh -L ${tunnel.localPort}:${tunnel.remoteBindAddr || 'localhost'}:${tunnel.remotePort} ${tunnel.sshUser}@${tunnel.sshHost} -p ${tunnel.sshPort}`
    case 'remote':
      return `ssh -R ${tunnel.remotePort}:${tunnel.localBindAddr}:${tunnel.localPort} ${tunnel.sshUser}@${tunnel.sshHost} -p ${tunnel.sshPort}`
    case 'dynamic':
      return `ssh -D ${tunnel.localPort} ${tunnel.sshUser}@${tunnel.sshHost} -p ${tunnel.sshPort}`
  }
}

function getPortMapping(tunnel: Tunnel): string {
  switch (tunnel.type) {
    case 'local':
      return `${tunnel.localBindAddr}:${tunnel.localPort} → ${tunnel.remoteBindAddr || 'localhost'}:${tunnel.remotePort}`
    case 'remote':
      return `${tunnel.remoteBindAddr || 'localhost'}:${tunnel.remotePort} → ${tunnel.localBindAddr}:${tunnel.localPort}`
    case 'dynamic':
      return `SOCKS5 ${tunnel.localBindAddr}:${tunnel.localPort}`
  }
}

function TunnelCard({ tunnel }: { tunnel: Tunnel }) {
  const { startTunnel, stopTunnel, removeTunnel } = useTunnelStore()
  const { t } = useTranslation()

  const handleCopyCommand = () => {
    const cmd = getTunnelCommand(tunnel)
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(cmd)
    } else {
      const ta = document.createElement('textarea')
      ta.value = cmd
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    toast.success(t('toasts').commandCopied)
  }

  const isActive = tunnel.status === 'active'
  const isStarting = tunnel.status === 'starting'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`overflow-hidden transition-colors ${
        tunnel.status === 'active'
          ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/30 dark:bg-emerald-950/10'
          : tunnel.status === 'error'
          ? 'border-red-200 dark:border-red-800/50 bg-red-50/30 dark:bg-red-950/10'
          : ''
      }`}>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            {/* Left side - Info */}
            <div className="space-y-2 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-sm truncate">{tunnel.name}</h3>
                <TypeBadge type={tunnel.type} />
                <StatusBadge status={tunnel.status} />
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Server className="size-3 shrink-0" />
                <span className="truncate">{tunnel.sshUser}@{tunnel.sshHost}:{tunnel.sshPort}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Wifi className="size-3 shrink-0" />
                <code className="text-xs bg-muted/60 px-1.5 py-0.5 rounded truncate">
                  {getPortMapping(tunnel)}
                </code>
              </div>

              {tunnel.startedAt && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3 shrink-0" />
                  <span>{t('list').started} {new Date(tunnel.startedAt).toLocaleTimeString()}</span>
                </div>
              )}

              {tunnel.status === 'error' && tunnel.errorMessage && (
                <div className="flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-2 rounded-md mt-1">
                  <AlertCircle className="size-3 shrink-0 mt-0.5" />
                  <span>{tunnel.errorMessage}</span>
                </div>
              )}
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {isActive ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => stopTunnel(tunnel.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  <Square className="size-3.5" />
                  {t('list').stop}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startTunnel(tunnel.id)}
                  disabled={isStarting}
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                >
                  {isStarting ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Play className="size-3.5" />
                  )}
                  {isStarting ? t('list').startingBtn : t('list').start}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={handleCopyCommand}
                title={t('list').copyCommand}
              >
                <Copy className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeTunnel(tunnel.id)}
                title={t('list').deleteTunnel}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function EmptyState({ type }: { type: Tunnel['type'] }) {
  const { t } = useTranslation()

  const messages: Record<Tunnel['type'], { title: string; description: string }> = {
    local: {
      title: t('list').noLocalTitle,
      description: t('list').noLocalDesc,
    },
    remote: {
      title: t('list').noRemoteTitle,
      description: t('list').noRemoteDesc,
    },
    dynamic: {
      title: t('list').noDynamicTitle,
      description: t('list').noDynamicDesc,
    },
  }
  const msg = messages[type]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Network className="size-7 text-muted-foreground/50" />
      </div>
      <h3 className="font-medium text-sm text-muted-foreground mb-1">{msg.title}</h3>
      <p className="text-xs text-muted-foreground/70 max-w-xs">{msg.description}</p>
    </motion.div>
  )
}

export function TunnelList({ type }: TunnelListProps) {
  const allTunnels = useTunnelStore((state) => state.tunnels)
  const tunnels = useMemo(() => allTunnels.filter((t) => t.type === type), [allTunnels, type])
  const { t } = useTranslation()

  if (tunnels.length === 0) {
    return <EmptyState type={type} />
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {t('list').tunnels} ({tunnels.length})
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <StatusDot status="active" /> {t('list').active}: {tunnels.filter(t => t.status === 'active').length}
          </span>
        </div>
      </div>
      <Separator />
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
        <AnimatePresence mode="popLayout">
          {tunnels.map((tunnel) => (
            <TunnelCard key={tunnel.id} tunnel={tunnel} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
