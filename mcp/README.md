# SSH Tunnel Manager MCP

Esta carpeta contiene dos piezas:

- `tunnel-server.ts`: servidor MCP que expone herramientas para gestionar túneles.
- `tunnel-agent.ts`: capa agente que conecta un modelo OpenAI-compatible, por defecto DeepSeek, con el servidor MCP.

## Arquitectura

```txt
Usuario
  -> tunnel-agent.ts
    -> DeepSeek / modelo OpenAI-compatible
      -> tool calls
    -> tunnel-server.ts (MCP)
      -> SSH Tunnel Manager API
        -> tunnel-service
```

El modelo no ejecuta acciones directamente. El agente recibe la respuesta del modelo, ejecuta las tools MCP y devuelve el resultado al modelo.

## Requisitos

1. Node.js.
2. Dependencias instaladas:

```sh
npm install
```

3. Base de datos preparada:

```sh
npm run db:generate
npm run db:push
```

4. App y tunnel-service en marcha:

```sh
npm run dev
```

En otra terminal:

```sh
cd mini-services/tunnel-service
npx tsx index.ts
```

Comprobacion:

```sh
curl http://localhost:3003/health
```

## Tools MCP disponibles

`tunnel-server.ts` expone estas tools:

- `get_tunnel_service_health`: comprueba si `tunnel-service` esta vivo.
- `list_tunnels`: lista tuneles configurados.
- `create_tunnel`: crea un tunel configurado.
- `start_tunnel`: arranca un tunel existente.
- `stop_tunnel`: detiene un tunel existente.
- `start_ephemeral_tunnel`: arranca un tunel runtime-only sin guardarlo en la base de datos.
- `stop_ephemeral_tunnel`: detiene un tunel runtime-only.
- `list_deployments`: lista reverse tunnel deployments.
- `create_deployment`: crea una configuracion de reverse tunnel deployment.
- `deploy_reverse_tunnel`: ejecuta el deploy remoto con autossh/systemd.
- `check_deployment`: verifica si un deployment esta activo.

El MCP no expone tools para borrar registros persistidos. El borrado de tuneles/deployments queda reservado a la web/UI, donde debe haber confirmacion explicita.

## Ejecutar solo el MCP server

Este modo sirve para clientes MCP externos.

```sh
npm run mcp:tunnels
```

Variables opcionales:

```sh
TUNNEL_MANAGER_URL=http://localhost:3000
TUNNEL_SERVICE_URL=http://localhost:3003
```

Ejemplo de configuracion para un cliente MCP que use stdio:

```json
{
  "mcpServers": {
    "ssh-tunnel-manager": {
      "command": "npm",
      "args": ["run", "mcp:tunnels"],
      "cwd": "/home/plasencio/ssh-tunnel-manager-clean",
      "env": {
        "TUNNEL_MANAGER_URL": "http://localhost:3000",
        "TUNNEL_SERVICE_URL": "http://localhost:3003"
      }
    }
  }
}
```

## Ejecutar el agente con DeepSeek

Configura credenciales:

```sh
export DEEPSEEK_API_KEY="sk-..."
export DEEPSEEK_BASE_URL="https://api.deepseek.com"
export DEEPSEEK_MODEL="deepseek-chat"
```

Arranca el agente interactivo:

```sh
npm run agent:tunnels
```

O haz una llamada de una sola vez:

```sh
npm run agent:tunnels -- "lista los tuneles configurados"
```

Ejemplos:

```txt
lista los tuneles configurados
```

```txt
crea un tunel local llamado mysql-prod al servidor 10.0.0.5 con usuario root, clave /home/plasencio/.ssh/id_ed25519, puerto local 3307 hacia 127.0.0.1:3306
```

```txt
arranca el tunel cmo123
```

```txt
deten el tunel cmo123
```

Tunel efimero sin guardar en DB:

```txt
arranca un tunel efimero SOCKS en 127.0.0.1:1080 usando SSH root@10.0.0.5 con clave /home/plasencio/.ssh/id_ed25519
```

Reverse Tunnel Deployer:

```txt
crea un deployment llamado casa-ssh para exponer el puerto 22 del target 192.168.1.20 a traves del VPS 51.15.10.20 en el puerto remoto 2222
```

```txt
ejecuta el deployment dep_123
```

```txt
comprueba si el deployment dep_123 esta activo
```

## Usar otro modelo OpenAI-compatible

El agente usa el SDK `openai`, pero puedes apuntarlo a cualquier API compatible:

```sh
export OPENAI_API_KEY="..."
export OPENAI_BASE_URL="https://api.openai.com/v1"
export OPENAI_MODEL="gpt-4.1"
npm run agent:tunnels
```

Para proveedores compatibles:

```sh
export OPENAI_API_KEY="..."
export OPENAI_BASE_URL="https://tu-proveedor.example/v1"
export OPENAI_MODEL="modelo-compatible"
npm run agent:tunnels
```

Si defines variables `DEEPSEEK_*`, tienen prioridad sobre `OPENAI_*`.

## Flujo interno del agente

1. Arranca `tunnel-server.ts` por stdio usando `StdioClientTransport`.
2. Pide `listTools()` al MCP.
3. Convierte las tools MCP a formato OpenAI-compatible.
4. Envia mensajes y tools al modelo.
5. Si el modelo devuelve `tool_calls`, ejecuta cada llamada con `client.callTool()`.
6. Inserta el resultado como mensaje `tool`.
7. Repite hasta que el modelo devuelve una respuesta final.

## Seguridad

El agente esta pensado para desarrollo/local. Antes de usarlo en red o produccion:

- Implementar autenticacion en la app/API.
- Cifrar credenciales SSH guardadas.
- Mantener fuera del MCP las acciones destructivas sobre DB.
- Borrar tuneles/deployments persistidos solo desde la web/UI y con confirmacion.
- Evitar enviar passwords en prompts si puedes usar `sshKeyPath`.
- Ejecutar el MCP solo en un entorno confiable.

## Troubleshooting

Si el agente no puede listar o crear tuneles:

```sh
curl http://localhost:3000/api/tunnels
```

Si el agente no puede arrancar o detener:

```sh
curl http://localhost:3003/health
```

Si el modelo no llama tools:

- Confirma que el proveedor soporta tool calling OpenAI-compatible.
- Usa un modelo con buen seguimiento de JSON/tool schema.
- Pide la accion de forma concreta y con campos obligatorios.

Campos minimos para crear tunel:

- `name`
- `type`: `local`, `remote` o `dynamic`
- `sshHost`
- `sshUser`
- `sshPassword` o `sshKeyPath`
- `localPort`
- Para `local`: `remoteBindAddr` y `remotePort`
- Para `remote`: `remotePort`

Campos minimos para crear deployment:

- `name`
- `targetHost`
- `targetUser`
- `targetPassword` o `targetKeyPath`
- `vpsHost`
- `vpsUser`
- `vpsPassword` o `vpsKeyPath`

## Frontera web vs MCP

La web gestiona registros persistidos en SQLite. Desde la web se pueden crear, arrancar, detener y borrar tuneles.

El MCP esta pensado para operacion asistida por modelo:

- Puede listar configuraciones persistidas.
- Puede crear configuraciones persistidas cuando se le pide.
- Puede arrancar/detener configuraciones existentes.
- Puede arrancar/detener tuneles efimeros que no entran en la DB.
- No puede borrar configuraciones persistidas.
