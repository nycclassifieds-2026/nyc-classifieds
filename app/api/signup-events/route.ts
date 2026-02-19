import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { sendPushToAdmins } from '@/lib/push'

const VALID_STEPS = ['email', 'otp', 'type', 'name', 'business', 'pin', 'address', 'selfie', 'done']
const VALID_STATUSES = ['started', 'completed', 'failed']

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)

  if (!await rateLimit(`signup-events:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let body: { session_id?: string; step?: string; status?: string; error?: string; metadata?: Record<string, unknown> }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { session_id, step, status, error, metadata } = body

  if (!session_id || typeof session_id !== 'string') {
    return NextResponse.json({ error: 'session_id required' }, { status: 400 })
  }
  if (!step || !VALID_STEPS.includes(step)) {
    return NextResponse.json({ error: 'Invalid step' }, { status: 400 })
  }
  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  // Length limits
  const safeSessionId = session_id.slice(0, 128)
  const safeError = error ? error.slice(0, 500) : null
  const safeMetadata = metadata ? JSON.parse(JSON.stringify(metadata).slice(0, 2000)) : null

  const db = getSupabaseAdmin()
  await db.from('signup_events').insert({
    session_id: safeSessionId,
    step,
    status,
    error: safeError,
    metadata: safeMetadata,
  })

  // Push notification to admins on signup failure
  if (status === 'failed') {
    sendPushToAdmins({ title: 'Signup failed', body: `Failed at ${step}${safeError ? ': ' + safeError : ''}`, url: '/admin' }).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
