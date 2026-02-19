import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { sendEmail } from '@/lib/email'
import { flagConfirmationEmail, moderatorAlertEmail } from '@/lib/email-templates'
import { sendPushToAdmins } from '@/lib/push'
import { logEvent } from '@/lib/events'

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

  if (!['listing', 'user', 'message', 'porch_post', 'porch_reply'].includes(content_type)) {
    return NextResponse.json({ error: 'Invalid content_type' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  // Prevent duplicate flags from the same user
  const { data: existingFlag } = await db.from('flagged_content')
    .select('id')
    .eq('reporter_id', parseInt(userId))
    .eq('content_type', content_type)
    .eq('content_id', content_id)
    .single()

  if (existingFlag) {
    return NextResponse.json({ error: 'You have already reported this content' }, { status: 409 })
  }

  const { error } = await db.from('flagged_content').insert({
    reporter_id: parseInt(userId),
    content_type,
    content_id,
    reason: reason.trim(),
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 })
  }

  // Push notification to admins
  sendPushToAdmins({ title: 'New flag', body: `${content_type} flagged: ${reason.trim().slice(0, 100)}`, url: '/admin' }).catch(() => {})

  logEvent('flag', { content_type, content_id }, { userId: parseInt(userId), ip })

  // Send confirmation to reporter + alert to moderators (async)
  ;(async () => {
    try {
      const { data: reporter } = await db.from('users').select('email, name').eq('id', userId).single()
      if (reporter?.email && !reporter.email.endsWith('@example.com')) {
        await sendEmail(reporter.email, flagConfirmationEmail(reporter.name || 'there', content_type))
      }
      // Alert moderators
      const { data: mods } = await db.from('users').select('email, name').in('role', ['moderator', 'admin']).eq('banned', false)
      if (mods) {
        for (const mod of mods) {
          if (mod.email && !mod.email.endsWith('@example.com')) {
            await sendEmail(mod.email, moderatorAlertEmail(content_type, reason.trim(), reporter?.name || 'Anonymous'))
          }
        }
      }
    } catch {}
  })()

  return NextResponse.json({ flagged: true }, { status: 201 })
}
