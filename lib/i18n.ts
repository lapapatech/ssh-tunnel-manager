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
  'advanced.action.execute': { es: 'Ejecutar', en: 'Execute' },
  'advanced.execute.title': { es: 'Ejecutar técnica', en: 'Execute technique' },
  'advanced.execute.description': { es: 'Edita el comando y ejecuta la técnica directamente desde la UI.', en: 'Edit the command and execute the technique directly from the UI.' },
  'advanced.execute.commandLabel': { es: 'Comando', en: 'Command' },
  'advanced.execute.cancel': { es: 'Cancelar', en: 'Cancel' },
  'advanced.execute.go': { es: 'Ejecutar', en: 'Execute' },
  'advanced.execute.success': { es: 'Túnel iniciado correctamente', en: 'Tunnel started successfully' },
  'advanced.execute.failed': { es: 'Error al ejecutar la técnica', en: 'Failed to execute technique' },
  'advanced.execute.params.sshHost': { es: 'Host SSH', en: 'SSH Host' },
  'advanced.execute.params.sshUser': { es: 'Usuario SSH', en: 'SSH User' },
  'advanced.execute.params.sshPassword': { es: 'Contraseña SSH', en: 'SSH Password' },
  'advanced.execute.params.sshPort': { es: 'Puerto SSH', en: 'SSH Port' },
  'advanced.execute.params.jumpHost': { es: 'Host de salto', en: 'Jump host' },
  'advanced.execute.params.jumpPort': { es: 'Puerto de salto', en: 'Jump port' },
  'advanced.execute.params.jumpUser': { es: 'Usuario de salto', en: 'Jump user' },
  'advanced.execute.params.destHost': { es: 'Host destino', en: 'Destination host' },
  'advanced.execute.params.destUser': { es: 'Usuario destino', en: 'Destination user' },
  'advanced.execute.params.vpsHost': { es: 'Host VPS', en: 'VPS host' },
  'advanced.execute.params.remotePort': { es: 'Puerto remoto', en: 'Remote port' },
  'advanced.execute.params.localPort': { es: 'Puerto local', en: 'Local port' },
  'advanced.execute.run': { es: 'Ejecutar', en: 'Execute' },
  'advanced.execute.stop': { es: 'Detener', en: 'Stop' },
  'advanced.execute.running': { es: 'Ejecutando', en: 'Running' },
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
  'advanced.supportRows.noteNowExecutable': { es: 'Ahora ejecutable desde la UI (spawn de proceso)', en: 'Now executable from UI (process spawning)' },
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
  // ---- OS labels ----
  'advanced.os.linux': { es: 'Linux', en: 'Linux' },
  'advanced.os.windows': { es: 'Windows', en: 'Windows' },
  'advanced.os.android': { es: 'Android', en: 'Android' },

  // ---- Use cases by OS ----
  'advanced.labels.useCasesByOS': { es: 'Casos de uso por sistema operativo', en: 'Use cases by OS' },

  // ---- Golden Rules legend ----
  'advanced.goldenRules.legendTitle': { es: 'Reglas de Oro — Sigilo Operativo', en: 'Golden Rules — Operational Stealth' },
  'advanced.goldenRules.green': { es: 'Sigiloso', en: 'Stealthy' },
  'advanced.goldenRules.amber': { es: 'Mejorable', en: 'Improvable' },
  'advanced.goldenRules.red': { es: 'Ruidoso', en: 'Noisy' },
  'advanced.goldenRules.criteria1': { es: 'TLS', en: 'TLS' },
  'advanced.goldenRules.criteria2': { es: 'SNI Spoof', en: 'SNI Spoof' },
  'advanced.goldenRules.criteria3': { es: 'Jitter', en: 'Jitter' },
  'advanced.goldenRules.criteria4': { es: 'Puerto 443', en: 'Port 443' },
  'advanced.goldenRules.criteria5': { es: 'Protocolo único', en: 'Single protocol' },

  // ---- Execute dialog enhancements ----
  'advanced.execute.goldenRules': { es: 'Reglas de Oro', en: 'Golden Rules' },
  'advanced.execute.tls': { es: 'Usar TLS', en: 'Use TLS' },
  'advanced.execute.tlsDesc': { es: 'Envuelve el tráfico en TLS (imprescindible para evadir DPI)', en: 'Wrap traffic in TLS (essential for DPI evasion)' },
  'advanced.execute.sniOverride': { es: 'SNI Override', en: 'SNI Override' },
  'advanced.execute.sniOverrideDesc': { es: 'Dominio legítimo que el DPI verá en el handshake (ej: google.com)', en: 'Legitimate domain DPI will see in handshake (e.g. google.com)' },
  'advanced.execute.params.customPort': { es: 'Puerto personalizado', en: 'Custom port' },

  // ---- OS-specific use cases ----
  'advanced.osCases.wstunnel.linux.wstunnel_linux_1': { es: 'Reverse tunnel persistente sobre WSS 443 — camuflado como tráfico web legítimo con SNI google.com. El systemd service se llama systemd-network-helper.', en: 'Persistent reverse tunnel over WSS 443 — camouflaged as legitimate web traffic with SNI google.com. systemd service named systemd-network-helper.' },
  'advanced.osCases.wstunnel.linux.wstunnel_linux_2': { es: 'Exfiltración lenta de datos sobre WebSocket con keepalive+jitter aleatorio para evadir detección por patrones temporales.', en: 'Slow data exfiltration over WebSocket with randomized keepalive+jitter to evade timing-pattern detection.' },
  'advanced.osCases.wstunnel.windows.wstunnel_windows_1': { es: 'Registrar wstunnel como servicio Windows (sc create) con nombre "Windows Network Connectivity Service" — DLL sideloading con zlib1.dll para arranque silencioso.', en: 'Register wstunnel as Windows service (sc create) named "Windows Network Connectivity Service" — DLL sideloading with zlib1.dll for silent startup.' },
  'advanced.osCases.wstunnel.android.wstunnel_android_1': { es: 'Ejecutar en Termux con proot-distro (Debian) + wstunnel cliente hacia VPS — el tráfico sale por 4G/LTE como WebSocket legítimo.', en: 'Run in Termux with proot-distro (Debian) + wstunnel client to VPS — traffic exits via 4G/LTE as legitimate WebSocket.' },

  'advanced.osCases.chisel.linux.chisel_linux_1': { es: 'Servidor chisel con --tls en VPS (puerto 443), cliente en target --tls R:socks. Tráfico HTTP sobre TLS indistinguible de navegación web.', en: 'Chisel server with --tls on VPS (port 443), client on target --tls R:socks. HTTP traffic over TLS indistinguishable from web browsing.' },
  'advanced.osCases.chisel.linux.chisel_linux_2': { es: 'Chisel como proxy SOCKS local tras bastión para escaneo interno: proxychains4 nmap -sT 172.16.0.0/24.', en: 'Chisel as local SOCKS proxy behind bastion for internal scanning: proxychains4 nmap -sT 172.16.0.0/24.' },
  'advanced.osCases.chisel.windows.chisel_windows_1': { es: 'chisel.exe como scheduled task oculta con nombre "WindowsUpdateScheduledTask" — reverse SOCKS persistente.', en: 'chisel.exe as hidden scheduled task named "WindowsUpdateScheduledTask" — persistent reverse SOCKS.' },
  'advanced.osCases.chisel.windows.chisel_windows_2': { es: 'chisel.exe empotrado vía DLL sideloading sobre una app legítima (OneDrive updater) para camuflar el proceso.', en: 'chisel.exe embedded via DLL sideloading into a legitimate app (OneDrive updater) to camouflage the process.' },
  'advanced.osCases.chisel.android.chisel_android_1': { es: 'chisel cliente en Termux hacia VPS — acceso completo a red interna del dispositivo. Útil para auditoría de apps móviles.', en: 'chisel client in Termux to VPS — full access to device internal network. Useful for mobile app auditing.' },

  'advanced.osCases.quic.linux.quic_linux_1': { es: 'Hysteria2 con TLS+QUIC en VPS — el tráfico UDP 443 salta firewalls stateless. Ideal para entornos con filtrado TCP estricto (China, Rusia, Irán).', en: 'Hysteria2 with TLS+QUIC on VPS — UDP 443 bypasses stateless firewalls. Ideal for environments with strict TCP filtering (China, Russia, Iran).' },
  'advanced.osCases.quic.windows.quic_windows_1': { es: 'hysteria.exe como servicio con nombre "DirectX Diagnostic Service" — camuflaje de nombre para evadir inspección manual.', en: 'hysteria.exe as service named "DirectX Diagnostic Service" — name camouflage to evade manual inspection.' },
  'advanced.osCases.quic.android.quic_android_1': { es: 'Cliente Hysteria en Termux con NAT traversal automático sobre red móvil 4G/5G — reconexión inmediata al cambiar de IP.', en: 'Hysteria client in Termux with automatic NAT traversal over 4G/5G mobile — instant reconnect on IP change.' },

  'advanced.osCases.frp.linux.frp_linux_1': { es: 'frps en VPS con TLS, frpc en target con frpc.ini camuflado como /etc/network-monitor.conf — acceso a múltiples puertos internos.', en: 'frps on VPS with TLS, frpc on target with frpc.ini camouflaged as /etc/network-monitor.conf — access to multiple internal ports.' },
  'advanced.osCases.frp.linux.frp_linux_2': { es: 'Modo P2P (xtcp) de FRP para NAT traversal sin servidor central tras el handshake inicial — más sigiloso a largo plazo.', en: 'FRP P2P mode (xtcp) for NAT traversal without central server after initial handshake — more stealthy long-term.' },
  'advanced.osCases.frp.windows.frp_windows_1': { es: 'frpc.exe renombrado a svchost.exe y lanzado vía WMI event subscription para persistencia sin service ni scheduled task.', en: 'frpc.exe renamed to svchost.exe and launched via WMI event subscription for persistence without service or scheduled task.' },

  'advanced.osCases.ligolo.linux.ligolo_linux_1': { es: 'ligolo-proxy en VPS + ligolo-agent en target con ignore-cert — pivoting rápido entre subredes internas para auditoría.', en: 'ligolo-proxy on VPS + ligolo-agent on target with ignore-cert — fast pivoting between internal subnets for auditing.' },
  'advanced.osCases.ligolo.linux.ligolo_linux_2': { es: 'Doble agente Ligolo: uno en bastión DMZ, otro en servidor interno. Túnel en cadena para llegar a segmento aislado.', en: 'Double Ligolo agent: one on DMZ bastion, another on internal server. Chained tunnel to reach isolated segment.' },
  'advanced.osCases.ligolo.windows.ligolo_windows_1': { es: 'ligolo-agent.exe como proceso hijo de explorer.exe (ppid spoofing) — evade detección de procesos huérfanos.', en: 'ligolo-agent.exe as child process of explorer.exe (ppid spoofing) — evades orphan process detection.' },
  'advanced.osCases.ligolo.windows.ligolo_windows_2': { es: 'Agente Ligolo + tun2socks para exponer toda la red interna del target vía SOCKS sobre la interfaz virtual.', en: 'Ligolo agent + tun2socks to expose the entire target internal network via SOCKS over virtual interface.' },

  'advanced.osCases.proxyjump.linux.proxyjump_linux_1': { es: 'ProxyJump con ControlMaster para reutilizar conexión SSH y evitar múltiples handshakes. Ideal para operaciones largas.', en: 'ProxyJump with ControlMaster to reuse SSH connection and avoid multiple handshakes. Ideal for long operations.' },
  'advanced.osCases.proxyjump.linux.proxyjump_linux_2': { es: 'ProxyJump sobre Tor: ssh -o ProxyCommand=nc -x 127.0.0.1:9050 %h %p -J user@bastion.onion user@target — doble capa de anonimato.', en: 'ProxyJump over Tor: ssh -o ProxyCommand=nc -x 127.0.0.1:9050 %h %p -J user@bastion.onion user@target — double anonymity layer.' },
  'advanced.osCases.proxyjump.windows.proxyjump_windows_1': { es: 'OpenSSH cliente nativo en Windows 10/11 con ProxyJump — sin herramientas externas. Living off the land puro.', en: 'Native OpenSSH client on Windows 10/11 with ProxyJump — no external tools. Pure living off the land.' },
  'advanced.osCases.proxyjump.android.proxyjump_android_1': { es: 'Termux + OpenSSH con ProxyJump hacia bastión y SOCKS -D 1080 — el móvil se convierte en pivot point.', en: 'Termux + OpenSSH with ProxyJump to bastion and SOCKS -D 1080 — phone becomes pivot point.' },

  'advanced.osCases.autossh.linux.autossh_linux_1': { es: 'Servicio systemd con autossh + nombre camuflado (systemd-network-helper) + Nice=19 para bajo perfil de CPU.', en: 'systemd service with autossh + camouflaged name (systemd-network-helper) + Nice=19 for low CPU profile.' },
  'advanced.osCases.autossh.linux.autossh_linux_2': { es: 'autossh + reverse tunnel múltiple (-R 2222:localhost:22 -R 1080:localhost:1080) — shell SSH + proxy SOCKS a red interna.', en: 'autossh + multiple reverse tunnels (-R 2222:localhost:22 -R 1080:localhost:1080) — SSH shell + SOCKS proxy to internal network.' },
  'advanced.osCases.autossh.linux.autossh_linux_3': { es: 'autossh con IPQoS=throughput y TCP_NODELAY para optimizar transferencia de datos en túneles de alto volumen.', en: 'autossh with IPQoS=throughput and TCP_NODELAY to optimize data transfer on high-volume tunnels.' },
  'advanced.osCases.autossh.windows.autossh_windows_1': { es: 'Cygwin/MSYS2 autossh como Windows service con sc.exe — requiere ssh.exe en PATH. Alternativa: plink.exe de PuTTY.', en: 'Cygwin/MSYS2 autossh as Windows service with sc.exe — requires ssh.exe in PATH. Alternative: PuTTY plink.exe.' },
  'advanced.osCases.autossh.android.autossh_android_1': { es: 'Termux + autossh con -M 0 para reverse tunnel persistente incluso al cambiar de WiFi a 4G.', en: 'Termux + autossh with -M 0 for persistent reverse tunnel even when switching from WiFi to 4G.' },

  'advanced.osCases.dns.linux.dns_linux_1': { es: 'iodine server en VPS con dominio delegado, cliente en target con -f para foreground. Útil como último recurso cuando solo DNS sale.', en: 'iodine server on VPS with delegated domain, client on target with -f for foreground. Useful as last resort when only DNS exits.' },
  'advanced.osCases.dns.linux.dns_linux_2': { es: 'DNS tunneling con dnscat2 + C2 — beaconing sobre TXT/MX queries. Baja tasa (8-15 KB/s) pero imposible de bloquear sin romper DNS.', en: 'DNS tunneling with dnscat2 + C2 — beaconing over TXT/MX queries. Low throughput (8-15 KB/s) but impossible to block without breaking DNS.' },

  'advanced.osCases.icmp.linux.icmp_linux_1': { es: 'ptunnel-ng como túnel de emergencia cuando TCP/UDP está completamente bloqueado pero ICMP responde. Requiere raw sockets (root).', en: 'ptunnel-ng as emergency tunnel when TCP/UDP is completely blocked but ICMP responds. Requires raw sockets (root).' },
  // ---- Payload Generator ----
  'navigation.payloads': { es: 'Payloads', en: 'Payloads' },
  'payload.title': { es: 'Generador de Payloads', en: 'Payload Generator' },
  'payload.description': { es: 'Genera payloads indetectables por plataforma para despliegue ofensivo', en: 'Generate undetectable platform payloads for offensive deployment' },
  'payload.platform': { es: 'Plataforma', en: 'Platform' },
  'payload.platform.windows': { es: 'Windows', en: 'Windows' },
  'payload.platform.windowsDesc': { es: '.lnk, HTML smuggling, .vhd', en: '.lnk, HTML smuggling, .vhd' },
  'payload.platform.linux': { es: 'Linux', en: 'Linux' },
  'payload.platform.linuxDesc': { es: '.desktop, .tar.gz, .deb', en: '.desktop, .tar.gz, .deb' },
  'payload.platform.android': { es: 'Android', en: 'Android' },
  'payload.platform.androidDesc': { es: 'JPEG polyglot, HTML drive-by, APK wallpaper', en: 'JPEG polyglot, HTML drive-by, APK wallpaper' },
  'payload.type': { es: 'Tipo de Payload', en: 'Payload Type' },
  'payload.type.lnk': { es: '.lnk con RLO (ejecución oculta)', en: '.lnk with RLO (hidden execution)' },
  'payload.type.desktop': { es: '.desktop camuflado (doble-click)', en: 'Disguised .desktop (double-click)' },
  'payload.type.html-smuggling': { es: 'HTML Smuggling (bypass email AV)', en: 'HTML Smuggling (bypass email AV)' },
  'payload.type.polyglot-jpeg': { es: 'Polyglot JPEG+ELF (foto + binario)', en: 'JPEG+ELF Polyglot (photo + binary)' },
  'payload.type.polyglot-pdf': { es: 'Polyglot PDF+Shell (documento + túnel)', en: 'PDF+Shell Polyglot (document + tunnel)' },
  'payload.type.zip-symlink': { es: 'ZIP symlink (sobrescribe .bashrc)', en: 'ZIP symlink (overwrite .bashrc)' },
  'payload.type.apk-template': { es: 'APK Wallpaper (túnel invisible)', en: 'APK Wallpaper (invisible tunnel)' },
  'payload.config': { es: 'Configuración del Túnel', en: 'Tunnel Configuration' },
  'payload.vpsHost': { es: 'Host del VPS', en: 'VPS Host' },
  'payload.vpsPort': { es: 'Puerto', en: 'Port' },
  'payload.technique': { es: 'Técnica de túnel', en: 'Tunnel Technique' },
  'payload.sni': { es: 'SNI Override', en: 'SNI Override' },
  'payload.sniDesc': { es: 'Dominio a suplantar (google.com, graph.instagram.com...)', en: 'Domain to spoof (google.com, graph.instagram.com...)' },
  'payload.binaryName': { es: 'Nombre del binario en VPS', en: 'Binary name on VPS' },
  'payload.outputName': { es: 'Nombre del archivo generado', en: 'Generated filename' },
  'payload.useTLS': { es: 'Usar TLS', en: 'Use TLS' },
  'payload.socksProxy': { es: 'Proxy SOCKS', en: 'SOCKS Proxy' },
  'payload.socksPort': { es: 'Puerto SOCKS local', en: 'Local SOCKS port' },
  'payload.commandPreview': { es: 'Comando que se ejecutará', en: 'Command to execute' },
  'payload.generate': { es: 'Generar Payload', en: 'Generate Payload' },
  'payload.regenerate': { es: 'Regenerar', en: 'Regenerate' },
  'payload.download': { es: 'Descargar Payload', en: 'Download Payload' },
  'payload.deploymentSteps': { es: 'Pasos de despliegue', en: 'Deployment Steps' },
  'payload.step1': { es: '1. Sube el binario del túnel a tu VPS', en: '1. Upload tunnel binary to your VPS' },
  'payload.step2': { es: '2. Asegúrate de que es accesible vía HTTPS', en: '2. Ensure it is accessible via HTTPS' },
  'payload.step3': { es: '3. Genera el payload con la configuración', en: '3. Generate payload with configuration' },
  'payload.step4': { es: '4. Entrega el payload (email, SMS, WhatsApp)', en: '4. Deliver payload (email, SMS, WhatsApp)' },
  'payload.step5': { es: '5. El túnel se activa, recibes conexión en tu VPS', en: '5. Tunnel activates, you receive connection on VPS' },
  'payload.sniPresets': { es: 'Presets SNI', en: 'SNI Presets' },
  'payload.sni.instagram': { es: 'Instagram', en: 'Instagram' },
  'payload.sni.facebook': { es: 'Facebook', en: 'Facebook' },
  'payload.sni.twitter': { es: 'Twitter/X', en: 'Twitter/X' },
  'payload.sni.google': { es: 'Google', en: 'Google' },
  'payload.sni.microsoft': { es: 'Microsoft', en: 'Microsoft' },
  'payload.sni.custom': { es: 'Personalizado', en: 'Custom' },
  'payload.goldenRules': { es: 'Reglas de Oro', en: 'Golden Rules' },
  'payload.deliveryVector': { es: 'Vector de entrega sugerido', en: 'Suggested delivery vector' },
  'payload.delivery.email': { es: 'Email — adjuntar como documento', en: 'Email — attach as document' },
  'payload.delivery.whatsapp': { es: 'WhatsApp — enviar como archivo', en: 'WhatsApp — send as file' },
  'payload.delivery.sms': { es: 'SMS — enviar enlace acortado', en: 'SMS — send shortened link' },
  'payload.delivery.telegram': { es: 'Telegram — subir como documento', en: 'Telegram — upload as document' },
  'payload.delivery.linkedin': { es: 'LinkedIn — DM con enlace', en: 'LinkedIn — DM with link' },
  'payload.generated': { es: 'Payload generado', en: 'Payload generated' },
  'payload.type.html-sw': { es: 'Service Worker Drive-By', en: 'Service Worker Drive-By' },
  'payload.type.html-captive': { es: 'Portal Cautivo WiFi', en: 'WiFi Captive Portal' },
  'payload.type.html-xss': { es: 'WebView XSS Bridge', en: 'WebView XSS Bridge' },
  'payload.error': { es: 'Error al generar', en: 'Generation error' },} as const satisfies Record<string, { es: string; en: string }>

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
