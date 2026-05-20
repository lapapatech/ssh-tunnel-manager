'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from '@/lib/i18n'
import { DeploymentManager } from '@/components/deployment-manager'
import { TunnelManager } from '@/components/tunnel-manager'
import { AdvancedTunnelTechniques } from '@/components/advanced-tunnel-techniques'
import { PayloadGenerator } from '@/components/payload-generator'

export function MainTabs() {
  const { t } = useTranslation()

  return (
    <Tabs defaultValue="tunnels" className="w-full">
      <TabsList className="grid w-full max-w-3xl grid-cols-4">
        <TabsTrigger value="tunnels">{t('navigation.tunnels')}</TabsTrigger>
        <TabsTrigger value="deployments">{t('navigation.deployer')}</TabsTrigger>
        <TabsTrigger value="advanced">{t('navigation.advancedTechniques')}</TabsTrigger>
        <TabsTrigger value="payloads">{t('navigation.payloads')}</TabsTrigger>
      </TabsList>
      <TabsContent value="tunnels" className="mt-4">
        <TunnelManager />
      </TabsContent>
      <TabsContent value="deployments" className="mt-4">
        <DeploymentManager />
      </TabsContent>
      <TabsContent value="advanced" className="mt-4">
        <AdvancedTunnelTechniques />
      </TabsContent>
      <TabsContent value="payloads" className="mt-4">
        <PayloadGenerator />
      </TabsContent>
    </Tabs>
  )
}
