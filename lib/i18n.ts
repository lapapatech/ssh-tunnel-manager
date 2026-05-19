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

export const translations = {
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
  'navigation.tunnels': { es: 'Túneles', en: 'Tunnels' },
  'navigation.deployer': { es: 'Deployer', en: 'Deployer' },
  'navigation.advancedTechniques': { es: 'Técnicas avanzadas', en: 'Advanced techniques' },

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
  'advanced.pageTitle': { es: 'Técnicas de túnel avanzadas (catálogo de referencia)', en: 'Advanced tunneling techniques (reference catalog)' },
  'advanced.pageDescription': { es: 'Cobertura de métodos avanzados no incluidos en el motor actual de ejecución.', en: 'Coverage of advanced methods not included in the current execution engine.' },
  'advanced.pageIntro': { es: 'Esta vista no lanza procesos nuevos. Sirve para comparar estrategias, revisar comandos base y decidir el método adecuado según red, permisos y riesgo operativo.', en: 'This view does not launch new processes. It is intended to compare strategies, review base commands, and choose the right method by network, permissions, and operational risk.' },
  'advanced.badges.execution': { es: 'Listo para producción: -L/-R/-D', en: 'Production-ready: -L/-R/-D' },
  'advanced.badges.reference': { es: 'Referencia: Deployer/autossh', en: 'Reference: Deployer/autossh' },
  'advanced.labels.recommended': { es: 'Qué recomendable', en: 'Recommended' },
  'advanced.labels.limitations': { es: 'Limitaciones prácticas', en: 'Practical limitations' },
  'advanced.labels.useCases': { es: 'Casos de uso', en: 'Use cases' },
  'advanced.labels.commands': { es: 'Comandos base (plantillas)', en: 'Base commands (templates)' },
  'advanced.action.copy': { es: 'Copiar', en: 'Copy' },
  'advanced.toast.commandCopied': { es: 'Comando', en: 'Command' },
  'advanced.toast.commandCopyFailed': { es: 'No se pudo copiar el comando', en: 'Unable to copy command' },
  'advanced.toast.noClipboard': { es: 'Portapapeles no disponible en este entorno', en: 'Clipboard unavailable in this environment' },
  'advanced.state.executable': { es: 'Ejecutable', en: 'Executable' },
  'advanced.state.documented': { es: 'Documentado', en: 'Documented' },
  'advanced.supportTitle': { es: 'Soporte en esta app', en: 'Support in this app' },
  'advanced.supportDescription': { es: 'Distinción explícita para evitar falsas expectativas operativas.', en: 'Explicit distinction to avoid operational misunderstandings.' },
  'advanced.supportTable.technique': { es: 'Técnica', en: 'Technique' },
  'advanced.supportTable.scope': { es: 'Ámbito', en: 'Scope' },
  'advanced.supportTable.state': { es: 'Estado', en: 'State' },
  'advanced.supportTable.note': { es: 'Nota', en: 'Note' },
  'advanced.supportRows.sshLocal': { es: 'SSH -L / Local Forwarding', en: 'SSH -L / Local Forwarding' },
  'advanced.supportRows.sshRemote': { es: 'SSH -R / Remote Forwarding', en: 'SSH -R / Remote Forwarding' },
  'advanced.supportRows.sshDynamic': { es: 'SSH -D / SOCKS', en: 'SSH -D / SOCKS' },
  'advanced.supportRows.deployer': { es: 'Deployer / persistent reverse tunnel', en: 'Deployer / persistent reverse tunnel' },
  'advanced.supportRows.chisel': { es: 'Chisel', en: 'Chisel' },
  'advanced.supportRows.ligolo': { es: 'Ligolo-ng', en: 'Ligolo-ng' },
  'advanced.supportRows.dns': { es: 'DNS tunneling', en: 'DNS tunneling' },
  'advanced.supportRows.icmp': { es: 'ICMP tunneling', en: 'ICMP tunneling' },
  'advanced.supportRows.wstunnel': { es: 'wstunnel', en: 'wstunnel' },
  'advanced.supportRows.frp': { es: 'FRP', en: 'FRP' },
  'advanced.supportRows.quic': { es: 'QUIC (Hysteria)', en: 'QUIC (Hysteria)' },
  'advanced.supportRows.proxyjump': { es: 'SSH ProxyJump', en: 'SSH ProxyJump' },
  'advanced.supportRows.categoryTunnelService': { es: 'Motor `mini-services/tunnel-service`', en: '`mini-services/tunnel-service` engine' },
  'advanced.supportRows.categoryAutossh': { es: 'mini-service + `autossh` + `systemd`', en: 'mini-service + `autossh` + `systemd`' },
  'advanced.supportRows.categoryReference': { es: 'Referencia técnica', en: 'Reference-only' },
  'advanced.supportRows.noteEnabled': { es: 'Implementado en UI y ejecución real.', en: 'Implemented in UI with real execution.' },
  'advanced.supportRows.noteDeployer': { es: 'Disponible en la pestaña Deployer; instalación remota guiada.', en: 'Available from Deployer tab; guided remote installation.' },
  'advanced.supportRows.noteReference': { es: 'No se lanza desde esta UI.', en: 'Not launched from this UI.' },
  'advanced.supportRows.noteProxyJump': { es: 'Configurable dentro de flujo SSH manual.', en: 'Configurable in manual SSH flow.' },
  'advanced.techniques.chisel.name': { es: 'Chisel', en: 'Chisel' },
  'advanced.techniques.chisel.description': { es: 'Proxy de tunelización TCP/SOCKS sobre HTTP(S) orientado a atravesar redes con filtrado estricto y NAT.', en: 'TCP/SOCKS tunneling proxy over HTTP(S), aimed at crossing networks with strict filtering and NAT.' },
  'advanced.techniques.chisel.binary': { es: 'Binario externo `chisel` en cliente y servidor', en: 'External `chisel` binary on client and server' },
  'advanced.techniques.chisel.recommended': { es: 'Puertos 8080/443, bind recomendado 0.0.0.0:PUERTO y autenticación básica con token.', en: 'Ports 8080/443, recommended bind 0.0.0.0:PORT and basic token authentication.' },
  'advanced.techniques.chisel.useCase1': { es: 'Acceso a equipos internos cuando sólo sale tráfico web desde la LAN.', en: 'Access internal hosts when only web traffic exits the LAN.' },
  'advanced.techniques.chisel.useCase2': { es: 'Saltar restricciones corporativas sin alterar clientes remotos.', en: 'Bypass corporate restrictions without changing remote clients.' },
  'advanced.techniques.chisel.useCase3': { es: 'Exponer servicios internos con menor ruido de firma que un túnel SSH clásico.', en: 'Expose internal services with lower signature noise than a classic SSH tunnel.' },
  'advanced.techniques.chisel.limitation1': { es: 'Necesita binario `chisel` instalado en ambos extremos.', en: '`chisel` binary required on both ends.' },
  'advanced.techniques.chisel.limitation2': { es: 'No sustituye controles de acceso del servicio original; exige hardening adicional.', en: 'Does not replace existing service access controls; extra hardening is required.' },
  'advanced.techniques.chisel.limitation3': { es: 'Mayor consumo persistente de recursos con cargas largas, sobre todo en modo SOCKS.', en: 'Higher persistent resource overhead, especially in SOCKS mode.' },
  'advanced.techniques.chisel.cmdRelayServer': { es: 'Servidor / relay', en: 'Server / relay' },
  'advanced.techniques.chisel.cmdClientReverse': { es: 'Cliente (reverse) + túnel local', en: 'Client (reverse) + local tunnel' },
  'advanced.techniques.chisel.cmdClientSocks': { es: 'Cliente (SOCKS local)', en: 'Client (local SOCKS)' },
  'advanced.techniques.ligolo.name': { es: 'Ligolo-ng', en: 'Ligolo-ng' },
  'advanced.techniques.ligolo.description': { es: 'Plataforma de pivotaje y malla de red para saltar segmentos LAN con agentes.', en: 'Pivoting platform and network mesh to cross LAN segments with agents.' },
  'advanced.techniques.ligolo.binary': { es: 'Binario externo `ligolo-ng` (agent/server) + configuración de red local', en: 'External `ligolo-ng` binary (agent/server) and local network configuration' },
  'advanced.techniques.ligolo.recommended': { es: 'Puerto 11601 para control-plane, escucha 0.0.0.0 y puente de red según segmento objetivo.', en: 'Port 11601 for control-plane, listen on 0.0.0.0 and configure network bridge per target segment.' },
  'advanced.techniques.ligolo.useCase1': { es: 'Pivotar entre subredes internas para entornos de auditoría.', en: 'Pivot between internal subnets for audit environments.' },
  'advanced.techniques.ligolo.useCase2': { es: 'Acceso a servicios no directamente enrutables.', en: 'Access to services that are not directly routable.' },
  'advanced.techniques.ligolo.useCase3': { es: 'Operación centralizada tipo laboratorio de pruebas.', en: 'Centralized operation in lab-style testing.' },
  'advanced.techniques.ligolo.limitation1': { es: 'No es método recomendado para operación de producción estándar.', en: 'Not intended as a standard production method.' },
  'advanced.techniques.ligolo.limitation2': { es: 'Requiere rutas y ruteo entre interfaces del agente.', en: 'Requires routing between agent interfaces.' },
  'advanced.techniques.ligolo.limitation3': { es: 'Coste operativo alto si escala a muchos hosts.', en: 'Higher operational cost when scaling to many hosts.' },
  'advanced.techniques.ligolo.cmdServer': { es: 'Servidor Ligolo', en: 'Ligolo server' },
  'advanced.techniques.ligolo.cmdAgent': { es: 'Agente', en: 'Agent' },
  'advanced.techniques.dns.name': { es: 'DNS tunneling', en: 'DNS tunneling' },
  'advanced.techniques.dns.description': { es: 'Túnel de tráfico encapsulado en consultas DNS para atravesar controles de egress estrictos.', en: 'Traffic encapsulated in DNS queries to bypass strict egress controls.' },
  'advanced.techniques.dns.binary': { es: 'Binario externo `iodine` (o equivalente DNS tunneling)', en: 'External `iodine` binary (or equivalent DNS tunneling)' },
  'advanced.techniques.dns.recommended': { es: 'Dominios dedicados, TTL corto y UDP/53; separar canal de control y datos.', en: 'Dedicated domains, short TTL, UDP/53; separate control and data channels.' },
  'advanced.techniques.dns.useCase1': { es: 'Recuperar conectividad cuando solo se permite DNS.', en: 'Restore connectivity when only DNS is allowed.' },
  'advanced.techniques.dns.useCase2': { es: 'Canales de administración ligeros cuando otros métodos fallan.', en: 'Lightweight admin channels when other methods fail.' },
  'advanced.techniques.dns.useCase3': { es: 'Vía de contingencia en incidentes de bloqueo de puertos.', en: 'Fallback path during port-blocking incidents.' },
  'advanced.techniques.dns.limitation1': { es: 'Baja tasa de transferencia, no apto para alto volumen.', en: 'Low throughput; unsuitable for high volume.' },
  'advanced.techniques.dns.limitation2': { es: 'Elevada tasa de falsos positivos si el payload no está bien ofuscado.', en: 'Higher false-positive risk if payload is not well obfuscated.' },
  'advanced.techniques.dns.limitation3': { es: 'Necesita control de DNS autoritativo del dominio delegado.', en: 'Needs control over authoritative DNS for delegated domain.' },
  'advanced.techniques.dns.cmdServer': { es: 'Servidor', en: 'Server' },
  'advanced.techniques.dns.cmdClient': { es: 'Cliente', en: 'Client' },
  'advanced.techniques.icmp.name': { es: 'ICMP tunneling', en: 'ICMP tunneling' },
  'advanced.techniques.icmp.description': { es: 'Túnel sobre paquetes ICMP como método de emergencia cuando sólo responde ping en la salida.', en: 'Tunneling via ICMP packets as an emergency method when only ping is reachable.' },
  'advanced.techniques.icmp.binary': { es: 'Herramienta externa `ptunnel-ng` o equivalente y privilegios raw socket', en: 'External `ptunnel-ng` or equivalent with raw socket privileges' },
  'advanced.techniques.icmp.recommended': { es: 'Mantén ruta y AS similares, y valida MTU antes de operación sostenida.', en: 'Keep ASN/path stable and validate MTU before sustained operation.' },
  'advanced.techniques.icmp.useCase1': { es: 'Fallback si TCP/UDP está bloqueado pero ICMP responde.', en: 'Fallback when TCP/UDP is blocked but ICMP responds.' },
  'advanced.techniques.icmp.useCase2': { es: 'Conexiones de administración en recuperación de red.', en: 'Admin links during network recovery.' },
  'advanced.techniques.icmp.useCase3': { es: 'Canal de baja visibilidad en perímetros restrictivos.', en: 'Low-visibility channel in restrictive perimeters.' },
  'advanced.techniques.icmp.limitation1': { es: 'Alta latencia y jitter.', en: 'High latency and jitter.' },
  'advanced.techniques.icmp.limitation2': { es: 'Sensibilidad a IDS/IPS modernos y posibles bloqueos.', en: 'Sensitive to modern IDS/IPS and possible blocking.' },
  'advanced.techniques.icmp.limitation3': { es: 'Capacidad limitada frente a túneles TCP normales.', en: 'Limited capacity compared to normal TCP tunnels.' },
  'advanced.techniques.icmp.cmdServer': { es: 'Servidor receptor', en: 'Receiver server' },
  'advanced.techniques.icmp.cmdClient': { es: 'Cliente emisor', en: 'Sender client' },
  'advanced.techniques.wstunnel.name': { es: 'wstunnel', en: 'wstunnel' },
  'advanced.techniques.wstunnel.description': { es: 'Túnel sobre WebSocket para encapsular tráfico de capa 4 en conexiones HTTP/WS.', en: 'Layer-4 tunneling over WebSocket for HTTP/WS connections.' },
  'advanced.techniques.wstunnel.binary': { es: 'Binario externo `wstunnel` (cliente y servidor) + TLS/WSS', en: 'External `wstunnel` binary (client and server) + TLS/WSS' },
  'advanced.techniques.wstunnel.recommended': { es: 'Usar puertos 443 para egress web, certs válidos y keepalive activo.', en: 'Use web egress ports such as 443, valid certificates and keepalive enabled.' },
  'advanced.techniques.wstunnel.useCase1': { es: 'Saltar firewalls que sólo permiten HTTPS/WS.', en: 'Bypass firewalls that allow only HTTPS/WS.' },
  'advanced.techniques.wstunnel.useCase2': { es: 'Reemplazar proxies sin inspección profunda compleja.', en: 'Replace proxies without complex deep inspection requirements.' },
  'advanced.techniques.wstunnel.useCase3': { es: 'Conectividad simplificada tras CDN o perímetros.', en: 'Simplified connectivity via CDN or perimeter layers.' },
  'advanced.techniques.wstunnel.limitation1': { es: 'No aporta control de acceso extremo a extremo por sí solo.', en: 'Does not provide end-to-end access control alone.' },
  'advanced.techniques.wstunnel.limitation2': { es: 'No cubre el control de sesión completo de ssh -J.', en: 'Does not replicate SSH jump-session flow control.' },
  'advanced.techniques.wstunnel.limitation3': { es: 'Rendimiento afectado en tramos largos por latencia WS.', en: 'Performance can degrade on long paths due to WebSocket latency.' },
  'advanced.techniques.wstunnel.cmdServer': { es: 'Servidor', en: 'Server' },
  'advanced.techniques.wstunnel.cmdClient': { es: 'Cliente hacia destino interno', en: 'Client to internal destination' },
  'advanced.techniques.frp.name': { es: 'FRP (Fast Reverse Proxy)', en: 'FRP (Fast Reverse Proxy)' },
  'advanced.techniques.frp.description': { es: 'Proxy de traspaso de puertos para despliegue y administración centralizada.', en: 'Port forwarding proxy for centralized deployment and administration.' },
  'advanced.techniques.frp.binary': { es: 'Binarios externos `frps` y `frpc` con configuración por archivo', en: 'External `frps` and `frpc` binaries with file-based configuration' },
  'advanced.techniques.frp.recommended': { es: 'Puertos 7000/7500 y túneles persistentes como daemon.', en: 'Ports 7000/7500 and persistent daemonized tunnels.' },
  'advanced.techniques.frp.useCase1': { es: 'Exponer múltiples servicios internos desde una sola salida pública.', en: 'Expose multiple internal services from one public egress.' },
  'advanced.techniques.frp.useCase2': { es: 'Estandarizar accesos en equipos con inventario central.', en: 'Standardize access across teams with central inventory.' },
  'advanced.techniques.frp.useCase3': { es: 'NAT traversal con múltiples clientes FRP.', en: 'NAT traversal with multiple FRP clients.' },
  'advanced.techniques.frp.limitation1': { es: 'Requiere mantenimiento de configuración por archivos.', en: 'Requires file-based configuration maintenance.' },
  'advanced.techniques.frp.limitation2': { es: 'Necesita supervisión de procesos y certificados.', en: 'Needs process and certificate monitoring.' },
  'advanced.techniques.frp.limitation3': { es: 'No está integrado en el scheduler de esta UI.', en: 'Not integrated with this app scheduler.' },
  'advanced.techniques.frp.cmdServerIni': { es: 'frps.ini (servidor)', en: 'frps.ini (server)' },
  'advanced.techniques.frp.cmdClientIni': { es: 'frpc.ini (cliente)', en: 'frpc.ini (client)' },
  'advanced.techniques.frp.cmdRun': { es: 'Arranque', en: 'Startup' },
  'advanced.techniques.quic.name': { es: 'QUIC tunnel (Hysteria / QUIC ecosystem)', en: 'QUIC tunnel (Hysteria / QUIC ecosystem)' },
  'advanced.techniques.quic.description': { es: 'Aprovechar transporte QUIC para reducir handshake y mejorar la latencia en enlaces con alta pérdida.', en: 'Use QUIC transport to reduce handshakes and improve latency on lossy links.' },
  'advanced.techniques.quic.binary': { es: 'Binario externo `hysteria` o stack compatible con QUIC', en: 'External `hysteria` binary or QUIC-compatible stack' },
  'advanced.techniques.quic.recommended': { es: 'Puertos UDP 443/8443, certificados TLS y límites de ancho de banda por flujo.', en: 'UDP ports 443/8443, TLS certificates, and per-flow bandwidth limits.' },
  'advanced.techniques.quic.useCase1': { es: 'Enlaces móviles o 5G con pérdida intermitente.', en: 'Mobile/5G links with intermittent packet loss.' },
  'advanced.techniques.quic.useCase2': { es: 'Reducir bloqueo por inspección superficial de TCP.', en: 'Reduce blocking from basic TCP inspection.' },
  'advanced.techniques.quic.useCase3': { es: 'Multiplexación más eficiente tras cortafuegos.', en: 'More efficient multiplexing behind firewalls.' },
  'advanced.techniques.quic.limitation1': { es: 'Stack menos común en entornos enterprise.', en: 'Less common stack in enterprise environments.' },
  'advanced.techniques.quic.limitation2': { es: 'Mayor curva de ajuste de parámetros y timeouts.', en: 'Steeper parameter and timeout tuning curve.' },
  'advanced.techniques.quic.limitation3': { es: 'Compatibilidad variable según versión cliente/servidor.', en: 'Compatibility varies across client/server versions.' },
  'advanced.techniques.quic.cmdServer': { es: 'Servidor QUIC', en: 'QUIC server' },
  'advanced.techniques.quic.cmdClient': { es: 'Cliente QUIC', en: 'QUIC client' },
  'advanced.techniques.quic.cmdAcl': { es: 'ACL base', en: 'Base ACL' },
  'advanced.techniques.proxyjump.name': { es: 'SSH ProxyJump', en: 'SSH ProxyJump' },
  'advanced.techniques.proxyjump.description': { es: 'Cadena de saltos SSH con -J para atravesar bastiones sin herramientas externas.', en: 'SSH multi-hop chaining with -J to traverse bastions without extra tools.' },
  'advanced.techniques.proxyjump.binary': { es: 'Cliente OpenSSH y acceso al host saltador', en: 'OpenSSH client and access to the jump host' },
  'advanced.techniques.proxyjump.recommended': { es: 'Puertos 22/2222 por salto; usar ControlMaster para optimizar.', en: 'Ports 22/2222 per hop; use ControlMaster for optimization.' },
  'advanced.techniques.proxyjump.useCase1': { es: 'Saltos simples por bastión intermedio.', en: 'Simple intermediate bastion jumps.' },
  'advanced.techniques.proxyjump.useCase2': { es: 'Centralizar autenticación con jump host.', en: 'Centralize authentication with a jump host.' },
  'advanced.techniques.proxyjump.useCase3': { es: 'Auditoría consistente dentro del protocolo SSH.', en: 'Consistent auditing within SSH protocol.' },
  'advanced.techniques.proxyjump.limitation1': { es: 'Depende de saltadores accesibles y mantenidos.', en: 'Depends on accessible and maintained jump hosts.' },
  'advanced.techniques.proxyjump.limitation2': { es: 'Escalabilidad limitada en topologías profundas.', en: 'Limited scalability in deep topologies.' },
  'advanced.techniques.proxyjump.limitation3': { es: 'No añade cifrado adicional al cifrado SSH.', en: 'Does not add encryption beyond SSH encryption.' },
  'advanced.techniques.proxyjump.cmdChain': { es: 'Cadena clásica', en: 'Classic chain' },
  'advanced.techniques.proxyjump.cmdMultiHop': { es: 'Multi-hop', en: 'Multi-hop' },
  'advanced.techniques.proxyjump.cmdWithTunnel': { es: 'Con túnel local', en: 'With local tunnel' },
  'advanced.techniques.autossh.name': { es: 'autossh + systemd (persistent reverse)', en: 'autossh + systemd (persistent reverse)' },
  'advanced.techniques.autossh.description': { es: 'Referencia de operación persistente para túneles reverse con reconexión automática y servicio.', en: 'Reference for persistent reverse tunneling with automatic reconnect and service integration.' },
  'advanced.techniques.autossh.binary': { es: 'Autossh + bash + systemd en host destino; OpenSSH configurado', en: 'Autossh + bash + systemd on target host; OpenSSH configured' },
  'advanced.techniques.autossh.recommended': { es: 'Usar `autossh` en servicio systemd, bind remoto por puerto de exposición.', en: 'Use `autossh` via systemd service, with remote bind per exposed port.' },
  'advanced.techniques.autossh.useCase1': { es: 'Mantener túneles reversos persistentes desde equipos tras NAT.', en: 'Keep persistent reverse tunnels from NATed hosts.' },
  'advanced.techniques.autossh.useCase2': { es: 'Reconexión automática ante caída de red.', en: 'Automatic reconnection on network drop.' },
  'advanced.techniques.autossh.useCase3': { es: 'Operación mínima con supervisión ligera.', en: 'Low-touch operation with lightweight supervision.' },
  'advanced.techniques.autossh.limitation1': { es: 'Esta UI solo expone flujo de configuración y despliegue en Deployer.', en: 'This UI exposes only configuration/deploy flow via Deployer.' },
  'advanced.techniques.autossh.limitation2': { es: 'Requiere instalación de binarios/systemd en destino.', en: 'Requires binaries/systemd installed on destination.' },
  'advanced.techniques.autossh.limitation3': { es: 'No está pensada para orquestación de topologías multi-salto complejas.', en: 'Not designed for complex multi-hop orchestration.' },
  'advanced.techniques.autossh.cmdTemplate': { es: 'Plantilla base', en: 'Base template' },
  'advanced.techniques.autossh.cmdUnit': { es: 'Patrón en unit file', en: 'systemd unit file pattern' },
} as const satisfies Record<string, { es: string; en: string }>

type TranslationKey = keyof typeof translations
type TranslationNamespace = {
  [Key in TranslationKey]: Key extends `${infer Prefix}.${string}` ? Prefix : never
}[TranslationKey]
type NamespaceKeys<Prefix extends TranslationNamespace> =
  Extract<TranslationKey, `${Prefix}.${string}`> extends `${Prefix}.${infer Key}` ? Key : never
type NamespaceProxy<Prefix extends TranslationNamespace> = Record<NamespaceKeys<Prefix>, string>

// Helper to get a translation by key and locale
export function translate(key: string, locale: Locale): string {
  const entry = translations[key as TranslationKey]
  return (entry?.[locale] || entry?.['en'] || key)
}

// Helper to get a toast translation by sub-key and locale (for non-React contexts)
export function getTranslation(key: string, locale?: Locale): string {
  const loc = locale || getDefaultLocale()
  const entry = translations[key as TranslationKey]
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
      const entry = translations[key as TranslationKey]
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
  function t<Key extends TranslationKey>(keyOrPrefix: Key): string
  function t<Prefix extends TranslationNamespace>(keyOrPrefix: Prefix): NamespaceProxy<Prefix>
  function t(keyOrPrefix: string): string | Record<string, string> {
    // Check if it's an exact key match (e.g., 'header.title')
    const entry = translations[keyOrPrefix as TranslationKey]
    if (entry) {
      return entry[locale] || entry['en'] || keyOrPrefix
    }
    // Otherwise treat as a namespace prefix (e.g., 'form' → returns proxy)
    return createNamespace(locale, keyOrPrefix)
  }

  return { t, locale }
}
