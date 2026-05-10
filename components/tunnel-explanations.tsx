'use client'

import { motion } from 'framer-motion'
import { Terminal, BookOpen, Lightbulb, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from '@/lib/i18n'

interface TunnelExplanationProps {
  type: 'local' | 'remote' | 'dynamic'
}

export function TunnelExplanation({ type }: TunnelExplanationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {type === 'local' && <LocalExplanation />}
      {type === 'remote' && <RemoteExplanation />}
      {type === 'dynamic' && <DynamicExplanation />}
    </motion.div>
  )
}

function CodeBlock({ command }: { command: string }) {
  return (
    <div className="relative group">
      <div className="bg-zinc-950 dark:bg-zinc-900 rounded-lg p-4 font-mono text-sm overflow-x-auto border border-zinc-800">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-zinc-500 text-xs ml-2">Terminal</span>
        </div>
        <code className="text-emerald-400">
          <span className="text-zinc-500">$</span> {command}
        </code>
      </div>
    </div>
  )
}

function LocalExplanation() {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <Card className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Terminal className="size-4 text-emerald-600 dark:text-emerald-400" />
            {t('explanations').commandSyntax}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock command="ssh -L [local_port]:[remote_host]:[remote_port] [user]@[ssh_server]" />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="size-4 text-blue-600 dark:text-blue-400" />
              {t('explanations').howItWorks}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              {t('explanations').localHowIt1}
            </p>
            <p>
              {t('explanations').localHowIt2} <code className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded text-xs">localhost:[local_port]</code>{t('explanations').localHowIt2b} <code className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded text-xs">[remote_host]:[remote_port]</code>.
            </p>
            <div className="flex items-center gap-2 text-xs mt-3 p-2 bg-muted/50 rounded-md">
              <span className="font-medium text-foreground">{t('explanations').flow}</span>
              <span>App</span>
              <ArrowRight className="size-3" />
              <span>localhost:PORT</span>
              <ArrowRight className="size-3" />
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">SSH Tunnel</span>
              <ArrowRight className="size-3" />
              <span>remote:PORT</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="size-4 text-amber-600 dark:text-amber-400" />
              {t('explanations').useCases}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">&#x2022;</span>
                <span>{t('explanations').localCase1}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">&#x2022;</span>
                <span>{t('explanations').localCase2}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">&#x2022;</span>
                <span>{t('explanations').localCase3}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">&#x2022;</span>
                <span>{t('explanations').localCase4}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function RemoteExplanation() {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <Card className="border-violet-200 dark:border-violet-900/50 bg-violet-50/50 dark:bg-violet-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Terminal className="size-4 text-violet-600 dark:text-violet-400" />
            {t('explanations').commandSyntax}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock command="ssh -R [remote_port]:[local_host]:[local_port] [user]@[ssh_server]" />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="size-4 text-blue-600 dark:text-blue-400" />
              {t('explanations').howItWorks}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              {t('explanations').remoteHowIt1}
            </p>
            <p>
              {t('explanations').remoteHowIt2} <code className="text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 px-1.5 py-0.5 rounded text-xs">[remote_port]</code>{t('explanations').remoteHowIt2b} <code className="text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 px-1.5 py-0.5 rounded text-xs">[local_host]:[local_port]</code>.
            </p>
            <div className="flex items-center gap-2 text-xs mt-3 p-2 bg-muted/50 rounded-md">
              <span className="font-medium text-foreground">{t('explanations').flow}</span>
              <span>Clients</span>
              <ArrowRight className="size-3" />
              <span>remote:PORT</span>
              <ArrowRight className="size-3" />
              <span className="text-violet-600 dark:text-violet-400 font-medium">SSH Tunnel</span>
              <ArrowRight className="size-3" />
              <span>localhost:PORT</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="size-4 text-amber-600 dark:text-amber-400" />
              {t('explanations').useCases}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-0.5">&#x2022;</span>
                <span>{t('explanations').remoteCase1}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-0.5">&#x2022;</span>
                <span>{t('explanations').remoteCase2}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-0.5">&#x2022;</span>
                <span>{t('explanations').remoteCase3}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-0.5">&#x2022;</span>
                <span>{t('explanations').remoteCase4}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DynamicExplanation() {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <Card className="border-cyan-200 dark:border-cyan-900/50 bg-cyan-50/50 dark:bg-cyan-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Terminal className="size-4 text-cyan-600 dark:text-cyan-400" />
            {t('explanations').commandSyntax}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock command="ssh -D [local_port] [user]@[ssh_server]" />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="size-4 text-blue-600 dark:text-blue-400" />
              {t('explanations').howItWorks}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              {t('explanations').dynamicHowIt1} <code className="text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/30 px-1.5 py-0.5 rounded text-xs">localhost:[local_port]</code>.
            </p>
            <p>
              {t('explanations').dynamicHowIt2}
            </p>
            <div className="flex items-center gap-2 text-xs mt-3 p-2 bg-muted/50 rounded-md">
              <span className="font-medium text-foreground">{t('explanations').flow}</span>
              <span>Any App</span>
              <ArrowRight className="size-3" />
              <span className="text-cyan-600 dark:text-cyan-400 font-medium">SOCKS Proxy</span>
              <ArrowRight className="size-3" />
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">SSH Tunnel</span>
              <ArrowRight className="size-3" />
              <span>Server → Internet</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="size-4 text-amber-600 dark:text-amber-400" />
              {t('explanations').useCases}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-0.5">&#x2022;</span>
                <span>{t('explanations').dynamicCase1}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-0.5">&#x2022;</span>
                <span>{t('explanations').dynamicCase2}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-0.5">&#x2022;</span>
                <span>{t('explanations').dynamicCase3}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-0.5">&#x2022;</span>
                <span>{t('explanations').dynamicCase4}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
