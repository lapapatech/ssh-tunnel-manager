'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface Deployment {
  id: string
  name: string
  status: string // pending | deploying | active | error | removed
  targetHost: string
  targetPort: number
  targetUser: string
  vpsHost: string
  vpsPort: number
  vpsUser: string
  remotePort: number
  localPort: number
  serviceName: string
  camouflage: boolean
  ipQosBackground: boolean
  sshPublicKey: string | null
  errorMessage: string | null
  currentPhase: string | null
  deployedAt: string | null
  lastSeen: string | null
  createdAt: string
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  deploying: 'bg-blue-500',
  active: 'bg-green-500',
  error: 'bg-red-500',
  removed: 'bg-gray-500',
}

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  deploying: 'Desplegando...',
  active: 'Activo',
  error: 'Error',
  removed: 'Eliminado',
}

function DeploymentForm({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    targetHost: '',
    targetPort: 22,
    targetUser: 'root',
    targetPassword: '',
    vpsHost: '',
    vpsPort: 22,
    vpsUser: 'root',
    vpsPassword: '',
    remotePort: 2222,
    localPort: 22,
    serviceName: 'network-connectivity',
    camouflage: true,
    ipQosBackground: false,
  })

  const handleSubmit = async () => {
    if (!form.name || !form.targetHost || !form.vpsHost) {
      toast.error('Faltan campos requeridos: nombre, targetHost, vpsHost')
      return
    }

    try {
      const res = await fetch('/api/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          targetPassword: form.targetPassword || undefined,
          vpsPassword: form.vpsPassword || undefined,
        }),
      })
      if (res.ok) {
        toast.success('Deployment creado')
        setOpen(false)
        setForm({
          name: '', targetHost: '', targetPort: 22, targetUser: 'root', targetPassword: '',
          vpsHost: '', vpsPort: 22, vpsUser: 'root', vpsPassword: '',
          remotePort: 2222, localPort: 22, serviceName: 'network-connectivity',
          camouflage: true, ipQosBackground: false,
        })
        onSuccess()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al crear deployment')
      }
    } catch {
      toast.error('Error de red')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Nuevo Deployment</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Reverse Tunnel Deployer</DialogTitle>
          <DialogDescription>
            Configura el deploy de un túnel reverse persistente con autossh.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <Label>Nombre</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="produccion-web-01" />
          </div>

          <Tabs defaultValue="target" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="target">Target (detrás de NAT)</TabsTrigger>
              <TabsTrigger value="vps">VPS (público)</TabsTrigger>
            </TabsList>

            <TabsContent value="target" className="space-y-3">
              <div>
                <Label>Host</Label>
                <Input value={form.targetHost} onChange={(e) => setForm({ ...form, targetHost: e.target.value })} placeholder="192.168.1.5" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Puerto</Label>
                  <Input type="number" value={form.targetPort} onChange={(e) => setForm({ ...form, targetPort: parseInt(e.target.value) || 22 })} />
                </div>
                <div>
                  <Label>Puerto local</Label>
                  <Input type="number" value={form.localPort} onChange={(e) => setForm({ ...form, localPort: parseInt(e.target.value) || 22 })} />
                </div>
              </div>
              <div>
                <Label>Usuario SSH</Label>
                <Input value={form.targetUser} onChange={(e) => setForm({ ...form, targetUser: e.target.value })} />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" value={form.targetPassword} onChange={(e) => setForm({ ...form, targetPassword: e.target.value })} placeholder="(dejar vacío si usas key)" />
              </div>
            </TabsContent>

            <TabsContent value="vps" className="space-y-3">
              <div>
                <Label>Host</Label>
                <Input value={form.vpsHost} onChange={(e) => setForm({ ...form, vpsHost: e.target.value })} placeholder="51.15.x.x" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Puerto</Label>
                  <Input type="number" value={form.vpsPort} onChange={(e) => setForm({ ...form, vpsPort: parseInt(e.target.value) || 22 })} />
                </div>
                <div>
                  <Label>Puerto remoto</Label>
                  <Input type="number" value={form.remotePort} onChange={(e) => setForm({ ...form, remotePort: parseInt(e.target.value) || 2222 })} />
                </div>
              </div>
              <div>
                <Label>Usuario SSH</Label>
                <Input value={form.vpsUser} onChange={(e) => setForm({ ...form, vpsUser: e.target.value })} />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" value={form.vpsPassword} onChange={(e) => setForm({ ...form, vpsPassword: e.target.value })} placeholder="(dejar vacío si usas key)" />
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-3 border rounded-lg p-4">
            <h4 className="font-medium">Opciones del servicio</h4>
            <div>
              <Label>Nombre del servicio systemd</Label>
              <Input value={form.serviceName} onChange={(e) => setForm({ ...form, serviceName: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.camouflage} onCheckedChange={(v) => setForm({ ...form, camouflage: v })} />
              <Label>Camuflar proceso (renombrar autossh)</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.ipQosBackground} onCheckedChange={(v) => setForm({ ...form, ipQosBackground: v })} />
              <Label>Tráfico background (IPQoS)</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>Crear Deployment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeployButton({ deployment, onRefresh }: { deployment: Deployment; onRefresh: () => void }) {
  const [loading, setLoading] = useState(false)

  const handleDeploy = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/deployments/deploy?id=${deployment.id}`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        toast.success('Deploy completado')
      } else {
        toast.error(data.error || 'Deploy falló')
        if (data.progress) {
          data.progress.forEach((p: any) => console.log(`[${p.phase}] ${p.message}`))
        }
      }
      onRefresh()
    } catch {
      toast.error('Error de red durante deploy')
    } finally {
      setLoading(false)
    }
  }

  const handleCheck = async () => {
    try {
      const res = await fetch(`/api/deployments/check?id=${deployment.id}`)
      const data = await res.json()
      if (data.tunnelUp) {
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
      onRefresh()
    } catch {
      toast.error('Error al verificar')
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/deployments?id=${deployment.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Deployment eliminado')
        onRefresh()
      }
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const canDeploy = deployment.status === 'pending' || deployment.status === 'error'
  const isActive = deployment.status === 'active'

  return (
    <div className="flex gap-2">
      {canDeploy && (
        <Button size="sm" onClick={handleDeploy} disabled={loading}>
          {loading ? 'Desplegando...' : 'Deploy'}
        </Button>
      )}
      {isActive && (
        <Button size="sm" variant="outline" onClick={handleCheck}>
          Verificar
        </Button>
      )}
      <Button size="sm" variant="destructive" onClick={handleDelete}>
        Eliminar
      </Button>
    </div>
  )
}

export function DeploymentManager() {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDeployments = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/deployments')
      if (res.ok) {
        const data = await res.json()
        setDeployments(data.deployments || [])
      }
    } catch {
      console.error('Failed to fetch deployments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDeployments() }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reverse Tunnel Deployer</h2>
          <p className="text-muted-foreground">
            Despliega túneles reverse persistentes con autossh en máquinas detrás de NAT.
          </p>
        </div>
        <DeploymentForm onSuccess={fetchDeployments} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deployments</CardTitle>
          <CardDescription>
            {deployments.length} deployment{deployments.length !== 1 ? 's' : ''} configurado{deployments.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Cargando...</p>
          ) : deployments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay deployments configurados.</p>
              <p className="text-sm">Crea uno nuevo para empezar.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>VPS</TableHead>
                  <TableHead>Puerto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Última vez</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deployments.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell className="text-sm">{d.targetHost}:{d.targetPort}</TableCell>
                    <TableCell className="text-sm">{d.vpsHost}:{d.remotePort}</TableCell>
                    <TableCell className="text-sm">{d.remotePort}{" → "}{d.localPort}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[d.status] || 'bg-gray-500'}>
                        {statusLabels[d.status] || d.status}
                      </Badge>
                      {d.currentPhase && d.status === 'deploying' && (
                        <span className="text-xs text-muted-foreground ml-2">{d.currentPhase}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {d.lastSeen
                        ? new Date(d.lastSeen).toLocaleString()
                        : d.deployedAt
                          ? new Date(d.deployedAt).toLocaleString()
                          : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DeployButton deployment={d} onRefresh={fetchDeployments} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {deployments.filter(d => d.status === 'active').map((d) => (
            d.sshPublicKey && (
              <div key={`key-${d.id}`} className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-xs font-medium mb-1">Clave pública (añadir a ~tunneluser/.ssh/authorized_keys en el VPS si es necesario):</p>
                <pre className="text-xs overflow-x-auto">{d.sshPublicKey}</pre>
              </div>
            )
          ))}
        </CardContent>
      </Card>
    </div>
  )
}