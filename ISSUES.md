# SSH Tunnel Manager — Issues & Roadmap

## Issue 0 — Estudio técnico: ssh2, redes y port forwarding

**Prioridad**: MÁXIMA — Antes de tocar código, entender bien la teoría y la librería.

### Objetivo
Investigar y documentar cómo funcionan los túneles SSH a nivel de protocolo, cómo los implementa la librería ssh2, y crear una base de conocimiento sólida para el desarrollo.

### Documento base del proyecto

**`/home/plasencio/proyectos/tuneles-ssh-deep.md`** (22.6KB, 10 secciones)

Cubre en profundidad: protocolo SSH2 a nivel wire (RFC 4251/4254), SSH Mastery (PermitOpen, ControlMaster, ForceCommand), TCP/IP Illustrated (half-close, Nagle, TIME_WAIT), internals de ngrok/frp/rathole, implementación propia de túneles (qmux, io.Copy), casos ofensivos (autossh, multi-hop, C2), comparativa de herramientas, y debug avanzado (-vvv, tcpdump, ExitOnForwardFailure).

**Consultar este documento antes de implementar cualquier feature de túneles.**

### Documentación de referencia adicional

#### Protocolo SSH (RFCs)
- **RFC 4254** — SSH Connection Protocol: define `direct-tcpip` (local forward) y `forwarded-tcpip` (remote forward)
  - Sección 7.1: el cliente pide al servidor que escuche en un puerto (Remote -R)
  - Sección 7.2: dos tipos de canal — `direct-tcpip` (Local -L) y `forwarded-tcpip` (Remote -R)
  - Enlace: https://datatracker.ietf.org/doc/html/rfc4254
  - Versión anotada: https://www.hjp.at/doc/rfc/rfc4254.html
- **RFC 4253** — SSH Transport Layer: cifrado y autenticación
- **RFC 4252** — SSH Authentication: contraseña y clave pública
- **RFC 4251** — SSH Architecture: visión general de capas
- **RFC 1928** — Protocolo SOCKS5 (para Dynamic -D)
- **RFC 1929** — Autenticación SOCKS5

#### Explicaciones en lenguaje claro del RFC 4254
- **Apache MINA sshd** — el mejor desglose práctico del protocolo con contexto de implementación: https://github.com/apache/mina-sshd/blob/master/docs/technical/tcpip-forwarding.md
- **iximiuz Visual Guide to SSH Tunnels** — diagramas de flujo local vs remote: https://iximiuz.com/en/posts/ssh-tunnels/
- **Net::SSH Manual, Cap. 3: Channels** — explica `direct-tcpip` y `forwarded-tcpip`: https://net-ssh.github.io/ssh/v1/chapter-3.html

#### Librería ssh2 para Node.js
- **Repositorio**: https://github.com/mscdex/ssh2
- **npm**: https://www.npmjs.com/package/ssh2 (~4.8M descargas/semana)
- **API clave para túneles**:
  - `Client.forwardOut()` → abre canal `direct-tcpip` (Local Forward -L)
  - `Client.forwardIn()` + evento `tcp connection` → Remote Forward (-R)
  - `Client.sftp()` → subsistema SFTP
  - Canal `session` con `shell` → shell interactiva (terminal web)

#### Bug conocido de ssh2 — Issue #814
- **Problema**: si la conexión SSH cae mientras `forwardOut()` espera respuesta, el callback NUNCA se ejecuta. No hay error, no hay timeout, se queda colgado.
- **Enlace**: https://github.com/mscdex/ssh2/issues/814
- **Workaround**: envolver `forwardOut()` en un Promise con timeout manual + escuchar `conn.on('end')` y `conn.on('error')` en paralelo.
- **Issues relacionados**:
  - #852 — cómo implementar local port forwarding correctamente: https://github.com/mscdex/ssh2/issues/852
  - #618 — race condition "callback already called": https://github.com/mscdex/ssh2/issues/618
  - #64 — configuración inicial de túnel con forwardOut: https://github.com/mscdex/ssh2/issues/64

#### Librerías alternativas y wrappers
| Librería | Estilo | Auto-reconexión | Port forwarding | Notas |
|----------|--------|-----------------|-----------------|-------|
| **ssh2** | Callbacks | No | `forwardOut`, `forwardIn` | El estándar. Bug #814 del callback. |
| **ssh2-promise** | Promises/async | Sí (built-in, 10 retries) | `addTunnel()` | Mitiga el bug con timeouts. TypeScript nativo. |
| **node-ssh** | Promises | No | Wraps ssh2 | Pensado para exec/sftp, no ideal para túneles. |
| **tunnel-ssh** | Wrapper ssh2 | No | `createTunnel()` → `net.Server` | npm: https://www.npmjs.com/package/tunnel-ssh |
| **open-ssh-tunnel** | Promises | No | Promise → `net.Server` | https://github.com/parro-it/open-ssh-tunnel |
| **node-ssh-socks5-tunnel-client** | — | No | SOCKS5 sobre ssh2 | Para Dynamic -D: https://github.com/arthow4n/node-ssh-socks5-tunnel-client |

- Comparativa npm: https://npmtrends.com/node-ssh-vs-ssh2-vs-ssh2-promise
- Comparativa detallada: https://npm-compare.com/ssh2,node-ssh,ssh2-promise

#### Libros
| Libro | Autor | Qué cubre |
|-------|-------|-----------|
| **The Cyber Plumber's Handbook** | Brennon Thomas | GRATIS: https://github.com/opsdisk/the_cyber_plumbers_handbook — 100% tunneling SSH, SOCKS proxies, chaining. |
| **SSH Mastery** | Michael W. Lucas | Local/Remote/Dynamic forwarding, ProxyJump, certificados SSH, agent forwarding. Práctico. |
| **SSH, The Secure Shell: The Definitive Guide** | Barrett, Silverman, Byrnes | O'Reilly. Capítulos 9-11: protocolo interno, multiplexación de canales, `direct-tcpip`/`forwarded-tcpip`. |
| **TCP/IP Illustrated** | W. Richard Stevens | La biblia de redes. TCP, UDP, NAT, sockets — el "por qué" detrás del port forwarding. |

#### Proyectos open source de referencia (cómo lo hacen otros)
| Proyecto | URL | Qué estudiar |
|----------|-----|--------------|
| **tnnlr** | https://github.com/turtlemonvh/tnnlr | Node.js + web UI en :8080, grupos de túneles |
| **tunnels** (Electron) | https://github.com/parro-it/tunnels | App de escritorio con GUI, usa open-ssh-tunnel |
| **ssh-tunnel-manager** | https://github.com/ibartel/ssh-tunnel-manager | Node.js, config YAML, perfiles de conexión |
| **SSH_Tunnel_Manager** | https://github.com/elModo7/SSH_Tunnel_Manager | GUI con auto-reconexión y notificaciones |
| **rathole** (Rust) | https://github.com/rapiz1/rathole | Reverse tunnel ligero, código limpio para estudiar |
| **bore** (Rust) | https://github.com/ekzhang/bore | Tunnel minimalista, implementación de referencia |
| **frp** (Go) | https://github.com/fatedier/frp | Fast reverse proxy, muy usado, docs extensos |
| **ngrok** | https://ngrok.com | Referencia comercial. Blog técnico con arquitectura |
| **Cloudflare Tunnel** | https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/ | Alternativa sin SSH, usa QUIC |

- Más proyectos: https://github.com/topics/ssh-tunnel?o=desc&s=updated

### Tareas de investigación
1. Leer RFC 4254 secciones 7.1 y 7.2 + el documento de Apache MINA sshd para entender `direct-tcpip` y `forwarded-tcpip`.
2. Leer Issue #814 de ssh2 y los workarounds propuestos. Comparar con nuestra implementación.
3. Revisar Issue #852 de ssh2 — tiene un patrón funcional de local port forwarding.
4. Estudiar el código de `tunnel-ssh` y `open-ssh-tunnel` — son wrappers probados sobre ssh2.
5. Evaluar si migrar a `ssh2-promise` (tiene auto-reconexión y mitiga el bug del callback).
6. Descargar "The Cyber Plumber's Handbook" (gratis) y leer los capítulos de SSH tunneling.
7. Estudiar cómo `rathole` y `bore` manejan reconexión y keep-alive.
8. Documentar hallazgos y decisión técnica antes de implementar.

### Resultados de la investigación (2026-05-10)

#### Causa raíz del bug de Local tunnels: orden de inicialización y piping
El problema NO era ssh2 ni el runtime. Era nuestro código:

1. **Orden incorrecto**: nuestro código creaba el `net.Server` primero y conectaba SSH después (dentro del callback de `server.listen`). El patrón correcto (confirmado por tunnel-ssh y los ejemplos oficiales) es conectar SSH primero y crear el servidor dentro del callback `ready`.
2. **srcAddr/srcPort**: usábamos `socket.remoteAddress` y `socket.remotePort` (la dirección del cliente que conecta). El patrón estándar usa la dirección del servidor local.
3. **Piping**: teníamos listeners `on('data')` separados que interferían con el pipe. El patrón correcto es `socket.pipe(stream).pipe(socket)` encadenado.

#### Decisión técnica
- **Mantener ssh2** como librería principal. Funciona correctamente con Node.js/tsx cuando se usa con el patrón correcto.
- **NO usar Bun** para el tunnel-service. ssh2 no es compatible con Bun (forwardOut nunca ejecuta el callback).
- **NO migrar a ssh2-promise** por ahora. ssh2 directo funciona bien y da más control.
- **Estudiar tunnel-ssh** como referencia para auto-reconexión y cleanup.

#### Estado: Local tunnels ARREGLADO ✅
El `startLocalTunnel()` fue reescrito siguiendo el patrón correcto. Probado y funcionando tanto desde localhost como desde red local.

#### Pendiente
- Aplicar el mismo patrón a Remote tunnels (`forwardIn` + evento `tcp connection`)
- Aplicar el mismo patrón a Dynamic tunnels (SOCKS5 + `forwardOut`)
- Implementar auto-reconexión (Issue 5)

---

## Bugs críticos

### 1. ~~Túneles ssh2 Local no reenvían datos~~ → RESUELTO ✅
- **Causa**: orden de inicialización incorrecto y patrón de piping inadecuado (ver hallazgos Issue 0).
- **Solución aplicada**: reescrito `startLocalTunnel()` con el patrón SSH-first + pipe encadenado.

### 1b. Remote tunnel (-R) no funciona
- **Archivo**: `mini-services/tunnel-service/index.ts` función `startRemoteTunnel()`
- **Problema**: Usa ssh2 con `forwardIn()` + evento `tcp connection`. No se ha probado tras los arreglos de Local. Posiblemente funcione si el patrón es correcto.
- **Acción**: Probar y arreglar siguiendo el mismo patrón que Local.

### 1c. Dynamic tunnel (-D/SOCKS) no funciona
- **Archivo**: `mini-services/tunnel-service/index.ts` función `startDynamicTunnel()`
- **Problema**: Implementación SOCKS5 manual + forwardOut. No probado tras arreglos.
- **Acción**: Probar y arreglar. Considerar usar `node-ssh-socks5-tunnel-client` como referencia.
  - Timeout o configuración del servidor SSH remoto (`AllowTcpForwarding`, `GatewayPorts`)
- **Nota**: Revertir el parche de SSH nativo una vez se arregle ssh2.

### 2. Contraseñas almacenadas en texto plano
- **Archivo**: `schema.prisma` línea 21
- **Problema**: `sshPassword` se guarda sin cifrar en SQLite. El propio schema tiene un comentario que dice "stored encrypted in real app" pero no se implementó.
- **Solución**: Cifrar con `crypto.createCipheriv()` antes de guardar y descifrar al leer.

### 4. API sin autenticación
- **Archivos**: `app/api/tunnels/route.ts`, `app/api/tunnels/start/route.ts`, `app/api/tunnels/stop/route.ts`
- **Problema**: Cualquiera en la red puede crear, borrar o arrancar túneles accediendo a la API directamente.
- **Solución**: Añadir autenticación con sesión (next-auth ya está instalado) o API key.

---

## Funcionalidad core

### 5. Auto-reconexión
- **Archivo**: `mini-services/tunnel-service/index.ts`
- **Problema**: Si un túnel SSH se cae (corte de red, reinicio del servidor remoto), queda en estado "error" permanentemente. Requiere reinicio manual.
- **Solución**: Implementar reintentos con backoff exponencial (1s, 2s, 4s, 8s... hasta 5 minutos). Máximo de reintentos configurable por túnel.

### 6. Estado en tiempo real desincronizado
- **Archivos**: `lib/tunnel-store.ts`, `lib/tunnel-client.ts`
- **Problema**: El frontend solo consulta el estado via REST al montar el componente. No escucha los eventos Socket.io (`tunnel:status-update`, `tunnel:started`, `tunnel:error`). Si un túnel se cae, la UI sigue mostrando "Activo" hasta que el usuario recarga.
- **Solución**: Suscribir el Zustand store a los eventos Socket.io para sincronizar estado en tiempo real.

### 7. No se pueden editar túneles
- **Archivo**: `components/tunnel-list.tsx`
- **Problema**: Para cambiar un puerto o host hay que borrar el túnel y crear uno nuevo.
- **Solución**: Añadir botón de edición que abra el formulario pre-rellenado con los datos actuales. El endpoint PATCH ya existe en la API.

### 8. Arranque automático al boot
- **Archivo**: `mini-services/tunnel-service/index.ts`
- **Problema**: Al reiniciar el tunnel-service se pierden todos los túneles activos. Hay que arrancarlos uno por uno manualmente.
- **Solución**: Al iniciar el servicio, consultar la base de datos, buscar túneles con status "active" y arrancarlos automáticamente. Añadir flag `autoStart` al schema de Prisma.

### 9. Health check del tunnel-service
- **Archivo**: `mini-services/tunnel-service/index.ts`
- **Problema**: No hay forma de saber si el tunnel-service está corriendo sin mirar los procesos del sistema.
- **Solución**: Añadir endpoint HTTP GET `/health` que devuelva estado del servicio y número de túneles activos.

---

## Acceso remoto (nuevas features)

### 10. Terminal web integrada
- **Concepto**: Abrir una shell SSH al servidor remoto directamente desde el navegador.
- **Tecnología**: xterm.js + addon-fit + WebSocket. El tunnel-service crea una sesión SSH interactiva y la conecta al WebSocket del navegador.
- **Beneficio**: Acceso remoto completo sin necesidad de un cliente SSH local.

### 11. SFTP / File browser
- **Concepto**: Navegar el sistema de archivos del servidor remoto, subir y bajar archivos desde la web.
- **Tecnología**: ssh2-sftp-client o sftp nativo sobre SSH.
- **Beneficio**: Transferencia de archivos sin herramientas extra.

### 12. Reverse tunnel como servicio (ngrok casero)
- **Concepto**: Desde la web, crear un reverse tunnel que exponga un servicio local con URL pública.
- **Implementación**:
  - Configurar un dominio wildcard (*.tunnels.tudominio.com)
  - Reverse tunnel SSH (-R) al servidor con Nginx como proxy
  - Let's Encrypt para HTTPS automático
- **Beneficio**: ngrok self-hosted gratis, sin límites.

### 13. Wake-on-LAN
- **Concepto**: Encender máquinas remotas desde la interfaz web enviando magic packet.
- **Tecnología**: Paquete UDP WoL a la MAC address del equipo.
- **Beneficio**: Arrancar servidores de tu red sin estar físicamente presente.

### 14. VNC/RDP viewer web
- **Concepto**: Escritorio remoto integrado en el navegador.
- **Tecnología**: noVNC (viewer VNC HTML5) o Apache Guacamole.
- **Implementación**: Crear un túnel local al puerto VNC/RDP del servidor remoto y conectar noVNC a ese túnel.
- **Beneficio**: Escritorio remoto desde cualquier navegador sin instalar nada.

---

## Mejoras de UX

### 15. Logs en vivo
- **Concepto**: Panel de debug donde ver la salida del proceso SSH de cada túnel en tiempo real.
- **Implementación**: Capturar stdout/stderr del proceso SSH spawneado y emitir por Socket.io al frontend.

### 16. Métricas y monitoreo
- **Concepto**: Dashboard con tráfico (bytes in/out), conexiones activas, uptime y latencia por túnel.
- **Estado actual**: El tunnel-service ya calcula `totalBytesIn`, `totalBytesOut`, `connections` y `uptime` internamente pero no lo muestra en la UI.
- **Solución**: Exponer métricas via Socket.io y mostrar en tarjetas de cada túnel con gráficas (recharts ya instalado).

### 17. Notificaciones
- **Concepto**: Alertas cuando un túnel se cae o se reconecta.
- **Canales**: Telegram bot, email (nodemailer), webhook genérico.
- **Configuración**: Sección de ajustes en la app para configurar los canales.

### 18. Templates / Presets
- **Concepto**: Configuraciones predefinidas para casos de uso comunes.
- **Ejemplos**:
  - "Acceso a MySQL remoto" → Local -L 3306:localhost:3306
  - "Proxy SOCKS" → Dynamic -D 1080
  - "ngrok casero" → Remote -R 80:localhost:3000
  - "Escritorio remoto" → Local -L 5900:localhost:5900
- **Beneficio**: Crear túneles complejos con un click sin saber la sintaxis SSH.

### 19. Grupos de túneles
- **Concepto**: Organizar túneles por categoría ("Trabajo", "Casa amigo", "VPS producción") con arranque/parada por grupo.
- **Schema**: Añadir modelo `TunnelGroup` en Prisma con relación 1:N a `Tunnel`.

### 20. Tema oscuro/claro
- **Estado**: `next-themes` ya instalado como dependencia.
- **Solución**: Implementar toggle en la barra superior y aplicar clases de Tailwind.

---

## Seguridad

### 21. Login con autenticación
- **Estado**: `next-auth` ya instalado como dependencia.
- **Solución**: Configurar provider de credenciales (usuario/contraseña) o OAuth.

### 22. Audit log
- **Concepto**: Registrar quién creó, arrancó, paró o borró cada túnel y cuándo.
- **Schema**: Nuevo modelo `AuditLog` con campos: action, tunnelId, userId, timestamp, details.

### 23. Gestión de claves SSH
- **Concepto**: Generar keypairs, importar claves existentes y asignarlas a túneles desde la web.
- **Implementación**: Almacenar claves cifradas en la base de datos. Generar con `ssh-keygen`. Instalar con `ssh-copy-id`.

### 24. 2FA para operaciones sensibles
- **Concepto**: Pedir segundo factor antes de arrancar túneles, borrar configuraciones o cambiar credenciales.
- **Tecnología**: TOTP (Google Authenticator) con librería `otplib`.

---

## Estado actual del proyecto

| Componente | Estado |
|---|---|
| UI / Dashboard | ✅ Funcional |
| Local Forwarding (-L) | ✅ Funcional (ssh2, arreglado 2026-05-10) |
| Remote Forwarding (-R) | ❌ No probado tras arreglos |
| Dynamic Forwarding (-D) | ❌ No probado tras arreglos |
| Diagramas animados | ✅ Funcional |
| Explicaciones educativas | ✅ Funcional |
| Export/Import JSON | ✅ Funcional |
| Bilingüe ES/EN | ✅ Funcional |
| Cifrado de credenciales | ❌ No implementado |
| Autenticación de la app | ❌ No implementado |
| Auto-reconexión | ❌ No implementado |
| Estado en tiempo real | ❌ No implementado |

---

## Notas técnicas

- **Runtime**: El tunnel-service debe ejecutarse con Node.js (tsx). ssh2 NO funciona con Bun.
- **Librería ssh2**: Funciona correctamente con Node.js cuando se usa el patrón SSH-first + pipe encadenado. Sin dependencias del sistema.
- **Base de datos**: SQLite local en `dev.db`. Para producción considerar PostgreSQL.
- **Puerto del tunnel-service**: 3003 (configurable via env `TUNNEL_SERVICE_URL`).
- **Puerto de la app**: 3000.
- **Idioma**: Solo español. Selector de idioma pendiente de eliminar de la UI.
