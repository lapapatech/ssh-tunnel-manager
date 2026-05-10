'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Locale = 'es' | 'en'

interface I18nStore {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useI18nStore = create<I18nStore>()(
  persist(
    (set) => ({
      locale: 'es',
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'ssh-tunnel-locale',
    }
  )
)

// ============ FLAT TRANSLATIONS DICTIONARY ============
// Each key maps to { es: string, en: string }

export const translations: Record<string, { es: string; en: string }> = {
  // ---- Header ----
  'header.title': { es: 'Gestor de Redirección de Puertos SSH', en: 'SSH Port Forwarding Manager' },
  'header.subtitle': { es: 'Gestiona y visualiza tus túneles SSH', en: 'Manage and visualize your SSH tunnels' },
  'header.active': { es: 'Activo', en: 'Active' },
  'header.activePlural': { es: 'Activos', en: 'Active' },
  'header.encrypted': { es: 'Cifrado', en: 'Encrypted' },

  // ---- Tabs ----
  'tabs.local': { es: 'Local', en: 'Local' },
  'tabs.remote': { es: 'Remoto', en: 'Remote' },
  'tabs.dynamic': { es: 'Dinámico', en: 'Dynamic' },

  // ---- Diagram section titles ----
  'diagrams.localTitle': { es: 'Redirección Local de Puertos (-L)', en: 'Local Port Forwarding (-L)' },
  'diagrams.remoteTitle': { es: 'Redirección Remota de Puertos (-R)', en: 'Remote Port Forwarding (-R)' },
  'diagrams.dynamicTitle': { es: 'Redirección Dinámica / Proxy SOCKS (-D)', en: 'Dynamic Port Forwarding / SOCKS Proxy (-D)' },
  'diagrams.sshTunnelEncrypted': { es: 'Túnel SSH (Cifrado)', en: 'SSH Tunnel (Encrypted)' },
  'diagrams.sshTunnelSocks': { es: 'Túnel SSH + Proxy SOCKS', en: 'SSH Tunnel + SOCKS Proxy' },
  'diagrams.yourComputer': { es: 'Tu Equipo', en: 'Your Computer' },
  'diagrams.remoteServer': { es: 'Servidor Remoto', en: 'Remote Server' },
  'diagrams.firewall': { es: 'Cortafuegos', en: 'Firewall' },
  'diagrams.internet': { es: 'Internet', en: 'Internet' },
  'diagrams.anyDestination': { es: 'Cualquier destino', en: 'Any destination' },
  'diagrams.flowDynamic': { es: 'App → Proxy SOCKS → Túnel SSH → Servidor → Internet', en: 'App → SOCKS Proxy → SSH Tunnel → Server → Internet' },

  // ---- Explanations ----
  'explanations.commandSyntax': { es: 'Sintaxis del Comando', en: 'Command Syntax' },
  'explanations.howItWorks': { es: 'Cómo Funciona', en: 'How It Works' },
  'explanations.useCases': { es: 'Casos de Uso', en: 'Use Cases' },
  'explanations.flow': { es: 'Flujo:', en: 'Flow:' },

  // Local
  'explanations.localHowIt1': { es: 'Redirige un puerto de tu equipo local a un servidor remoto a través de un túnel SSH.', en: 'Forwards a port from your local machine to a remote server through an SSH tunnel.' },
  'explanations.localHowIt2': { es: 'Tus aplicaciones locales se conectan a', en: 'Your local applications connect to' },
  'explanations.localHowIt2b': { es: ', y el servidor SSH redirige esa conexión a', en: ', and the SSH server forwards that connection to' },
  'explanations.localCase1': { es: 'Acceder a una base de datos solo alcanzable desde la red del servidor remoto', en: "Accessing a database that's only reachable from the remote server's network" },
  'explanations.localCase2': { es: 'Conectar a un servicio web o API en una red privada', en: 'Connecting to a web service or API on a private network' },
  'explanations.localCase3': { es: 'Acceder a herramientas internas detrás de un cortafuegos', en: 'Accessing internal tools behind a firewall' },
  'explanations.localCase4': { es: 'Depurar servicios que solo escuchan en localhost de una máquina remota', en: 'Debugging services that only listen on localhost of a remote machine' },

  // Remote
  'explanations.remoteHowIt1': { es: 'Redirige un puerto del servidor remoto de vuelta a tu equipo local a través de un túnel SSH.', en: 'Forwards a port from the remote server back to your local machine through an SSH tunnel.' },
  'explanations.remoteHowIt2': { es: 'Los clientes remotos se conectan al servidor SSH en', en: 'Remote clients connect to the SSH server on' },
  'explanations.remoteHowIt2b': { es: ', y la conexión se reenvía a través del túnel a tu', en: ', and the connection is forwarded back through the tunnel to your' },
  'explanations.remoteCase1': { es: 'Exponer un servidor de desarrollo local a internet', en: 'Exposing a local development server to the internet' },
  'explanations.remoteCase2': { es: 'Permitir a colegas remotos acceder a tu servicio local', en: 'Allowing remote colleagues to access your local service' },
  'explanations.remoteCase3': { es: 'Compartir una aplicación web local sin desplegarla', en: 'Sharing a local web app without deploying it' },
  'explanations.remoteCase4': { es: 'Probar webhooks de servicios externos en tu equipo local', en: 'Testing webhooks from external services on your local machine' },

  // Dynamic
  'explanations.dynamicHowIt1': { es: 'Crea un proxy SOCKS en tu equipo local en', en: 'Creates a SOCKS proxy on your local machine at' },
  'explanations.dynamicHowIt2': { es: 'Cualquier aplicación configurada para usar este proxy SOCKS tendrá su tráfico enrutado a través del túnel SSH hacia el servidor remoto, que luego se conecta al destino en nombre del cliente.', en: 'Any application configured to use this SOCKS proxy will have its traffic routed through the SSH tunnel to the remote server, which then connects to the destination on behalf of the client.' },
  'explanations.dynamicCase1': { es: 'Navegación segura a través de un túnel SSH', en: 'Secure browsing through an SSH tunnel' },
  'explanations.dynamicCase2': { es: 'Evitar restricciones de red y cortafuegos', en: 'Bypassing network restrictions and firewalls' },
  'explanations.dynamicCase3': { es: 'Acceder a contenido bloqueado geográficamente', en: 'Accessing geo-blocked content' },
  'explanations.dynamicCase4': { es: 'Enrutar todo el tráfico de una aplicación por un canal seguro', en: 'Routing all application traffic through a secure channel' },

  // ---- Form ----
  'form.createLocal': { es: 'Crear Túnel Local', en: 'Create Local Tunnel' },
  'form.createRemote': { es: 'Crear Túnel Remoto', en: 'Create Remote Tunnel' },
  'form.createDynamic': { es: 'Crear Túnel Dinámico (SOCKS)', en: 'Create Dynamic (SOCKS) Tunnel' },
  'form.tunnelName': { es: 'Nombre del Túnel', en: 'Tunnel Name' },
  'form.tunnelNamePlaceholder': { es: 'ej: Mi Túnel de Base de Datos', en: 'e.g., My Database Tunnel' },
  'form.nameRequired': { es: 'El nombre es obligatorio', en: 'Name is required' },
  'form.sshConnection': { es: 'Conexión SSH', en: 'SSH Connection' },
  'form.user': { es: 'Usuario', en: 'User' },
  'form.userRequired': { es: 'El usuario es obligatorio', en: 'SSH user is required' },
  'form.host': { es: 'Host', en: 'Host' },
  'form.hostRequired': { es: 'El host SSH es obligatorio', en: 'SSH host is required' },
  'form.port': { es: 'Puerto', en: 'Port' },
  'form.portRequired': { es: 'Se requiere un puerto válido (1-65535)', en: 'Valid port (1-65535) is required' },
  'form.authentication': { es: 'Autenticación', en: 'Authentication' },
  'form.password': { es: 'Contraseña', en: 'Password' },
  'form.passwordRequired': { es: 'La contraseña es obligatoria', en: 'Password is required' },
  'form.sshPasswordPlaceholder': { es: 'Contraseña SSH', en: 'SSH password' },
  'form.privateKey': { es: 'Clave Privada', en: 'Private Key' },
  'form.keyPath': { es: 'Ruta de la Clave', en: 'Key Path' },
  'form.keyPathRequired': { es: 'La ruta de la clave es obligatoria', en: 'Key path is required' },
  'form.portForwarding': { es: 'Redirección de Puertos', en: 'Port Forwarding' },
  'form.localBindAddr': { es: 'Dirección de Enlace Local', en: 'Local Bind Address' },
  'form.bindAddrRequired': { es: 'La dirección de enlace es obligatoria', en: 'Bind address is required' },
  'form.localPort': { es: 'Puerto Local', en: 'Local Port' },
  'form.remoteAddr': { es: 'Dirección Remota', en: 'Remote Address' },
  'form.remoteAddrRequired': { es: 'La dirección remota es obligatoria', en: 'Remote address is required' },
  'form.remotePort': { es: 'Puerto Remoto', en: 'Remote Port' },
  'form.creating': { es: 'Creando...', en: 'Creating...' },
  'form.create': { es: 'Crear Túnel', en: 'Create Tunnel' },

  // ---- Tunnel List ----
  'list.tunnels': { es: 'Túneles', en: 'Tunnels' },
  'list.active': { es: 'Activos', en: 'Active' },
  'list.stopped': { es: 'Detenido', en: 'Stopped' },
  'list.starting': { es: 'Iniciando', en: 'Starting' },
  'list.activeStatus': { es: 'Activo', en: 'Active' },
  'list.error': { es: 'Error', en: 'Error' },
  'list.stop': { es: 'Detener', en: 'Stop' },
  'list.start': { es: 'Iniciar', en: 'Start' },
  'list.startingBtn': { es: 'Iniciando...', en: 'Starting...' },
  'list.copyCommand': { es: 'Copiar comando SSH', en: 'Copy SSH command' },
  'list.deleteTunnel': { es: 'Eliminar túnel', en: 'Delete tunnel' },
  'list.started': { es: 'Iniciado', en: 'Started' },
  'list.noLocalTitle': { es: 'Sin Túneles Locales', en: 'No Local Tunnels' },
  'list.noLocalDesc': { es: 'Crea un túnel de redirección local de puertos para acceder a servicios remotos a través de una conexión SSH.', en: 'Create a local port forwarding tunnel to access remote services through an SSH connection.' },
  'list.noRemoteTitle': { es: 'Sin Túneles Remotos', en: 'No Remote Tunnels' },
  'list.noRemoteDesc': { es: 'Crea un túnel de redirección remota de puertos para exponer servicios locales a través de una conexión SSH.', en: 'Create a remote port forwarding tunnel to expose local services through an SSH connection.' },
  'list.noDynamicTitle': { es: 'Sin Proxies SOCKS', en: 'No SOCKS Proxies' },
  'list.noDynamicDesc': { es: 'Crea un proxy SOCKS dinámico para enrutar todo el tráfico a través de una conexión SSH.', en: 'Create a dynamic SOCKS proxy to route all traffic through an SSH connection.' },

  // ---- Toast messages ----
  'toasts.tunnelCreated': { es: 'Túnel creado correctamente', en: 'Tunnel created successfully' },
  'toasts.tunnelDeleted': { es: 'Túnel eliminado', en: 'Tunnel deleted' },
  'toasts.tunnelStarted': { es: 'Túnel iniciado correctamente', en: 'Tunnel started successfully' },
  'toasts.tunnelStopped': { es: 'Túnel detenido', en: 'Tunnel stopped' },
  'toasts.createFailed': { es: 'Error al crear el túnel', en: 'Failed to create tunnel' },
  'toasts.deleteFailed': { es: 'Error al eliminar el túnel', en: 'Failed to delete tunnel' },
  'toasts.updateFailed': { es: 'Error al actualizar el túnel', en: 'Failed to update tunnel' },
  'toasts.startFailed': { es: 'Error al iniciar el túnel', en: 'Failed to start tunnel' },
  'toasts.stopFailed': { es: 'Error al detener el túnel', en: 'Failed to stop tunnel' },
  'toasts.commandCopied': { es: 'Comando SSH copiado al portapapeles', en: 'SSH command copied to clipboard' },
  'toasts.networkError': { es: 'Error de red', en: 'Network error' },
  'toasts.failedToStart': { es: 'Error al iniciar', en: 'Failed to start' },

  // ---- Export/Import ----
  'export.title': { es: 'Exportar / Importar', en: 'Export / Import' },
  'export.exportBtn': { es: 'Exportar túneles', en: 'Export tunnels' },
  'export.importBtn': { es: 'Importar túneles', en: 'Import tunnels' },
  'export.exportDesc': { es: 'Descarga tus configuraciones de túneles como archivo JSON', en: 'Download your tunnel configurations as a JSON file' },
  'export.importDesc': { es: 'Carga un archivo JSON con configuraciones de túneles', en: 'Upload a JSON file with tunnel configurations' },
  'export.noTunnels': { es: 'No hay túneles para exportar', en: 'No tunnels to export' },
  'export.importSuccess': { es: 'Túneles importados correctamente', en: 'Tunnels imported successfully' },
  'export.importFailed': { es: 'Error al importar los túneles', en: 'Failed to import tunnels' },
  'export.invalidFile': { es: 'Archivo inválido: formato no reconocido', en: 'Invalid file: unrecognized format' },
  'export.exportedCount': { es: 'túneles exportados', en: 'tunnels exported' },
  'export.importedCount': { es: 'túneles importados', en: 'tunnels imported' },
  'export.overwrite': { es: 'Reemplazar existentes', en: 'Overwrite existing' },
  'export.overwriteDesc': { es: 'Si está activado, los túneles con el mismo nombre serán reemplazados', en: 'If enabled, tunnels with the same name will be replaced' },

  // ---- Footer ----
  'footer.madeWith': { es: 'Hecho con Next.js y shadcn/ui', en: 'Made with Next.js and shadcn/ui' },
  'footer.secureAndEncrypted': { es: 'Seguro y Cifrado', en: 'Secure and Encrypted' },
}

// Helper to get a translation by key and locale
export function translate(key: string, locale: Locale): string {
  const entry = translations[key]
  return (entry?.[locale] || entry?.['en'] || key)
}

// Helper to get a toast translation by sub-key and locale (for non-React contexts)
export function getTranslation(key: string, locale?: Locale): string {
  const loc = locale || getDefaultLocale()
  const entry = translations[key]
  return (entry?.[loc] || entry?.['en'] || key)
}

function getDefaultLocale(): Locale {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('ssh-tunnel-locale')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.state?.locale === 'en' || parsed?.state?.locale === 'es') {
          return parsed.state.locale
        }
      }
    } catch {
      // fallback to default
    }
  }
  return 'es'
}

// Create a namespace proxy that allows t('form').field access
function createNamespace(locale: Locale, prefix: string): Record<string, string> {
  return new Proxy({} as Record<string, string>, {
    get: (_, prop: string) => {
      if (prop === '__proto__' || typeof prop === 'symbol') return undefined
      const key = `${prefix}.${prop}`
      const entry = translations[key]
      return (entry?.[locale] || entry?.['en'] || key)
    },
  })
}

// Hook to use translations - supports both t('key.subkey') and t('namespace').subkey patterns
export function useTranslation() {
  const locale = useI18nStore((state) => state.locale)

  // t() supports two patterns:
  // 1. t('header.title') → returns string directly
  // 2. t('form') → returns a namespace proxy where .field looks up 'form.field'
  const t = (keyOrPrefix: string): string | Record<string, string> => {
    // Check if it's an exact key match (e.g., 'header.title')
    const entry = translations[keyOrPrefix]
    if (entry) {
      return entry[locale] || entry['en'] || keyOrPrefix
    }
    // Otherwise treat as a namespace prefix (e.g., 'form' → returns proxy)
    return createNamespace(locale, keyOrPrefix)
  }

  return { t, locale }
}
