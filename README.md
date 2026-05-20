# SSH Port Forwarding Manager

Aplicacion web para crear, persistir, arrancar y monitorizar tuneles SSH desde una UI Next.js. El repo combina una app web, una API propia, un mini-servicio Socket.io que mantiene las conexiones SSH vivas y un servidor MCP para automatizar operaciones sobre tuneles y deployments.

## Estado del repositorio

- Rama actual: `feature/reverse-tunnel-deployer-wip`
- Upstream: `origin/feature/reverse-tunnel-deployer-wip`
- Commit actual: `d65307390b7dff8ebf6f4a775a721f87da2812b8`
- Tras `git fetch --prune origin`, la rama local esta sincronizada con el remoto: `0` commits por delante y `0` por detras.

## Stack

- Next.js 16, React 19 y TypeScript.
- Tailwind CSS 4, shadcn/ui y Radix UI.
- Prisma 6 con SQLite.
- Socket.io y `ssh2` para la ejecucion real de tuneles.
- Zustand para estado cliente.
- Framer Motion y lucide-react en la UI.
- MCP SDK para exponer herramientas automatizables.

## Requisitos

- Node.js compatible con Next.js 16.
- npm.
- SQLite accesible mediante `DATABASE_URL`.
- Python 3 si vas a usar los generadores de payloads de `scripts/`.
- Acceso SSH a los hosts que quieras gestionar.
- `autossh` disponible o instalable en targets si vas a usar el Reverse Tunnel Deployer.
- Binarios externos instalados si arrancas tecnicas avanzadas por comando (`chisel`, `ligolo-ng`, `iodine`, `ptunnel-ng`, `wstunnel`, `frpc`, `hysteria`, etc.).

## Instalacion

```bash
cd /home/plasencio/ssh-tunnel-manager-clean
npm install
npm run db:generate
npm run db:push
```

Define la base de datos antes de ejecutar Prisma si no la tienes ya en el entorno:

```bash
export DATABASE_URL="file:./dev.db"
```

El servicio de tuneles tiene su propio paquete:

```bash
cd /home/plasencio/ssh-tunnel-manager-clean/mini-services/tunnel-service
npm install
```

## Ejecutar en desarrollo

Terminal 1, servicio runtime de tuneles:

```bash
cd /home/plasencio/ssh-tunnel-manager-clean/mini-services/tunnel-service
npm run dev
```

Terminal 2, aplicacion web:

```bash
cd /home/plasencio/ssh-tunnel-manager-clean
npm run dev
```

Abre `http://localhost:3000`. El servicio de tuneles escucha en `http://localhost:3003` y expone healthcheck en:

```bash
curl http://localhost:3003/health
```

Variables utiles:

```bash
export DATABASE_URL="file:./dev.db"
export TUNNEL_SERVICE_URL="http://localhost:3003"
export NEXT_PUBLIC_TUNNEL_SERVICE_URL="http://localhost:3003"
```

## Funcionalidades principales

- Gestion CRUD de tuneles persistidos en SQLite.
- Arranque y parada de tuneles desde la UI o API.
- Local forwarding (`ssh -L`), remote forwarding (`ssh -R`) y dynamic forwarding/SOCKS (`ssh -D`).
- Estado en tiempo real mediante Socket.io.
- Metricas runtime por tunel: conexiones, bytes, uptime, errores y estado.
- Importacion/exportacion de configuraciones desde la UI.
- Diagramas y explicaciones bilingues ES/EN.
- Reverse Tunnel Deployer para crear un reverse tunnel persistente con `autossh` y `systemd`.
- Pestaña de tecnicas avanzadas con referencias a herramientas externas.
- Registro y seleccion de proxies SOCKS disponibles.
- Generador de artefactos de laboratorio en `Payloads`, apoyado en scripts locales.
- MCP server y agente OpenAI-compatible para operar tuneles desde herramientas externas.

## Arquitectura

```txt
UI Next.js
  -> API routes en app/api
    -> Prisma / SQLite
    -> lib/tunnel-client.ts
      -> Socket.io
        -> mini-services/tunnel-service/index.ts
          -> ssh2 / net / procesos externos

MCP client o agente
  -> mcp/tunnel-server.ts
    -> API Next.js
      -> tunnel-service
```

La app web no mantiene directamente sockets SSH largos. Las rutas API validan y persisten configuracion; el mini-servicio `tunnel-service` es quien abre forwards locales/remotos, SOCKS y procesos de tecnicas externas.

## Estructura real del repo

```txt
/home/plasencio/ssh-tunnel-manager-clean
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── api/
│       ├── tunnels/
│       ├── deployments/
│       ├── payloads/
│       ├── proxies/
│       ├── credprobe/
│       └── browser-profile/
├── components/
│   ├── main-tabs.tsx
│   ├── tunnel-manager.tsx
│   ├── tunnel-form.tsx
│   ├── tunnel-list.tsx
│   ├── deployment-manager.tsx
│   ├── payload-generator.tsx
│   ├── advanced-tunnel-techniques.tsx
│   └── ui/
├── lib/
│   ├── db.ts
│   ├── tunnel-client.ts
│   ├── tunnel-store.ts
│   ├── deployer.ts
│   ├── audit-log.ts
│   └── i18n.ts
├── mini-services/
│   └── tunnel-service/
│       ├── index.ts
│       └── package.json
├── mcp/
│   ├── tunnel-server.ts
│   ├── tunnel-agent.ts
│   └── README.md
├── scripts/
│   ├── polyglot_gen.py
│   ├── driveby_generator.sh
│   └── browser_cloner.py
├── schema.prisma
├── package.json
└── README.md
```

Nota: el proyecto usa carpetas `app/`, `components/`, `lib/` y `hooks/` en la raiz. No hay carpeta `src/`.

## Modelos de datos

`Tunnel` guarda la configuracion persistida del tunel:

- `type`: `local`, `remote` o `dynamic`.
- `status`: `stopped`, `starting`, `active` o `error`.
- conexion SSH: host, puerto, usuario, password o ruta de clave.
- bind local/remoto y puertos.
- `technique` y `command` opcionales para lanzar binarios externos.

`Deployment` guarda despliegues de reverse tunnel persistente:

- host target detras de NAT.
- VPS publico.
- puerto remoto, puerto local y nombre de servicio.
- opciones de `camouflage` e `ipQosBackground`.
- fase actual, clave publica generada, errores, `deployedAt` y `lastSeen`.

## Rutas API

- `GET /api/tunnels`: lista tuneles.
- `POST /api/tunnels`: crea un tunel.
- `PATCH /api/tunnels?id=...`: actualiza un tunel.
- `DELETE /api/tunnels?id=...`: borra un tunel parado, requiere `{"confirmDelete": true}`.
- `POST /api/tunnels/start?id=...`: arranca un tunel via `tunnel-service`.
- `POST /api/tunnels/stop?id=...`: detiene un tunel via `tunnel-service`.
- `GET /api/deployments`: lista deployments.
- `POST /api/deployments`: crea un deployment.
- `PATCH /api/deployments?id=...`: actualiza un deployment.
- `DELETE /api/deployments?id=...`: borra un deployment no activo, requiere confirmacion.
- `POST /api/deployments/deploy?id=...`: ejecuta el despliegue remoto con `autossh` y `systemd`.
- `GET /api/deployments/check?id=...`: verifica si el puerto remoto del deployment responde en el VPS.
- `GET|POST|PUT|DELETE /api/proxies`: gestiona el registro local de proxies en `/tmp/hermes-proxies.json`.
- `GET|POST /api/credprobe`: selecciona el mejor proxy SOCKS disponible o ejecuta una validacion de conectividad.
- `POST /api/credprobe/validate`: ejecuta una comprobacion via proxy SOCKS.
- `POST /api/browser-profile/ingest`: guarda perfiles recibidos en `/tmp/hermes-ingest`.
- `GET /api/browser-profile/ingest`: lista las ultimas ingestas guardadas.
- `POST /api/payloads/generate`: genera un artefacto de laboratorio a partir de los scripts de `scripts/`.

## Servicio de tuneles

El servicio esta en `mini-services/tunnel-service/index.ts` y escucha en el puerto `3003`.

Eventos Socket.io principales:

- `tunnel:start`: arranca un tunel persistido o efimero.
- `tunnel:stop`: detiene un tunel.
- `tunnel:started`: confirma arranque.
- `tunnel:stopped`: confirma parada.
- `tunnel:error`: publica errores.
- `tunnel:status-update`: emite snapshot runtime para la UI.

Implementaciones:

- Local tunnel: crea un servidor TCP local y usa `ssh2.forwardOut`.
- Remote tunnel: usa `ssh2.forwardIn` y conecta hacia el servicio local configurado.
- Dynamic tunnel: expone proxy SOCKS local sobre SSH.
- Tecnicas externas: lanza el `command` indicado como proceso hijo y asocia su ciclo de vida al tunel.

## Reverse Tunnel Deployer

La pestaña `Deployer` crea deployments que automatizan este flujo:

1. Conectar al VPS.
2. Crear o preparar `tunneluser`.
3. Ajustar `sshd_config` para permitir el puerto remoto definido.
4. Conectar al target.
5. Instalar `autossh` si falta.
6. Crear clave ed25519 para `tunneluser` en el target.
7. Registrar la clave publica en el VPS.
8. Crear y activar un servicio `systemd` en el target.
9. Verificar el puerto remoto en el VPS.

El servicio por defecto se llama `network-connectivity`, el puerto remoto por defecto es `2222` y el puerto local por defecto es `22`.

## MCP

El servidor MCP se ejecuta con:

```bash
cd /home/plasencio/ssh-tunnel-manager-clean
npm run mcp:tunnels
```

El agente interactivo se ejecuta con:

```bash
cd /home/plasencio/ssh-tunnel-manager-clean
npm run agent:tunnels
```

Consulta [mcp/README.md](/home/plasencio/ssh-tunnel-manager-clean/mcp/README.md) para la configuracion de clientes MCP, variables `OPENAI_*`/`DEEPSEEK_*` y listado completo de tools.

## Scripts disponibles

Raiz del proyecto:

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:reset
npm run mcp:tunnels
npm run agent:tunnels
```

Servicio de tuneles:

```bash
cd /home/plasencio/ssh-tunnel-manager-clean/mini-services/tunnel-service
npm run dev
```

## Build de produccion

```bash
cd /home/plasencio/ssh-tunnel-manager-clean
npm run build
npm run start
```

`npm run start` usa Bun para levantar `.next/standalone/server.js`, asi que necesitas Bun en el entorno de produccion o cambiar el script para usar Node.

## Comprobaciones rapidas

```bash
git status --short --branch
git rev-list --left-right --count HEAD...@{upstream}
npm run lint
curl http://localhost:3003/health
curl http://localhost:3000/api/tunnels
```

## Notas operativas pendientes

- No hay autenticacion en las rutas API.
- Las credenciales SSH se guardan en SQLite si se envian como password.
- `lib/db.ts` tiene logging Prisma de queries activado.
- Algunas rutas usan ficheros temporales en `/tmp`.
- `POST /api/payloads/generate` contiene rutas absolutas al workspace actual.
- El script `start` depende de Bun aunque el desarrollo normal usa npm/Next.
