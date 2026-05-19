import { mkdir, appendFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { NextRequest } from 'next/server'

const AUDIT_LOG_PATH = process.env.AUDIT_LOG_PATH || join(process.cwd(), 'logs', 'audit.log')

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown'
  }

  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  )
}

export async function writeDeleteAuditLog(
  request: NextRequest,
  resource: { type: 'tunnel' | 'deployment'; id: string; name?: string | null; status?: string | null }
) {
  const event = {
    timestamp: new Date().toISOString(),
    action: 'delete',
    ip: getClientIp(request),
    userAgent: request.headers.get('user-agent') || 'unknown',
    resource,
  }

  await mkdir(dirname(AUDIT_LOG_PATH), { recursive: true })
  await appendFile(AUDIT_LOG_PATH, `${JSON.stringify(event)}\n`, 'utf8')
}
