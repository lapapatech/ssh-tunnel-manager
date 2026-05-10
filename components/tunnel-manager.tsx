'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Network, ArrowRightLeft, Globe, Radio, Shield } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useTunnelStore } from '@/lib/tunnel-store'
import { useTranslation } from '@/lib/i18n'
import { LocalForwardingDiagram, RemoteForwardingDiagram, DynamicForwardingDiagram } from '@/components/tunnel-diagrams'
import { TunnelExplanation } from '@/components/tunnel-explanations'
import { TunnelForm } from '@/components/tunnel-form'
import { TunnelList } from '@/components/tunnel-list'
import { LanguageSelector } from '@/components/language-selector'
import { ExportImportPanel } from '@/components/export-import-panel'

export function TunnelManager() {
  const { activeTab, setActiveTab, fetchTunnels, tunnels } = useTunnelStore()
  const { t } = useTranslation()

  useEffect(() => {
    fetchTunnels()
  }, [fetchTunnels])

  const activeCount = tunnels.filter(t => t.status === 'active').length

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-emerald-600 dark:bg-emerald-700 flex items-center justify-center">
                <Network className="size-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">{t('header.title')}</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">{t('header.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {activeCount > 0 && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium"
                >
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  {activeCount} {activeCount > 1 ? t('header.activePlural') : t('header.active')}
                </motion.div>
              )}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                <Shield className="size-3" />
                <span className="hidden sm:inline">{t('header.encrypted')}</span>
              </div>
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex h-10 p-1">
            <TabsTrigger value="local" className="gap-1.5 text-xs sm:text-sm">
              <ArrowRightLeft className="size-3.5 sm:size-4" />
              <span>{t('tabs.local')}</span>
            </TabsTrigger>
            <TabsTrigger value="remote" className="gap-1.5 text-xs sm:text-sm">
              <Globe className="size-3.5 sm:size-4" />
              <span>{t('tabs.remote')}</span>
            </TabsTrigger>
            <TabsTrigger value="dynamic" className="gap-1.5 text-xs sm:text-sm">
              <Radio className="size-3.5 sm:size-4" />
              <span>{t('tabs.dynamic')}</span>
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {/* LOCAL TAB */}
            {activeTab === 'local' && (
              <motion.div
                key="local"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Diagram */}
                <Card className="overflow-hidden border-emerald-200/50 dark:border-emerald-800/30">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowRightLeft className="size-4 text-emerald-600 dark:text-emerald-400" />
                      <h2 className="text-sm font-semibold">{t('diagrams.localTitle')}</h2>
                    </div>
                    <div className="bg-muted/30 dark:bg-muted/10 rounded-lg p-4">
                      <LocalForwardingDiagram />
                    </div>
                  </CardContent>
                </Card>

                {/* Explanation */}
                <TunnelExplanation type="local" />

                {/* Form + List Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <TunnelForm type="local" />
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <TunnelList type="local" />
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* REMOTE TAB */}
            {activeTab === 'remote' && (
              <motion.div
                key="remote"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Diagram */}
                <Card className="overflow-hidden border-violet-200/50 dark:border-violet-800/30">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="size-4 text-violet-600 dark:text-violet-400" />
                      <h2 className="text-sm font-semibold">{t('diagrams.remoteTitle')}</h2>
                    </div>
                    <div className="bg-muted/30 dark:bg-muted/10 rounded-lg p-4">
                      <RemoteForwardingDiagram />
                    </div>
                  </CardContent>
                </Card>

                {/* Explanation */}
                <TunnelExplanation type="remote" />

                {/* Form + List Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <TunnelForm type="remote" />
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <TunnelList type="remote" />
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* DYNAMIC TAB */}
            {activeTab === 'dynamic' && (
              <motion.div
                key="dynamic"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Diagram */}
                <Card className="overflow-hidden border-cyan-200/50 dark:border-cyan-800/30">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Radio className="size-4 text-cyan-600 dark:text-cyan-400" />
                      <h2 className="text-sm font-semibold">{t('diagrams.dynamicTitle')}</h2>
                    </div>
                    <div className="bg-muted/30 dark:bg-muted/10 rounded-lg p-4">
                      <DynamicForwardingDiagram />
                    </div>
                  </CardContent>
                </Card>

                {/* Explanation */}
                <TunnelExplanation type="dynamic" />

                {/* Form + List Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <TunnelForm type="dynamic" />
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <TunnelList type="dynamic" />
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Tabs>

        {/* Export / Import Section */}
        <Separator className="my-2" />
        <ExportImportPanel />
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Network className="size-3.5" />
              <span>{t('header.title')}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>{t('footer.madeWith')}</span>
              <Separator orientation="vertical" className="h-3" />
              <span className="flex items-center gap-1">
                <Shield className="size-3" />
                {t('footer.secureAndEncrypted')}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
