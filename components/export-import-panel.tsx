'use client'

import { useState, useRef } from 'react'
import { Download, Upload, FileJson, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useTunnelStore, type Tunnel } from '@/lib/tunnel-store'
import { useTranslation } from '@/lib/i18n'
import { toast } from 'sonner'

interface TunnelExportData {
  version: string
  exportedAt: string
  tunnels: Array<{
    name: string
    type: Tunnel['type']
    sshHost: string
    sshPort: number
    sshUser: string
    localBindAddr: string
    localPort: number
    remoteBindAddr?: string
    remotePort?: number
  }>
}

export function ExportImportPanel() {
  const { tunnels, addTunnel } = useTunnelStore()
  const { t } = useTranslation()
  const [overwrite, setOverwrite] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    if (tunnels.length === 0) {
      toast.error(t('export.noTunnels'))
      return
    }

    const exportData: TunnelExportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tunnels: tunnels.map(({ name, type, sshHost, sshPort, sshUser, localBindAddr, localPort, remoteBindAddr, remotePort }) => ({
        name,
        type,
        sshHost,
        sshPort,
        sshUser,
        localBindAddr,
        localPort,
        remoteBindAddr,
        remotePort,
      })),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ssh-tunnels-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success(`${tunnels.length} ${t('export.exportedCount')}`)
  }

  const processImport = async (file: File) => {
    setIsImporting(true)
    try {
      const text = await file.text()
      let data: TunnelExportData

      try {
        data = JSON.parse(text)
      } catch {
        toast.error(t('export.invalidFile'))
        return
      }

      if (!data.tunnels || !Array.isArray(data.tunnels)) {
        toast.error(t('export.invalidFile'))
        return
      }

      let imported = 0

      for (const tunnelData of data.tunnels) {
        if (!tunnelData.name || !tunnelData.type || !tunnelData.sshHost || !tunnelData.sshUser) {
          continue
        }

        if (overwrite) {
          const existing = tunnels.find((t) => t.name === tunnelData.name)
          if (existing) {
            await useTunnelStore.getState().removeTunnel(existing.id)
          }
        } else {
          const existing = tunnels.find((t) => t.name === tunnelData.name)
          if (existing) {
            continue
          }
        }

        await addTunnel({
          name: tunnelData.name,
          type: tunnelData.type,
          sshHost: tunnelData.sshHost,
          sshPort: tunnelData.sshPort || 22,
          sshUser: tunnelData.sshUser,
          localBindAddr: tunnelData.localBindAddr || '127.0.0.1',
          localPort: tunnelData.localPort || 8080,
          remoteBindAddr: tunnelData.remoteBindAddr,
          remotePort: tunnelData.remotePort,
        })
        imported++
      }

      if (imported > 0) {
        toast.success(`${imported} ${t('export.importedCount')}`)
      } else {
        toast.error(t('export.importFailed'))
      }
    } catch {
      toast.error(t('export.importFailed'))
    } finally {
      setIsImporting(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processImport(file)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.name.endsWith('.json')) {
      processImport(file)
    } else {
      toast.error(t('export.invalidFile'))
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileJson className="size-4 text-amber-600 dark:text-amber-400" />
          {t('export.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{t('export.exportBtn')}</p>
              <p className="text-xs text-muted-foreground">{t('export.exportDesc')}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={tunnels.length === 0}
              className="shrink-0 gap-1.5"
            >
              <Download className="size-3.5" />
              <span className="hidden sm:inline">{t('export.exportBtn')}</span>
            </Button>
          </div>
          {tunnels.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {tunnels.length} {t('export.exportedCount')}
            </p>
          )}
        </div>

        <Separator />

        {/* Import */}
        <div className="space-y-3">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">{t('export.importBtn')}</p>
            <p className="text-xs text-muted-foreground">{t('export.importDesc')}</p>
          </div>

          {/* Overwrite toggle */}
          <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-muted/50">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium cursor-pointer">{t('export.overwrite')}</Label>
              <p className="text-xs text-muted-foreground">{t('export.overwriteDesc')}</p>
            </div>
            <Switch
              checked={overwrite}
              onCheckedChange={setOverwrite}
            />
          </div>

          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
              ${isDragging
                ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }
            `}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <AnimatePresence mode="wait">
              {isImporting ? (
                <motion.div
                  key="importing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="size-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                  <p className="text-xs text-muted-foreground">{t('export.importBtn')}...</p>
                </motion.div>
              ) : isDragging ? (
                <motion.div
                  key="dragging"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-2"
                >
                  <Upload className="size-8 text-emerald-500" />
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    {t('export.importBtn')}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-2"
                >
                  <Upload className="size-8 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">
                    .json
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-start gap-2 p-2 rounded-md bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
            <p className="text-xs">
              {t('export.importDesc')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
