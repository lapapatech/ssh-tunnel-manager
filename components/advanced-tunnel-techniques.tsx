'use client'

import { useState, useCallback } from 'react'
import { CheckCircle2, CircleAlert, Copy, CircleArrowRight, ShieldCheck, Server, SlidersHorizontal, Play, Loader2, Shield, ShieldAlert, ShieldMinus, Monitor, Smartphone, Terminal, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useTranslation } from '@/lib/i18n'

type SupportState = 'Ejecutable' | 'Documentado'

interface CommandEntry {
  labelKey: string
  command: string
}

type OSName = 'linux' | 'windows' | 'android'

interface GoldenRules {
  tlsAvailable: boolean
  sniSpoofable: boolean
  jitterConfigurable: boolean
  usesPort443: boolean
  notMixedProtocol: boolean
}

interface TechniqueEntry {
  id: string
  nameKey: string
  descriptionKey: string
  support: SupportState
  binaryKey: string
  recommendedKey: string
  useCaseKeys: string[]
  limitationKeys: string[]
  commands: CommandEntry[]
  goldenRules: GoldenRules
  osUseCases: Record<OSName, string[]>
}

interface ExecutionSupportRow {
  techniqueKey: string
  categoryKey: string
  state: SupportState
  noteKey: string
}

function goldenScore(rules: GoldenRules): number {
  return [rules.tlsAvailable, rules.sniSpoofable, rules.jitterConfigurable, rules.usesPort443, rules.notMixedProtocol].filter(Boolean).length
}

function goldenTier(score: number): 'green' | 'amber' | 'red' {
  if (score >= 4) return 'green'
  if (score >= 2) return 'amber'
  return 'red'
}

function GoldenIndicator({ rules }: { rules: GoldenRules }) {
  const score = goldenScore(rules)
  const tier = goldenTier(score)
  const labels = { green: 'Sigiloso', amber: 'Mejorable', red: 'Ruidoso' }
  const icons = {
    green: <Shield className="size-3.5" />,
    amber: <ShieldMinus className="size-3.5" />,
    red: <ShieldAlert className="size-3.5" />,
  }
  const colors = {
    green: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700',
    amber: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700',
    red: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700',
  }
  return (
    <Badge variant="outline" className={`flex items-center gap-1 ${colors[tier]}`}>
      {icons[tier]}
      {labels[tier]} ({score}/5)
    </Badge>
  )
}

const OS_ICONS: Record<OSName, React.ReactNode> = {
  linux: <Terminal className="size-3.5" />,
  windows: <Monitor className="size-3.5" />,
  android: <Smartphone className="size-3.5" />,
}

const OS_LABEL_KEYS: Record<OSName, string> = {
  linux: 'advanced.os.linux',
  windows: 'advanced.os.windows',
  android: 'advanced.os.android',
}

const techniques: TechniqueEntry[] = [
  {
    id: 'wstunnel',
    nameKey: 'advanced.techniques.wstunnel.name',
    descriptionKey: 'advanced.techniques.wstunnel.description',
    support: 'Ejecutable',
    binaryKey: 'advanced.techniques.wstunnel.binary',
    recommendedKey: 'advanced.techniques.wstunnel.recommended',
    useCaseKeys: [
      'advanced.techniques.wstunnel.useCase1',
      'advanced.techniques.wstunnel.useCase2',
      'advanced.techniques.wstunnel.useCase3',
    ],
    limitationKeys: [
      'advanced.techniques.wstunnel.limitation1',
      'advanced.techniques.wstunnel.limitation2',
      'advanced.techniques.wstunnel.limitation3',
    ],
    commands: [
      {
        labelKey: 'advanced.techniques.wstunnel.cmdServer',
        command: 'wstunnel server wss://0.0.0.0:443 --restrict-to localhost:22',
      },
      {
        labelKey: 'advanced.techniques.wstunnel.cmdClient',
        command: 'wstunnel client --tls-sni-override google.com -L 2222:localhost:22 wss://VPS:443',
      },
    ],
    goldenRules: { tlsAvailable: true, sniSpoofable: true, jitterConfigurable: false, usesPort443: true, notMixedProtocol: true },
    osUseCases: {
      linux: [
        'wstunnel_linux_1',
        'wstunnel_linux_2',
      ],
      windows: [
        'wstunnel_windows_1',
      ],
      android: [
        'wstunnel_android_1',
      ],
    },
  },
  {
    id: 'chisel',
    nameKey: 'advanced.techniques.chisel.name',
    descriptionKey: 'advanced.techniques.chisel.description',
    support: 'Ejecutable',
    binaryKey: 'advanced.techniques.chisel.binary',
    recommendedKey: 'advanced.techniques.chisel.recommended',
    useCaseKeys: [
      'advanced.techniques.chisel.useCase1',
      'advanced.techniques.chisel.useCase2',
      'advanced.techniques.chisel.useCase3',
    ],
    limitationKeys: [
      'advanced.techniques.chisel.limitation1',
      'advanced.techniques.chisel.limitation2',
      'advanced.techniques.chisel.limitation3',
    ],
    commands: [
      {
        labelKey: 'advanced.techniques.chisel.cmdRelayServer',
        command: 'chisel server --host 0.0.0.0 --port 443 --reverse --tls-key key.pem --tls-cert cert.pem',
      },
      {
        labelKey: 'advanced.techniques.chisel.cmdClientReverse',
        command: 'chisel client --tls VPS:443 R:socks',
      },
      {
        labelKey: 'advanced.techniques.chisel.cmdClientSocks',
        command: 'chisel client --tls VPS:443 socks',
      },
    ],
    goldenRules: { tlsAvailable: true, sniSpoofable: false, jitterConfigurable: false, usesPort443: true, notMixedProtocol: true },
    osUseCases: {
      linux: ['chisel_linux_1', 'chisel_linux_2'],
      windows: ['chisel_windows_1', 'chisel_windows_2'],
      android: ['chisel_android_1'],
    },
  },
  {
    id: 'quic',
    nameKey: 'advanced.techniques.quic.name',
    descriptionKey: 'advanced.techniques.quic.description',
    support: 'Ejecutable',
    binaryKey: 'advanced.techniques.quic.binary',
    recommendedKey: 'advanced.techniques.quic.recommended',
    useCaseKeys: [
      'advanced.techniques.quic.useCase1',
      'advanced.techniques.quic.useCase2',
      'advanced.techniques.quic.useCase3',
    ],
    limitationKeys: [
      'advanced.techniques.quic.limitation1',
      'advanced.techniques.quic.limitation2',
      'advanced.techniques.quic.limitation3',
    ],
    commands: [
      {
        labelKey: 'advanced.techniques.quic.cmdServer',
        command: 'hysteria server -c /etc/hysteria/server.yaml',
      },
      {
        labelKey: 'advanced.techniques.quic.cmdClient',
        command: 'hysteria client -c /etc/hysteria/client.yaml',
      },
      {
        labelKey: 'advanced.techniques.quic.cmdAcl',
        command: 'hysteria://VPS:443?insecure=0&sni=google.com',
      },
    ],
    goldenRules: { tlsAvailable: true, sniSpoofable: true, jitterConfigurable: true, usesPort443: true, notMixedProtocol: true },
    osUseCases: {
      linux: ['quic_linux_1'],
      windows: ['quic_windows_1'],
      android: ['quic_android_1'],
    },
  },
  {
    id: 'frp',
    nameKey: 'advanced.techniques.frp.name',
    descriptionKey: 'advanced.techniques.frp.description',
    support: 'Ejecutable',
    binaryKey: 'advanced.techniques.frp.binary',
    recommendedKey: 'advanced.techniques.frp.recommended',
    useCaseKeys: [
      'advanced.techniques.frp.useCase1',
      'advanced.techniques.frp.useCase2',
      'advanced.techniques.frp.useCase3',
    ],
    limitationKeys: [
      'advanced.techniques.frp.limitation1',
      'advanced.techniques.frp.limitation2',
      'advanced.techniques.frp.limitation3',
    ],
    commands: [
      {
        labelKey: 'advanced.techniques.frp.cmdServerIni',
        command: '[common]\nbind_port = 7000\ntls_enable = true\ntls_cert_file = /etc/frp/server.crt\ntls_key_file = /etc/frp/server.key\n\n[reverse_ssh]\ntype = tcp\nlocal_ip = 127.0.0.1\nlocal_port = 22\nremote_port = 2222',
      },
      {
        labelKey: 'advanced.techniques.frp.cmdRun',
        command: 'frps -c frps.ini    # servidor\nfrpc -c frpc.ini    # cliente',
      },
    ],
    goldenRules: { tlsAvailable: true, sniSpoofable: false, jitterConfigurable: false, usesPort443: true, notMixedProtocol: true },
    osUseCases: {
      linux: ['frp_linux_1', 'frp_linux_2'],
      windows: ['frp_windows_1'],
      android: [],
    },
  },
  {
    id: 'ligolo',
    nameKey: 'advanced.techniques.ligolo.name',
    descriptionKey: 'advanced.techniques.ligolo.description',
    support: 'Ejecutable',
    binaryKey: 'advanced.techniques.ligolo.binary',
    recommendedKey: 'advanced.techniques.ligolo.recommended',
    useCaseKeys: [
      'advanced.techniques.ligolo.useCase1',
      'advanced.techniques.ligolo.useCase2',
      'advanced.techniques.ligolo.useCase3',
    ],
    limitationKeys: [
      'advanced.techniques.ligolo.limitation1',
      'advanced.techniques.ligolo.limitation2',
      'advanced.techniques.ligolo.limitation3',
    ],
    commands: [
      {
        labelKey: 'advanced.techniques.ligolo.cmdServer',
        command: 'ligolo-proxy -selfcert -laddr 0.0.0.0:11601',
      },
      {
        labelKey: 'advanced.techniques.ligolo.cmdAgent',
        command: 'ligolo-agent -connect VPS:11601 -ignore-cert',
      },
    ],
    goldenRules: { tlsAvailable: true, sniSpoofable: false, jitterConfigurable: false, usesPort443: false, notMixedProtocol: true },
    osUseCases: {
      linux: ['ligolo_linux_1', 'ligolo_linux_2'],
      windows: ['ligolo_windows_1', 'ligolo_windows_2'],
      android: [],
    },
  },
  {
    id: 'proxyjump',
    nameKey: 'advanced.techniques.proxyjump.name',
    descriptionKey: 'advanced.techniques.proxyjump.description',
    support: 'Ejecutable',
    binaryKey: 'advanced.techniques.proxyjump.binary',
    recommendedKey: 'advanced.techniques.proxyjump.recommended',
    useCaseKeys: [
      'advanced.techniques.proxyjump.useCase1',
      'advanced.techniques.proxyjump.useCase2',
      'advanced.techniques.proxyjump.useCase3',
    ],
    limitationKeys: [
      'advanced.techniques.proxyjump.limitation1',
      'advanced.techniques.proxyjump.limitation2',
      'advanced.techniques.proxyjump.limitation3',
    ],
    commands: [
      {
        labelKey: 'advanced.techniques.proxyjump.cmdChain',
        command: 'ssh -J user@bastion:22 user@target',
      },
      {
        labelKey: 'advanced.techniques.proxyjump.cmdMultiHop',
        command: 'ssh -J user@hop1:22,user@hop2:2222 user@target',
      },
      {
        labelKey: 'advanced.techniques.proxyjump.cmdWithTunnel',
        command: 'ssh -J user@bastion -L 8080:internal:80 user@target',
      },
    ],
    goldenRules: { tlsAvailable: false, sniSpoofable: false, jitterConfigurable: false, usesPort443: false, notMixedProtocol: false },
    osUseCases: {
      linux: ['proxyjump_linux_1', 'proxyjump_linux_2'],
      windows: ['proxyjump_windows_1'],
      android: ['proxyjump_android_1'],
    },
  },
  {
    id: 'autossh',
    nameKey: 'advanced.techniques.autossh.name',
    descriptionKey: 'advanced.techniques.autossh.description',
    support: 'Ejecutable',
    binaryKey: 'advanced.techniques.autossh.binary',
    recommendedKey: 'advanced.techniques.autossh.recommended',
    useCaseKeys: [
      'advanced.techniques.autossh.useCase1',
      'advanced.techniques.autossh.useCase2',
      'advanced.techniques.autossh.useCase3',
    ],
    limitationKeys: [
      'advanced.techniques.autossh.limitation1',
      'advanced.techniques.autossh.limitation2',
      'advanced.techniques.autossh.limitation3',
    ],
    commands: [
      {
        labelKey: 'advanced.techniques.autossh.cmdTemplate',
        command: 'autossh -M 0 -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -NT -R 2222:localhost:22 tunel@VPS',
      },
      {
        labelKey: 'advanced.techniques.autossh.cmdUnit',
        command: '[Unit]\nDescription=Network Connectivity Monitor\nAfter=network-online.target\n\n[Service]\nType=simple\nExecStart=/usr/bin/autossh -M 0 -NT -R 2222:localhost:22 tunel@VPS\nRestart=always\nRestartSec=30\nNice=19\nIOSchedulingClass=idle\n\n[Install]\nWantedBy=multi-user.target',
      },
    ],
    goldenRules: { tlsAvailable: false, sniSpoofable: false, jitterConfigurable: false, usesPort443: false, notMixedProtocol: false },
    osUseCases: {
      linux: ['autossh_linux_1', 'autossh_linux_2', 'autossh_linux_3'],
      windows: ['autossh_windows_1'],
      android: ['autossh_android_1'],
    },
  },
  {
    id: 'dns',
    nameKey: 'advanced.techniques.dns.name',
    descriptionKey: 'advanced.techniques.dns.description',
    support: 'Ejecutable',
    binaryKey: 'advanced.techniques.dns.binary',
    recommendedKey: 'advanced.techniques.dns.recommended',
    useCaseKeys: [
      'advanced.techniques.dns.useCase1',
      'advanced.techniques.dns.useCase2',
      'advanced.techniques.dns.useCase3',
    ],
    limitationKeys: [
      'advanced.techniques.dns.limitation1',
      'advanced.techniques.dns.limitation2',
      'advanced.techniques.dns.limitation3',
    ],
    commands: [
      {
        labelKey: 'advanced.techniques.dns.cmdServer',
        command: 'iodined -c -P password 10.0.0.1 tunel.midominio.com',
      },
      {
        labelKey: 'advanced.techniques.dns.cmdClient',
        command: 'iodine -f -P password tunel.midominio.com',
      },
    ],
    goldenRules: { tlsAvailable: false, sniSpoofable: false, jitterConfigurable: false, usesPort443: false, notMixedProtocol: false },
    osUseCases: {
      linux: ['dns_linux_1', 'dns_linux_2'],
      windows: [],
      android: [],
    },
  },
  {
    id: 'icmp',
    nameKey: 'advanced.techniques.icmp.name',
    descriptionKey: 'advanced.techniques.icmp.description',
    support: 'Ejecutable',
    binaryKey: 'advanced.techniques.icmp.binary',
    recommendedKey: 'advanced.techniques.icmp.recommended',
    useCaseKeys: [
      'advanced.techniques.icmp.useCase1',
      'advanced.techniques.icmp.useCase2',
      'advanced.techniques.icmp.useCase3',
    ],
    limitationKeys: [
      'advanced.techniques.icmp.limitation1',
      'advanced.techniques.icmp.limitation2',
      'advanced.techniques.icmp.limitation3',
    ],
    commands: [
      {
        labelKey: 'advanced.techniques.icmp.cmdServer',
        command: 'ptunnel-ng -s -p password',
      },
      {
        labelKey: 'advanced.techniques.icmp.cmdClient',
        command: 'ptunnel-ng -c -p password -r VPS',
      },
    ],
    goldenRules: { tlsAvailable: false, sniSpoofable: false, jitterConfigurable: false, usesPort443: false, notMixedProtocol: false },
    osUseCases: {
      linux: ['icmp_linux_1'],
      windows: [],
      android: [],
    },
  },
]

const executionSupportRows: ExecutionSupportRow[] = [
  { techniqueKey: 'advanced.supportRows.sshLocal', categoryKey: 'advanced.supportRows.categoryTunnelService', state: 'Ejecutable', noteKey: 'advanced.supportRows.noteEnabled' },
  { techniqueKey: 'advanced.supportRows.sshRemote', categoryKey: 'advanced.supportRows.categoryTunnelService', state: 'Ejecutable', noteKey: 'advanced.supportRows.noteEnabled' },
  { techniqueKey: 'advanced.supportRows.sshDynamic', categoryKey: 'advanced.supportRows.categoryTunnelService', state: 'Ejecutable', noteKey: 'advanced.supportRows.noteEnabled' },
  { techniqueKey: 'advanced.supportRows.deployer', categoryKey: 'advanced.supportRows.categoryAutossh', state: 'Ejecutable', noteKey: 'advanced.supportRows.noteDeployer' },
  { techniqueKey: 'advanced.supportRows.chisel', categoryKey: 'advanced.supportRows.categoryTunnelService', state: 'Ejecutable', noteKey: 'advanced.supportRows.noteNowExecutable' },
  { techniqueKey: 'advanced.supportRows.ligolo', categoryKey: 'advanced.supportRows.categoryTunnelService', state: 'Ejecutable', noteKey: 'advanced.supportRows.noteNowExecutable' },
  { techniqueKey: 'advanced.supportRows.dns', categoryKey: 'advanced.supportRows.categoryTunnelService', state: 'Ejecutable', noteKey: 'advanced.supportRows.noteNowExecutable' },
  { techniqueKey: 'advanced.supportRows.icmp', categoryKey: 'advanced.supportRows.categoryTunnelService', state: 'Ejecutable', noteKey: 'advanced.supportRows.noteNowExecutable' },
  { techniqueKey: 'advanced.supportRows.wstunnel', categoryKey: 'advanced.supportRows.categoryTunnelService', state: 'Ejecutable', noteKey: 'advanced.supportRows.noteNowExecutable' },
  { techniqueKey: 'advanced.supportRows.frp', categoryKey: 'advanced.supportRows.categoryTunnelService', state: 'Ejecutable', noteKey: 'advanced.supportRows.noteNowExecutable' },
  { techniqueKey: 'advanced.supportRows.quic', categoryKey: 'advanced.supportRows.categoryTunnelService', state: 'Ejecutable', noteKey: 'advanced.supportRows.noteNowExecutable' },
  { techniqueKey: 'advanced.supportRows.proxyjump', categoryKey: 'advanced.supportRows.categoryTunnelService', state: 'Ejecutable', noteKey: 'advanced.supportRows.noteNowExecutable' },
]

function supportBadgeClass(state: SupportState): string {
  if (state === 'Ejecutable') {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700'
  }
  return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700'
}

function copyCommand(command: string, label: string, t: (key: string) => string) {
  if (!navigator?.clipboard) {
    toast.error(t('advanced.toast.noClipboard'))
    return
  }

  void navigator.clipboard.writeText(command)
    .then(() => {
      toast.success(`${t('advanced.toast.commandCopied')} ${label}`)
    })
    .catch(() => {
      toast.error(t('advanced.toast.commandCopyFailed'))
    })
}

function CommandBlock({ command, t }: { command: CommandEntry; t: (key: string) => string }) {
  return (
    <div className="relative rounded-lg border bg-slate-950 text-slate-50 dark:bg-slate-900 border-slate-800">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-800 text-xs text-slate-400">
        <span>{t(command.labelKey)}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => copyCommand(command.command, t(command.labelKey), t)}
          className="h-7 px-2 text-slate-200 hover:bg-slate-800"
        >
          <Copy className="size-3.5" />
          <span className="ml-1.5">{t('advanced.action.copy')}</span>
        </Button>
      </div>
      <pre className="overflow-x-auto p-3 text-xs leading-relaxed whitespace-pre-wrap">
        <code>{command.command}</code>
      </pre>
    </div>
  )
}

const TECHNIQUE_BUILDERS: Record<string, (p: Record<string, string>) => string> = {
  proxyjump: (p) => {
    const jumpPort = p.jumpPort || '22'
    return `ssh -J ${p.jumpUser}@${p.jumpHost}:${jumpPort} ${p.destUser}@${p.destHost}`
  },
  autossh: (p) => {
    const sshPort = p.sshPort || '22'
    return `autossh -M 0 -NT -o ServerAliveInterval=30 -o ExitOnForwardFailure=yes -R ${p.remotePort}:127.0.0.1:${p.localPort} -p ${sshPort} ${p.sshUser}@${p.vpsHost}`
  },
  wstunnel: (p) => {
    const tls = p.useTLS === 'true' || p.useTLS === 'on'
    const proto = tls ? 'wss' : 'ws'
    const sni = p.sniOverride ? ` --tls-sni-override ${p.sniOverride}` : ''
    return `wstunnel client${sni} -L ${p.localPort || '2222'}:localhost:${p.remotePort || '22'} ${proto}://${p.vpsHost}:${p.customPort || '443'}`
  },
  chisel: (p) => {
    const tls = p.useTLS === 'true' || p.useTLS === 'on'
    const tlsFlag = tls ? ' --tls' : ''
    return `chisel client${tlsFlag} ${p.vpsHost}:${p.customPort || '443'} R:${p.remotePort || '1080'}:socks`
  },
  frp: (p) => {
    return `frpc -c frpc.ini -s ${p.vpsHost}:${p.customPort || '7000'}`
  },
  quic: (p) => {
    const sni = p.sniOverride ? `&sni=${p.sniOverride}` : ''
    return `hysteria://${p.vpsHost}:${p.customPort || '443'}?insecure=0${sni}`
  },
}

const COMMON_PARAM_FIELDS: Array<{ key: string; labelKey: string; required: boolean }> = [
  { key: 'sshHost', labelKey: 'advanced.execute.params.sshHost', required: true },
  { key: 'sshUser', labelKey: 'advanced.execute.params.sshUser', required: true },
  { key: 'sshPassword', labelKey: 'advanced.execute.params.sshPassword', required: false },
  { key: 'sshPort', labelKey: 'advanced.execute.params.sshPort', required: false },
]

const TECHNIQUE_PARAM_FIELDS: Record<string, Array<{ key: string; labelKey: string; required: boolean }>> = {
  proxyjump: [
    { key: 'jumpHost', labelKey: 'advanced.execute.params.jumpHost', required: true },
    { key: 'jumpPort', labelKey: 'advanced.execute.params.jumpPort', required: false },
    { key: 'jumpUser', labelKey: 'advanced.execute.params.jumpUser', required: true },
    { key: 'destHost', labelKey: 'advanced.execute.params.destHost', required: true },
    { key: 'destUser', labelKey: 'advanced.execute.params.destUser', required: true },
  ],
  autossh: [
    { key: 'vpsHost', labelKey: 'advanced.execute.params.vpsHost', required: true },
    { key: 'remotePort', labelKey: 'advanced.execute.params.remotePort', required: true },
    { key: 'localPort', labelKey: 'advanced.execute.params.localPort', required: true },
  ],
  wstunnel: [
    { key: 'vpsHost', labelKey: 'advanced.execute.params.vpsHost', required: true },
    { key: 'localPort', labelKey: 'advanced.execute.params.localPort', required: false },
    { key: 'remotePort', labelKey: 'advanced.execute.params.remotePort', required: false },
    { key: 'customPort', labelKey: 'advanced.execute.params.customPort', required: false },
  ],
  chisel: [
    { key: 'vpsHost', labelKey: 'advanced.execute.params.vpsHost', required: true },
    { key: 'remotePort', labelKey: 'advanced.execute.params.remotePort', required: false },
    { key: 'customPort', labelKey: 'advanced.execute.params.customPort', required: false },
  ],
  frp: [
    { key: 'vpsHost', labelKey: 'advanced.execute.params.vpsHost', required: true },
    { key: 'customPort', labelKey: 'advanced.execute.params.customPort', required: false },
  ],
  quic: [
    { key: 'vpsHost', labelKey: 'advanced.execute.params.vpsHost', required: true },
    { key: 'customPort', labelKey: 'advanced.execute.params.customPort', required: false },
  ],
}

function TechniqueExecuteDialog({
  technique,
  open,
  onOpenChange,
  t,
}: {
  technique: TechniqueEntry
  open: boolean
  onOpenChange: (open: boolean) => void
  t: (key: string) => string
}) {
  const [params, setParams] = useState<Record<string, string>>({})
  const [executing, setExecuting] = useState(false)

  const fields = TECHNIQUE_PARAM_FIELDS[technique.id] ?? []
  const builder = TECHNIQUE_BUILDERS[technique.id]
  // Dynamic Golden Rules — recalculados según toggles del diálogo
  const tlsActive = technique.goldenRules.tlsAvailable || params.useTLS === 'true' || params.useTLS === 'on'
  const sniActive = technique.goldenRules.sniSpoofable || (params.sniOverride && params.sniOverride.length > 0)
  const port443Active = technique.goldenRules.usesPort443 || params.customPort === '443'
  const dynamicRules: GoldenRules = {
    ...technique.goldenRules,
    tlsAvailable: tlsActive,
    sniSpoofable: sniActive,
    usesPort443: port443Active,
  }
  const handleExecute = useCallback(async () => {
    setExecuting(true)
    try {
      const command = builder ? builder(params) : technique.commands[0]?.command || ''
      const sshHost = params.sshHost || '127.0.0.1'
      const sshUser = params.sshUser || 'root'
      const sshPort = parseInt(params.sshPort || '22', 10)
      const sshPassword = params.sshPassword || undefined

      const createRes = await fetch('/api/tunnels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${technique.id}-${Date.now()}`,
          type: 'local',
          sshHost,
          sshPort,
          sshUser,
          sshPassword,
          localPort: parseInt(params.localPort || '3000', 10),
          remotePort: parseInt(params.remotePort || '22', 10),
          technique: technique.id,
          command,
        }),
      })

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({ error: `HTTP ${createRes.status}` }))
        throw new Error(err.error || `Create failed: HTTP ${createRes.status}`)
      }

      const { tunnel: created } = await createRes.json()

      const startRes = await fetch(`/api/tunnels/start?id=${encodeURIComponent(created.id)}`, {
        method: 'POST',
      })

      if (!startRes.ok) {
        const err = await startRes.json().catch(() => ({ error: `HTTP ${startRes.status}` }))
        throw new Error(err.error || `Start failed: HTTP ${startRes.status}`)
      }

      toast.success(t('advanced.execute.success') || 'Tunnel started successfully')
      onOpenChange(false)
      setParams({})
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('advanced.execute.failed'))
    } finally {
      setExecuting(false)
    }
  }, [technique, params, builder, t, onOpenChange])

  const showTLS = ['wstunnel', 'chisel', 'frp', 'quic'].includes(technique.id)
  const showSNI = ['wstunnel', 'quic'].includes(technique.id)
  const showCustomPort = ['wstunnel', 'chisel', 'frp', 'quic', 'ligolo'].includes(technique.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="size-4" />
            {t('advanced.execute.title')}: {t(technique.nameKey)}
          </DialogTitle>
          <DialogDescription>{t('advanced.execute.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Golden rules indicator — dinámico según toggles del diálogo */}
          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t('advanced.execute.goldenRules')}{(tlsActive && sniActive && port443Active && !technique.goldenRules.tlsAvailable) ? ' ↑' : ''}</span>
              <GoldenIndicator rules={dynamicRules} />
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs text-muted-foreground">
              <span className={tlsActive ? 'text-emerald-600' : 'text-red-500'}>{tlsActive ? '✓' : '✗'} TLS{(params.useTLS === 'true' || params.useTLS === 'on') ? ' ← activado' : ''}</span>
              <span className={sniActive ? 'text-emerald-600' : 'text-red-500'}>{sniActive ? '✓' : '✗'} SNI Spoof{params.sniOverride ? (' ← ' + params.sniOverride) : ''}</span>
              <span className={technique.goldenRules.jitterConfigurable ? 'text-emerald-600' : 'text-red-500'}>{technique.goldenRules.jitterConfigurable ? '✓' : '✗'} Jitter</span>
              <span className={port443Active ? 'text-emerald-600' : 'text-red-500'}>{port443Active ? '✓' : '✗'} Port 443{params.customPort === '443' ? ' ← forzado' : ''}</span>
              <span className={technique.goldenRules.notMixedProtocol ? 'text-emerald-600' : 'text-red-500'}>{technique.goldenRules.notMixedProtocol ? '✓' : '✗'} Single Protocol</span>
            </div>
          </div>
          <Separator />

          {/* TLS toggle */}
          {showTLS && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm">{t('advanced.execute.tls')}</Label>
                <p className="text-xs text-muted-foreground">{t('advanced.execute.tlsDesc')}</p>
              </div>
              <Switch
                checked={params.useTLS === 'true' || params.useTLS === 'on'}
                onCheckedChange={(checked) => setParams((prev) => ({ ...prev, useTLS: checked ? 'true' : 'false' }))}
              />
            </div>
          )}

          {/* SNI override */}
          {showSNI && (
            <div className="grid gap-1.5">
              <Label htmlFor="sni-override" className="text-sm">
                {t('advanced.execute.sniOverride')}
              </Label>
              <Input
                id="sni-override"
                value={params.sniOverride || ''}
                onChange={(e) => setParams((prev) => ({ ...prev, sniOverride: e.target.value }))}
                placeholder="google.com"
              />
              <p className="text-xs text-muted-foreground">{t('advanced.execute.sniOverrideDesc')}</p>
            </div>
          )}

          {/* Custom port */}
          {showCustomPort && (
            <div className="grid gap-1.5">
              <Label htmlFor="custom-port" className="text-sm">
                {t('advanced.execute.params.customPort')}
              </Label>
              <Input
                id="custom-port"
                type="number"
                value={params.customPort || ''}
                onChange={(e) => setParams((prev) => ({ ...prev, customPort: e.target.value }))}
                placeholder="443"
              />
            </div>
          )}

          {/* Separator before SSH/common fields */}
          {(showTLS || showSNI || showCustomPort) && <Separator />}

          {/* Common SSH fields */}
          {COMMON_PARAM_FIELDS.map((field) => (
            <div key={field.key} className="grid gap-1.5">
              <Label htmlFor={`common-${field.key}`}>
                {t(field.labelKey)}
                {field.required && <span className="text-red-500 ml-0.5">*</span>}
              </Label>
              <Input
                id={`common-${field.key}`}
                type={field.key === 'sshPassword' ? 'password' : 'text'}
                value={params[field.key] || ''}
                onChange={(e) =>
                  setParams((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
                placeholder={t(field.labelKey)}
              />
            </div>
          ))}

          <Separator />

          {/* Technique-specific fields */}
          {fields.length === 0 && !builder && (
            <div className="rounded-lg bg-muted p-3">
              <Label className="text-sm">{t('advanced.execute.commandLabel')}</Label>
              <Textarea
                readOnly
                className="mt-1.5 font-mono text-xs"
                rows={4}
                value={technique.commands.map((c) => c.command).join('\n')}
              />
            </div>
          )}

          {fields.map((field) => (
            <div key={field.key} className="grid gap-1.5">
              <Label htmlFor={`param-${field.key}`}>
                {t(field.labelKey)}
                {field.required && <span className="text-red-500 ml-0.5">*</span>}
              </Label>
              <Input
                id={`param-${field.key}`}
                value={params[field.key] || ''}
                onChange={(e) =>
                  setParams((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
                placeholder={t(field.labelKey)}
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={executing}>
            {t('advanced.execute.cancel')}
          </Button>
          <Button onClick={handleExecute} disabled={executing}>
            {executing && <Loader2 className="size-4 mr-1.5 animate-spin" />}
            {t('advanced.execute.go')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function OSTabs({ technique, t }: { technique: TechniqueEntry; t: (key: string) => string }) {
  const osEntries = Object.entries(technique.osUseCases) as [OSName, string[]][]
  const hasAny = osEntries.some(([, cases]) => cases.length > 0)
  if (!hasAny) return null

  const defaultOS = osEntries.find(([, cases]) => cases.length > 0)?.[0] || 'linux'

  return (
    <Tabs defaultValue={defaultOS} className="w-full">
      <TabsList className="h-8">
        {osEntries.map(([os, cases]) =>
          cases.length > 0 ? (
            <TabsTrigger key={os} value={os} className="text-xs h-7 gap-1">
              {OS_ICONS[os]}
              {t(OS_LABEL_KEYS[os])}
            </TabsTrigger>
          ) : null
        )}
      </TabsList>
      {osEntries.map(([os, cases]) =>
        cases.length > 0 ? (
          <TabsContent key={os} value={os} className="mt-2">
            <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
              {cases.map((caseKey) => (
                <li key={caseKey}>{t(`advanced.osCases.${technique.id}.${os}.${caseKey}`)}</li>
              ))}
            </ul>
          </TabsContent>
        ) : null
      )}
    </Tabs>
  )
}

export function AdvancedTunnelTechniques() {
  const { t } = useTranslation()
  const [executeDialogOpen, setExecuteDialogOpen] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-slate-700" />
            {t('advanced.pageTitle')}
          </CardTitle>
          <CardDescription>{t('advanced.pageDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>{t('advanced.pageIntro')}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
              {t('advanced.badges.execution')}
            </Badge>
            <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800">
              {t('advanced.badges.reference')}
            </Badge>
          </div>

          {/* Golden Rules legend */}
          <div className="rounded-lg border p-3 mt-2">
            <p className="text-sm font-medium mb-2">{t('advanced.goldenRules.legendTitle')}</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5">
                <Shield className="size-3.5 text-emerald-500" />
                <span className="text-xs">{t('advanced.goldenRules.green')} (4-5/5)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldMinus className="size-3.5 text-amber-500" />
                <span className="text-xs">{t('advanced.goldenRules.amber')} (2-3/5)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="size-3.5 text-red-500" />
                <span className="text-xs">{t('advanced.goldenRules.red')} (0-1/5)</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
              <span>{t('advanced.goldenRules.criteria1')}</span>
              <span>{t('advanced.goldenRules.criteria2')}</span>
              <span>{t('advanced.goldenRules.criteria3')}</span>
              <span>{t('advanced.goldenRules.criteria4')}</span>
              <span>{t('advanced.goldenRules.criteria5')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {techniques.map((technique) => (
          <Card key={technique.id}>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2">
                <Server className="size-4 text-slate-600" />
                <span>{t(technique.nameKey)}</span>
                <GoldenIndicator rules={technique.goldenRules} />
              </CardTitle>
              <CardDescription>{t(technique.descriptionKey)}</CardDescription>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Badge
                  variant="outline"
                  className={`border ${supportBadgeClass(technique.support)}`}
                >
                  {technique.support === 'Ejecutable' ? t('advanced.state.executable') : t('advanced.state.documented')}
                </Badge>
                <Badge variant="secondary" className="rounded-full">
                  {t(technique.binaryKey)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 text-sm text-muted-foreground">
                <div className="flex gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{t('advanced.labels.recommended')}</p>
                    <p>{t(technique.recommendedKey)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <CircleAlert className="size-4 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{t('advanced.labels.limitations')}</p>
                    <ul className="list-disc pl-5">
                      {technique.limitationKeys.map((key) => (
                        <li key={`${technique.id}-lim-${key}`}>{t(key)}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              {/* OS-specific use cases */}
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Globe className="size-4 text-muted-foreground" />
                  {t('advanced.labels.useCasesByOS')}
                </p>
                <OSTabs technique={technique} t={t} />
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <CircleArrowRight className="size-4 text-muted-foreground" />
                  {t('advanced.labels.useCases')}
                </p>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  {technique.useCaseKeys.map((key) => (
                    <li key={`${technique.id}-case-${key}`}>{t(key)}</li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <p className="text-sm font-medium flex items-center gap-2">
                  <SlidersHorizontal className="size-4 text-muted-foreground" />
                  {t('advanced.labels.commands')}
                </p>
                {technique.support === 'Ejecutable' && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => setExecuteDialogOpen(technique.id)}
                    className="gap-1.5"
                  >
                    <Play className="size-3.5" />
                    {t('advanced.action.execute')}
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {technique.commands.map((command) => (
                  <CommandBlock key={`${technique.id}-cmd-${command.labelKey}`} command={command} t={t} />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-slate-700" />
            {t('advanced.supportTitle')}
          </CardTitle>
          <CardDescription>{t('advanced.supportDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('advanced.supportTable.technique')}</TableHead>
                  <TableHead>{t('advanced.supportTable.scope')}</TableHead>
                  <TableHead>{t('advanced.supportTable.state')}</TableHead>
                  <TableHead>{t('advanced.supportTable.note')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {executionSupportRows.map((row) => (
                  <TableRow key={row.techniqueKey}>
                    <TableCell className="font-medium">{t(row.techniqueKey)}</TableCell>
                    <TableCell>{t(row.categoryKey)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`border ${supportBadgeClass(row.state)}`}>
                        {row.state === 'Ejecutable' ? t('advanced.state.executable') : t('advanced.state.documented')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{t(row.noteKey)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {executeDialogOpen &&
        (() => {
          const technique = techniques.find((t) => t.id === executeDialogOpen)
          if (!technique) return null
          return (
            <TechniqueExecuteDialog
              technique={technique}
              open={true}
              onOpenChange={(open) => {
                if (!open) setExecuteDialogOpen(null)
              }}
              t={t}
            />
          )
        })()}
    </div>
  )
}
