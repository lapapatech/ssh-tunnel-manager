import { Client as McpClient } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import OpenAI from 'openai'
import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import type {
  ChatCompletionMessageParam,
  ChatCompletionMessageFunctionToolCall,
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
} from 'openai/resources/chat/completions'

const MODEL_BASE_URL = process.env.DEEPSEEK_BASE_URL || process.env.OPENAI_BASE_URL || 'https://api.deepseek.com'
const MODEL_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY
const MODEL_NAME = process.env.DEEPSEEK_MODEL || process.env.OPENAI_MODEL || 'deepseek-chat'
const MAX_TOOL_ROUNDS = Number(process.env.AGENT_MAX_TOOL_ROUNDS || 8)

if (!MODEL_API_KEY) {
  console.error('Missing DEEPSEEK_API_KEY or OPENAI_API_KEY')
  process.exit(1)
}

function textFromToolResult(result: Awaited<ReturnType<McpClient['callTool']>>) {
  if ('toolResult' in result) {
    return JSON.stringify(result.toolResult)
  }

  return result.content
    .map((item) => {
      if (item.type === 'text') return item.text
      if (item.type === 'resource') return 'text' in item.resource ? item.resource.text : item.resource.blob
      if (item.type === 'image') return `[image:${item.mimeType}]`
      if (item.type === 'audio') return `[audio:${item.mimeType}]`
      if (item.type === 'resource_link') return `[resource:${item.uri}]`
      return JSON.stringify(item)
    })
    .join('\n')
}

function toOpenAiTools(tools: Awaited<ReturnType<McpClient['listTools']>>['tools']): ChatCompletionTool[] {
  return tools.map((tool) => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description || tool.title || tool.name,
      parameters: tool.inputSchema,
    },
  }))
}

function isFunctionToolCall(toolCall: ChatCompletionMessageToolCall): toolCall is ChatCompletionMessageFunctionToolCall {
  return toolCall.type === 'function'
}

async function createMcpClient() {
  const client = new McpClient({
    name: 'ssh-tunnel-manager-agent',
    version: '1.0.0',
  })

  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['tsx', 'mcp/tunnel-server.ts'],
    cwd: process.cwd(),
    env: {
      ...process.env,
      TUNNEL_MANAGER_URL: process.env.TUNNEL_MANAGER_URL || 'http://localhost:3000',
      TUNNEL_SERVICE_URL: process.env.TUNNEL_SERVICE_URL || 'http://localhost:3003',
    } as Record<string, string>,
    stderr: 'inherit',
  })

  await client.connect(transport)
  return { client, transport }
}

async function runAgentTurn(openai: OpenAI, mcp: McpClient, tools: ChatCompletionTool[], messages: ChatCompletionMessageParam[]) {
  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages,
      tools,
      tool_choice: 'auto',
    })

    const message = completion.choices[0]?.message
    if (!message) throw new Error('Model returned no message')

    messages.push(message as ChatCompletionMessageParam)

    if (!message.tool_calls?.length) {
      return message.content || ''
    }

    for (const toolCall of message.tool_calls.filter(isFunctionToolCall)) {
      const rawArgs = toolCall.function.arguments || '{}'
      let args: Record<string, unknown>

      try {
        args = JSON.parse(rawArgs)
      } catch {
        args = {}
      }

      const result = await mcp.callTool({
        name: toolCall.function.name,
        arguments: args,
      })

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: textFromToolResult(result),
      })
    }
  }

  throw new Error(`Agent exceeded ${MAX_TOOL_ROUNDS} tool rounds`)
}

async function main() {
  const prompt = process.argv.slice(2).join(' ').trim()
  const { client, transport } = await createMcpClient()
  const openai = new OpenAI({
    apiKey: MODEL_API_KEY,
    baseURL: MODEL_BASE_URL,
  })

  try {
    const mcpTools = await client.listTools()
    const tools = toOpenAiTools(mcpTools.tools)
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: [
          'You are an SSH Tunnel Manager agent.',
          'Use the available tools to inspect, create, start, and stop SSH tunnels.',
          'Treat Reverse Tunnel Deployer/autossh entries as persistent reverse tunnel deployments, not as normal list_tunnels records.',
          'When the user asks about reverse deployer tunnels, NAT reverse tunnels, persistent reverse tunnels, autossh, or deployed reverse tunnels, use list_reverse_tunnel_deployments, create_reverse_tunnel_deployment, deploy_reverse_tunnel, and check_deployment.',
          'You cannot delete persisted tunnels or deployments from MCP.',
          'Before creating or starting a tunnel, make sure required fields are known.',
          'Do not invent credentials, hosts, ports, or key paths. Ask for missing critical values.',
          'Prefer creating a tunnel or deployment first and asking before starting or deploying it unless the user explicitly asked to start or deploy it.',
        ].join(' '),
      },
    ]

    if (prompt) {
      messages.push({ role: 'user', content: prompt })
      const response = await runAgentTurn(openai, client, tools, messages)
      console.log(response)
      return
    }

    const rl = readline.createInterface({ input, output })
    console.log(`Tunnel agent ready. Model: ${MODEL_NAME}. Type "exit" to quit.`)

    while (true) {
      const line = (await rl.question('> ')).trim()
      if (!line) continue
      if (line === 'exit' || line === 'quit') break

      messages.push({ role: 'user', content: line })
      const response = await runAgentTurn(openai, client, tools, messages)
      console.log(response)
    }

    rl.close()
  } finally {
    await transport.close()
  }
}

main().catch((error) => {
  console.error('[agent:tunnels]', error)
  process.exit(1)
})
