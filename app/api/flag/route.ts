import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const COOKIE_NAME = 'nyc_classifieds_user'

export async function POST(request: NextRequest) {
  const userId = request.cookies.get(COOKIE_NAME)?.value
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const ip = getClientIp(request.headers)
  if (!rateLimit(`flag:${ip}`, 10, 300_000)) {
    return NextResponse.json({ error: 'Too many reports' }, { status: 429 })
  }

  const { content_type, content_id, reason } = await request.json()

  if (!content_type || !content_id || !reason?.trim()) {
    return NextResponse.json({ error: 'content_type, content_id, and reason required' }, { status: 400 })
  }

  if (!['listing', 'user', 'message'].includes(content_type)) {
    return NextResponse.json({ error: 'Invalid content_type' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  const { error } = await db.from('flagged_content').insert({
    reporter_id: parseInt(userId),
    content_type,
    content_id,
    reason: reason.trim(),
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 })
  }

  return NextResponse.json({ flagged: true }, { status: 201 })
}
