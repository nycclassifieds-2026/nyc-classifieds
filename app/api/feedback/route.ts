import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { sendEmail } from '@/lib/email'
import { feedbackConfirmationEmail, feedbackAdminAlertEmail } from '@/lib/email-templates'
import { logEvent } from '@/lib/events'

const COOKIE_NAME = 'nyc_classifieds_user'
const VALID_CATEGORIES = ['bug', 'feature', 'general', 'other']

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  if (!rateLimit(`feedback:${ip}`, 5, 600_000)) {
    return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 })
  }

  const { category, message, email: contactEmail, page_url } = await request.json()

  if (!category || !VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  }

  const trimmedMessage = message?.trim()
  if (!trimmedMessage || trimmedMessage.length < 10 || trimmedMessage.length > 2000) {
    return NextResponse.json({ error: 'Message must be between 10 and 2000 characters' }, { status: 400 })
  }

  // Check for authenticated user (optional)
  const userId = request.cookies.get(COOKIE_NAME)?.value
  let parsedUserId: number | null = null
  let userName: string | null = null
  let userEmail: string | null = null

  const db = getSupabaseAdmin()

  if (userId) {
    const { data: user } = await db.from('users').select('id, name, email').eq('id', userId).single()
    if (user) {
      parsedUserId = user.id
      userName = user.name
      userEmail = user.email
    }
  }

  const { error } = await db.from('feedback').insert({
    user_id: parsedUserId,
    email: contactEmail?.trim() || userEmail || null,
    category,
    message: trimmedMessage,
    page_url: page_url || null,
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
  }

  // Async: send confirmation + admin alert emails
  ;(async () => {
    try {
      const recipientEmail = contactEmail?.trim() || userEmail
      if (recipientEmail && !recipientEmail.endsWith('@example.com')) {
        await sendEmail(recipientEmail, feedbackConfirmationEmail(userName || 'there', category))
      }

      // Alert all admins
      const { data: admins } = await db.from('users').select('email, name').in('role', ['admin']).eq('banned', false)
      if (admins) {
        for (const admin of admins) {
          if (admin.email && !admin.email.endsWith('@example.com')) {
            await sendEmail(admin.email, feedbackAdminAlertEmail(category, trimmedMessage, userName || 'Anonymous', page_url || null))
          }
        }
      }
    } catch {}
  })()

  logEvent('feedback', { category, message_preview: trimmedMessage.slice(0, 100) }, {
    userId: parsedUserId ?? undefined, ip,
    notify: true,
    notifyTitle: 'New feedback',
    notifyBody: `[${category}] ${trimmedMessage.slice(0, 80)}`,
  })

  return NextResponse.json({ submitted: true }, { status: 201 })
}
