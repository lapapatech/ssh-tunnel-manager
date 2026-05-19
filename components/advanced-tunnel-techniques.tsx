'use client'

import { CheckCircle2, CircleAlert, Copy, CircleArrowRight, ShieldCheck, Server, SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useTranslation } from '@/lib/i18n'

type SupportState = 'Ejecutable' | 'Documentado'

interface CommandEntry {
  labelKey: string
  command: string
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
}

interface ExecutionSupportRow {
  techniqueKey: string
  categoryKey: string
  state: SupportState
  noteKey: string
}

const techniques: TechniqueEntry[] = [
  {
    id: 'chisel',
    nameKey: 'advanced.techniques.chisel.name',
    descriptionKey: 'advanced.techniques.chisel.description',
    support: 'Documentado',
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
        command: 'chisel server --host 0.0.0.0 --port <RELAY_PORT> --reverse --authfile <TOKEN_FILE>',
      },
      {
        labelKey: 'advanced.techniques.chisel.cmdClientReverse',
        command: 'chisel client <RELAY_HOST>:<RELAY_PORT> R:<BIND_LOCAL>:<DEST_HOST>:<DEST_PORT>',
      },
      {
        labelKey: 'advanced.techniques.chisel.cmdClientSocks',
        command: 'chisel client <RELAY_HOST>:<RELAY_PORT> socks',
      },
    ],
  },
  {
    id: 'ligolo',
    nameKey: 'advanced.techniques.ligolo.name',
    descriptionKey: 'advanced.techniques.ligolo.description',
    support: 'Documentado',
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
        command: './ligolo-ng server -laddr <LISTEN_IP>:<CONTROL_PORT>',
      },
      {
        labelKey: 'advanced.techniques.ligolo.cmdAgent',
        command: './ligolo-ng agent -connect <SERVER_IP>:<CONTROL_PORT> -ignore-cert',
      },
    ],
  },
  {
    id: 'dns',
    nameKey: 'advanced.techniques.dns.name',
    descriptionKey: 'advanced.techniques.dns.description',
    support: 'Documentado',
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
        command: 'iodined -f -c -P "<PRE_SHARED_SECRET>" <DNS_DOMAIN> <LISTEN_IP>',
      },
      {
        labelKey: 'advanced.techniques.dns.cmdClient',
        command: 'iodine -f -r -P "<PRE_SHARED_SECRET>" <DNS_DOMAIN>@<DNS_SERVER_IP>',
      },
    ],
  },
  {
    id: 'icmp',
    nameKey: 'advanced.techniques.icmp.name',
    descriptionKey: 'advanced.techniques.icmp.description',
    support: 'Documentado',
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
        command: 'ptunnel-ng -l <LISTEN_PORT> -p <FAKE_PORT>',
      },
      {
        labelKey: 'advanced.techniques.icmp.cmdClient',
        command: 'ptunnel-ng -x <LOCAL_IP> -p <SERVER_IP>:<LISTEN_PORT> -r <LOCAL_TARGET_PORT> -l <BIND_LOCAL>',
      },
    ],
  },
  {
    id: 'wstunnel',
    nameKey: 'advanced.techniques.wstunnel.name',
    descriptionKey: 'advanced.techniques.wstunnel.description',
    support: 'Documentado',
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
        command: 'wstunnel -s ws://0.0.0.0:<LISTEN_PORT> --http-transport',
      },
      {
        labelKey: 'advanced.techniques.wstunnel.cmdClient',
        command:
          'wstunnel -L <BIND_LOCAL>:<LOCAL_PORT>:<DEST_HOST>:<DEST_PORT> wss://<WS_HOST>:<LISTEN_PORT>',
      },
    ],
  },
  {
    id: 'frp',
    nameKey: 'advanced.techniques.frp.name',
    descriptionKey: 'advanced.techniques.frp.description',
    support: 'Documentado',
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
        command: '[common]\nbind_port = <CONTROL_PORT>\nvhost_http_port = <HTTP_PORT>\nauthentication_method = token\ntoken = <TOKEN>',
      },
      {
        labelKey: 'advanced.techniques.frp.cmdClientIni',
        command:
          '[common]\nserver_addr = <FRPS_HOST>\nserver_port = <CONTROL_PORT>\n[ssh-local]\ntype = tcp\nlocal_ip = <LOCAL_IP>\nlocal_port = <LOCAL_PORT>\nremote_port = <REMOTE_PORT>',
      },
      {
        labelKey: 'advanced.techniques.frp.cmdRun',
        command: './frps -c frps.ini\n./frpc -c frpc.ini',
      },
    ],
  },
  {
    id: 'quic',
    nameKey: 'advanced.techniques.quic.name',
    descriptionKey: 'advanced.techniques.quic.description',
    support: 'Documentado',
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
        command: 'hysteria server -c server.yaml',
      },
      {
        labelKey: 'advanced.techniques.quic.cmdClient',
        command: 'hysteria client -c client.yaml',
      },
      {
        labelKey: 'advanced.techniques.quic.cmdAcl',
        command: 'acl: { allow: ["tcp/0.0.0.0:22", "tcp/10.0.0.0/24:*"] }',
      },
    ],
  },
  {
    id: 'proxyjump',
    nameKey: 'advanced.techniques.proxyjump.name',
    descriptionKey: 'advanced.techniques.proxyjump.description',
    support: 'Documentado',
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
        command: 'ssh -J <JUMP_USER>@<JUMP_HOST>:<JUMP_PORT> <DEST_USER>@<DEST_HOST>',
      },
      {
        labelKey: 'advanced.techniques.proxyjump.cmdMultiHop',
        command: 'ssh -J <HOST_A>:<PORT_A>,<HOST_B>:<PORT_B> <USER>@<DEST_HOST>',
      },
      {
        labelKey: 'advanced.techniques.proxyjump.cmdWithTunnel',
        command: 'ssh -J <JUMP_HOST>:<JUMP_PORT> -L <LOCAL>:<INTERNAL_HOST>:<INTERNAL_PORT> <USER>@<DEST_HOST>',
      },
    ],
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
        command:
          'autossh -M 0 -NT -o ServerAliveInterval=30 -o ExitOnForwardFailure=yes -R <REMOTE_PORT>:127.0.0.1:<LOCAL_PORT> -p <SSH_PORT> <SSH_USER>@<VPS_HOST>',
      },
      {
        labelKey: 'advanced.techniques.autossh.cmdUnit',
        command:
          '[Service]\\nExecStart=/usr/bin/autossh ...\\nRestart=always\\nRestartSec=15\\n[Install]\\nWantedBy=multi-user.target',
      },
    ],
  },
]

const executionSupportRows: ExecutionSupportRow[] = [
  {
    techniqueKey: 'advanced.supportRows.sshLocal',
    categoryKey: 'advanced.supportRows.categoryTunnelService',
    state: 'Ejecutable',
    noteKey: 'advanced.supportRows.noteEnabled',
  },
  {
    techniqueKey: 'advanced.supportRows.sshRemote',
    categoryKey: 'advanced.supportRows.categoryTunnelService',
    state: 'Ejecutable',
    noteKey: 'advanced.supportRows.noteEnabled',
  },
  {
    techniqueKey: 'advanced.supportRows.sshDynamic',
    categoryKey: 'advanced.supportRows.categoryTunnelService',
    state: 'Ejecutable',
    noteKey: 'advanced.supportRows.noteEnabled',
  },
  {
    techniqueKey: 'advanced.supportRows.deployer',
    categoryKey: 'advanced.supportRows.categoryAutossh',
    state: 'Ejecutable',
    noteKey: 'advanced.supportRows.noteDeployer',
  },
  {
    techniqueKey: 'advanced.supportRows.chisel',
    categoryKey: 'advanced.supportRows.categoryReference',
    state: 'Documentado',
    noteKey: 'advanced.supportRows.noteReference',
  },
  {
    techniqueKey: 'advanced.supportRows.ligolo',
    categoryKey: 'advanced.supportRows.categoryReference',
    state: 'Documentado',
    noteKey: 'advanced.supportRows.noteReference',
  },
  {
    techniqueKey: 'advanced.supportRows.dns',
    categoryKey: 'advanced.supportRows.categoryReference',
    state: 'Documentado',
    noteKey: 'advanced.supportRows.noteReference',
  },
  {
    techniqueKey: 'advanced.supportRows.icmp',
    categoryKey: 'advanced.supportRows.categoryReference',
    state: 'Documentado',
    noteKey: 'advanced.supportRows.noteReference',
  },
  {
    techniqueKey: 'advanced.supportRows.wstunnel',
    categoryKey: 'advanced.supportRows.categoryReference',
    state: 'Documentado',
    noteKey: 'advanced.supportRows.noteReference',
  },
  {
    techniqueKey: 'advanced.supportRows.frp',
    categoryKey: 'advanced.supportRows.categoryReference',
    state: 'Documentado',
    noteKey: 'advanced.supportRows.noteReference',
  },
  {
    techniqueKey: 'advanced.supportRows.quic',
    categoryKey: 'advanced.supportRows.categoryReference',
    state: 'Documentado',
    noteKey: 'advanced.supportRows.noteReference',
  },
  {
    techniqueKey: 'advanced.supportRows.proxyjump',
    categoryKey: 'advanced.supportRows.categoryReference',
    state: 'Documentado',
    noteKey: 'advanced.supportRows.noteProxyJump',
  },
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

export function AdvancedTunnelTechniques() {
  const { t } = useTranslation()

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
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {techniques.map((technique) => (
          <Card key={technique.id}>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2">
                <Server className="size-4 text-slate-600" />
                <span>{t(technique.nameKey)}</span>
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

              <p className="text-sm font-medium flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-muted-foreground" />
                {t('advanced.labels.commands')}
              </p>
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
    </div>
  )
}
