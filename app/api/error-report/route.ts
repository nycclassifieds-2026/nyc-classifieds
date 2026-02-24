import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { notifyError } from '@/lib/errors'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  if (!await rateLimit(`error-report:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Too many reports' }, { status: 429 })
  }

  try {
    const { message, stack, url, userAgent } = await request.json()

    const errorMsg = [
      message || 'Unknown client error',
      url ? `URL: ${url}` : '',
      userAgent ? `UA: ${userAgent.slice(0, 100)}` : '',
      stack ? `Stack: ${stack.slice(0, 500)}` : '',
    ].filter(Boolean).join('\n')

    await notifyError('Client error', new Error(errorMsg))

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
