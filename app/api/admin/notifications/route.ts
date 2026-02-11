import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin, logAdminAction } from '@/lib/admin-auth'
import { sendEmail } from '@/lib/email'
import { adminNoticeEmail } from '@/lib/email-templates'
import { createNotification } from '@/lib/notifications'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, 'admin')
  if (auth instanceof NextResponse) return auth

  const { searchParams } = request.nextUrl
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = 50
  const offset = (page - 1) * limit

  const db = getSupabaseAdmin()
  const { data, count, error } = await db
    .from('admin_notifications')
    .select('*, sender:users!sender_id(email, name), recipient:users!recipient_id(email, name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }

  return NextResponse.json({ notifications: data || [], total: count || 0, page, limit })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, 'admin')
  if (auth instanceof NextResponse) return auth

  const { to, title, body, link, sendNotification, sendEmail: shouldEmail } = await request.json()

  if (!title || !to) {
    return NextResponse.json({ error: 'Title and recipient are required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  // ── Single user ──
  if (to !== 'all') {
    const userId = Number(to)
    if (!userId) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const { data: user } = await db.from('users').select('id, email, name').eq('id', userId).single()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (sendNotification) {
      await createNotification(user.id, 'admin_notice', title, body || '', link)
    }

    let emailSent = false
    if (shouldEmail && user.email && !user.email.endsWith('@example.com')) {
      await sendEmail(user.email, adminNoticeEmail(user.name || 'there', title, body || '', link))
      emailSent = true
    }

    await db.from('admin_notifications').insert({
      sender_id: auth.id,
      recipient_id: user.id,
      title,
      body: body || null,
      link: link || null,
      sent_notification: !!sendNotification,
      sent_email: emailSent,
      recipient_count: 1,
    })

    await logAdminAction(request, auth.email, 'admin_send_notification', 'user', user.id, {
      title,
      notification: !!sendNotification,
      email: emailSent,
    })

    return NextResponse.json({ sent: true, recipientCount: 1 })
  }

  // ── Broadcast ──
  // Rate limit: 2 broadcasts per hour per admin
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count: recentBroadcasts } = await db
    .from('admin_notifications')
    .select('id', { count: 'exact', head: true })
    .eq('sender_id', auth.id)
    .is('recipient_id', null)
    .gte('created_at', oneHourAgo)

  if ((recentBroadcasts || 0) >= 2) {
    return NextResponse.json({ error: 'Broadcast rate limit reached (2 per hour)' }, { status: 429 })
  }

  const { data: users } = await db
    .from('users')
    .select('id, email, name')
    .eq('banned', false)

  if (!users || users.length === 0) {
    return NextResponse.json({ error: 'No eligible users found' }, { status: 404 })
  }

  let emailCount = 0
  for (const user of users) {
    if (sendNotification) {
      await createNotification(user.id, 'admin_notice', title, body || '', link)
    }
    if (shouldEmail && user.email && !user.email.endsWith('@example.com')) {
      await sendEmail(user.email, adminNoticeEmail(user.name || 'there', title, body || '', link))
      emailCount++
    }
  }

  await db.from('admin_notifications').insert({
    sender_id: auth.id,
    recipient_id: null,
    title,
    body: body || null,
    link: link || null,
    sent_notification: !!sendNotification,
    sent_email: !!shouldEmail,
    recipient_count: users.length,
  })

  await logAdminAction(request, auth.email, 'admin_broadcast_notification', 'system', 0, {
    title,
    recipientCount: users.length,
    emailCount,
    notification: !!sendNotification,
    email: !!shouldEmail,
  })

  return NextResponse.json({ sent: true, recipientCount: users.length, emailCount })
}
