'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Loader2, Key, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useTunnelStore } from '@/lib/tunnel-store'
import { useTranslation } from '@/lib/i18n'

interface TunnelFormProps {
  type: 'local' | 'remote' | 'dynamic'
}

export function TunnelForm({ type }: TunnelFormProps) {
  const { addTunnel } = useTunnelStore()
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authType, setAuthType] = useState<'password' | 'key'>('password')

  const [formData, setFormData] = useState({
    name: '',
    sshHost: '',
    sshPort: 22,
    sshUser: '',
    sshPassword: '',
    sshKeyPath: '',
    localBindAddr: '127.0.0.1',
    localPort: type === 'local' ? 8080 : type === 'remote' ? 8080 : 1080,
    remoteBindAddr: 'localhost',
    remotePort: 80,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = t('form').nameRequired
    if (!formData.sshHost.trim()) newErrors.sshHost = t('form').hostRequired
    if (!formData.sshUser.trim()) newErrors.sshUser = t('form').userRequired
    if (!formData.sshPort || formData.sshPort < 1 || formData.sshPort > 65535) {
      newErrors.sshPort = t('form').portRequired
    }
    if (!formData.localPort || formData.localPort < 1 || formData.localPort > 65535) {
      newErrors.localPort = t('form').portRequired
    }
    if (!formData.localBindAddr.trim()) newErrors.localBindAddr = t('form').bindAddrRequired

    if (authType === 'password' && !formData.sshPassword.trim()) {
      newErrors.sshPassword = t('form').passwordRequired
    }
    if (authType === 'key' && !formData.sshKeyPath.trim()) {
      newErrors.sshKeyPath = t('form').keyPathRequired
    }

    if (type !== 'dynamic') {
      if (!formData.remoteBindAddr?.trim()) newErrors.remoteBindAddr = t('form').remoteAddrRequired
      if (!formData.remotePort || formData.remotePort < 1 || formData.remotePort > 65535) {
        newErrors.remotePort = t('form').portRequired
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await addTunnel({
        name: formData.name,
        type,
        sshHost: formData.sshHost,
        sshPort: formData.sshPort,
        sshUser: formData.sshUser,
        sshPassword: authType === 'password' ? formData.sshPassword : undefined,
        sshKeyPath: authType === 'key' ? formData.sshKeyPath : undefined,
        localBindAddr: formData.localBindAddr,
        localPort: formData.localPort,
        remoteBindAddr: type !== 'dynamic' ? formData.remoteBindAddr : undefined,
        remotePort: type !== 'dynamic' ? formData.remotePort : undefined,
      })
      setFormData({
        name: '',
        sshHost: '',
        sshPort: 22,
        sshUser: '',
        sshPassword: '',
        sshKeyPath: '',
        localBindAddr: '127.0.0.1',
        localPort: type === 'local' ? 8080 : type === 'remote' ? 8080 : 1080,
        remoteBindAddr: 'localhost',
        remotePort: 80,
      })
      setAuthType('password')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCardClass = () => {
    switch (type) {
      case 'local': return 'border-emerald-200 dark:border-emerald-900/50'
      case 'remote': return 'border-violet-200 dark:border-violet-900/50'
      case 'dynamic': return 'border-cyan-200 dark:border-cyan-900/50'
    }
  }

  const getIconClass = () => {
    switch (type) {
      case 'local': return 'text-emerald-600 dark:text-emerald-400'
      case 'remote': return 'text-violet-600 dark:text-violet-400'
      case 'dynamic': return 'text-cyan-600 dark:text-cyan-400'
    }
  }

  const getFormTitle = () => {
    switch (type) {
      case 'local': return t('form').createLocal
      case 'remote': return t('form').createRemote
      case 'dynamic': return t('form').createDynamic
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={getCardClass()}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className={`size-4 ${getIconClass()}`} />
            {getFormTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tunnel Name */}
            <div className="space-y-2">
              <Label htmlFor={`name-${type}`}>
                {t('form').tunnelName} <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`name-${type}`}
                placeholder={t('form').tunnelNamePlaceholder}
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                aria-invalid={!!errors.name}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <Separator />

            {/* SSH Connection */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Lock className="size-3.5 text-muted-foreground" />
                {t('form').sshConnection}
              </h4>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor={`sshUser-${type}`}>
                    {t('form').user} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`sshUser-${type}`}
                    placeholder="root"
                    value={formData.sshUser}
                    onChange={(e) => updateField('sshUser', e.target.value)}
                    aria-invalid={!!errors.sshUser}
                    className={errors.sshUser ? 'border-destructive' : ''}
                  />
                  {errors.sshUser && (
                    <p className="text-xs text-destructive">{errors.sshUser}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`sshHost-${type}`}>
                    {t('form').host} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`sshHost-${type}`}
                    placeholder="example.com"
                    value={formData.sshHost}
                    onChange={(e) => updateField('sshHost', e.target.value)}
                    aria-invalid={!!errors.sshHost}
                    className={errors.sshHost ? 'border-destructive' : ''}
                  />
                  {errors.sshHost && (
                    <p className="text-xs text-destructive">{errors.sshHost}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`sshPort-${type}`}>
                    {t('form').port} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`sshPort-${type}`}
                    type="number"
                    min={1}
                    max={65535}
                    value={formData.sshPort}
                    onChange={(e) => updateField('sshPort', parseInt(e.target.value) || 0)}
                    aria-invalid={!!errors.sshPort}
                    className={errors.sshPort ? 'border-destructive' : ''}
                  />
                  {errors.sshPort && (
                    <p className="text-xs text-destructive">{errors.sshPort}</p>
                  )}
                </div>
              </div>

              {/* Authentication */}
              <div className="space-y-3">
                <Label>{t('form').authentication} <span className="text-destructive">*</span></Label>
                <RadioGroup
                  value={authType}
                  onValueChange={(v) => setAuthType(v as 'password' | 'key')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="password" id={`auth-pwd-${type}`} />
                    <Label htmlFor={`auth-pwd-${type}`} className="font-normal cursor-pointer">{t('form').password}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="key" id={`auth-key-${type}`} />
                    <Label htmlFor={`auth-key-${type}`} className="font-normal cursor-pointer">{t('form').privateKey}</Label>
                  </div>
                </RadioGroup>

                {authType === 'password' ? (
                  <div className="space-y-2">
                    <Label htmlFor={`sshPassword-${type}`}>
                      {t('form').password} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`sshPassword-${type}`}
                      type="password"
                      placeholder={t('form').sshPasswordPlaceholder}
                      value={formData.sshPassword}
                      onChange={(e) => updateField('sshPassword', e.target.value)}
                      aria-invalid={!!errors.sshPassword}
                      className={errors.sshPassword ? 'border-destructive' : ''}
                    />
                    {errors.sshPassword && (
                      <p className="text-xs text-destructive">{errors.sshPassword}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor={`sshKeyPath-${type}`}>
                      <span className="flex items-center gap-1.5">
                        <Key className="size-3" />
                        {t('form').keyPath} <span className="text-destructive">*</span>
                      </span>
                    </Label>
                    <Input
                      id={`sshKeyPath-${type}`}
                      placeholder="~/.ssh/id_rsa"
                      value={formData.sshKeyPath}
                      onChange={(e) => updateField('sshKeyPath', e.target.value)}
                      aria-invalid={!!errors.sshKeyPath}
                      className={errors.sshKeyPath ? 'border-destructive' : ''}
                    />
                    {errors.sshKeyPath && (
                      <p className="text-xs text-destructive">{errors.sshKeyPath}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Port Forwarding Configuration */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <svg className="size-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
                </svg>
                {t('form').portForwarding}
              </h4>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`localBindAddr-${type}`}>{t('form').localBindAddr}</Label>
                  <Input
                    id={`localBindAddr-${type}`}
                    placeholder="127.0.0.1"
                    value={formData.localBindAddr}
                    onChange={(e) => updateField('localBindAddr', e.target.value)}
                    aria-invalid={!!errors.localBindAddr}
                    className={errors.localBindAddr ? 'border-destructive' : ''}
                  />
                  {errors.localBindAddr && (
                    <p className="text-xs text-destructive">{errors.localBindAddr}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`localPort-${type}`}>
                    {t('form').localPort} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`localPort-${type}`}
                    type="number"
                    min={1}
                    max={65535}
                    value={formData.localPort}
                    onChange={(e) => updateField('localPort', parseInt(e.target.value) || 0)}
                    aria-invalid={!!errors.localPort}
                    className={errors.localPort ? 'border-destructive' : ''}
                  />
                  {errors.localPort && (
                    <p className="text-xs text-destructive">{errors.localPort}</p>
                  )}
                </div>
              </div>

              {type !== 'dynamic' && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`remoteBindAddr-${type}`}>
                      {t('form').remoteAddr} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`remoteBindAddr-${type}`}
                      placeholder="localhost"
                      value={formData.remoteBindAddr}
                      onChange={(e) => updateField('remoteBindAddr', e.target.value)}
                      aria-invalid={!!errors.remoteBindAddr}
                      className={errors.remoteBindAddr ? 'border-destructive' : ''}
                    />
                    {errors.remoteBindAddr && (
                      <p className="text-xs text-destructive">{errors.remoteBindAddr}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`remotePort-${type}`}>
                      {t('form').remotePort} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`remotePort-${type}`}
                      type="number"
                      min={1}
                      max={65535}
                      value={formData.remotePort}
                      onChange={(e) => updateField('remotePort', parseInt(e.target.value) || 0)}
                      aria-invalid={!!errors.remotePort}
                      className={errors.remotePort ? 'border-destructive' : ''}
                    />
                    {errors.remotePort && (
                      <p className="text-xs text-destructive">{errors.remotePort}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t('form').creating}
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  {t('form').create}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
