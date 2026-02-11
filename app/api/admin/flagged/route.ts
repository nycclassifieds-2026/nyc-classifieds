import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin, logAdminAction } from '@/lib/admin-auth'
import { sendEmail } from '@/lib/email'
import { listingRemovedEmail, accountBannedEmail, flagResolvedEmail } from '@/lib/email-templates'
import { createNotification } from '@/lib/notifications'

// GET — list flagged content with joined details
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, 'moderator')
  if (auth instanceof NextResponse) return auth

  const { searchParams } = request.nextUrl
  const status = searchParams.get('status') || 'pending'
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = 50
  const offset = (page - 1) * limit

  const db = getSupabaseAdmin()
  const { data: flags, count, error } = await db
    .from('flagged_content')
    .select('*, reporter:users!flagged_content_reporter_id_fkey(id, email, name)', { count: 'exact' })
    .eq('status', status)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }

  // Join actual content for each flag
  const items = flags || []
  const enriched = await Promise.all(items.map(async (flag) => {
    let content = null
    if (flag.content_type === 'listing') {
      const { data } = await db
        .from('listings')
        .select('id, title, images, status, user_id, users!inner(email, name)')
        .eq('id', flag.content_id)
        .single()
      content = data
    } else if (flag.content_type === 'user') {
      const { data } = await db
        .from('users')
        .select('id, email, name, verified, banned')
        .eq('id', flag.content_id)
        .single()
      content = data
    } else if (flag.content_type === 'message') {
      const { data } = await db
        .from('messages')
        .select('id, content, created_at, sender:users!messages_sender_id_fkey(email, name)')
        .eq('id', flag.content_id)
        .single()
      content = data
    }
    return { ...flag, content }
  }))

  return NextResponse.json({ items: enriched, total: count || 0, page, limit })
}

// PATCH — update flagged item status
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request, 'moderator')
  if (auth instanceof NextResponse) return auth

  const { id, status } = await request.json()

  if (!id || !['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  await db.from('flagged_content').update({ status }).eq('id', id)

  const actionName = status === 'resolved' ? 'admin_resolve_flag' : status === 'dismissed' ? 'admin_dismiss_flag' : 'admin_update_flag'
  await logAdminAction(request, auth.email, actionName, 'flagged_content', id, { status })

  return NextResponse.json({ updated: true })
}

// POST — take action on flagged content (remove listing, ban user, etc.)
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, 'moderator')
  if (auth instanceof NextResponse) return auth

  const { flagId, action } = await request.json()
  if (!flagId || !action) {
    return NextResponse.json({ error: 'flagId and action required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const { data: flag } = await db
    .from('flagged_content')
    .select('*')
    .eq('id', flagId)
    .single()

  if (!flag) {
    return NextResponse.json({ error: 'Flag not found' }, { status: 404 })
  }

  // Helper to notify the reporter when their flag is resolved
  const notifyReporter = async (outcome: string) => {
    try {
      await createNotification(
        flag.reporter_id,
        'flag_resolved',
        'Your report has been reviewed',
        `Outcome: ${outcome}`,
        '/notifications',
      )
      const { data: reporter } = await db.from('users').select('email, name').eq('id', flag.reporter_id).single()
      if (reporter?.email && !reporter.email.endsWith('@example.com')) {
        await sendEmail(reporter.email, flagResolvedEmail(reporter.name || 'there', flag.content_type, outcome))
      }
    } catch {}
  }

  if (action === 'remove_listing' && flag.content_type === 'listing') {
    const { data: listing } = await db.from('listings').select('title, user_id, users!inner(email, name)').eq('id', flag.content_id).single()
    await db.from('listings').update({ status: 'removed' }).eq('id', flag.content_id)
    await db.from('flagged_content').update({ status: 'resolved' }).eq('id', flagId)
    await logAdminAction(request, auth.email, 'admin_remove_flagged_listing', 'listing', flag.content_id, { flagId })

    if (listing) {
      await createNotification(
        listing.user_id,
        'listing_removed',
        'Your listing was removed',
        listing.title,
        '/account',
      )
      const owner = listing.users as unknown as { email: string; name: string | null }
      if (owner?.email && !owner.email.endsWith('@example.com')) {
        sendEmail(owner.email, listingRemovedEmail(owner.name || 'there', listing.title)).catch(() => {})
      }
    }
    notifyReporter('Content removed').catch(() => {})

    return NextResponse.json({ done: true })
  }

  if (action === 'ban_user') {
    let bannedUserId: number | null = flag.content_type === 'user' ? flag.content_id : null
    if (flag.content_type === 'listing') {
      const { data: listing } = await db.from('listings').select('user_id').eq('id', flag.content_id).single()
      if (listing) {
        bannedUserId = listing.user_id
        await db.from('users').update({ banned: true }).eq('id', listing.user_id)
        await logAdminAction(request, auth.email, 'admin_ban_user', 'user', listing.user_id, { flagId })
      }
    } else if (bannedUserId) {
      await db.from('users').update({ banned: true }).eq('id', bannedUserId)
      await logAdminAction(request, auth.email, 'admin_ban_user', 'user', bannedUserId, { flagId })
    }
    await db.from('flagged_content').update({ status: 'resolved' }).eq('id', flagId)

    if (bannedUserId) {
      await createNotification(
        bannedUserId,
        'account_banned',
        'Your account has been suspended',
        'Your account was suspended for violating community guidelines.',
      )
      const { data: banned } = await db.from('users').select('email, name').eq('id', bannedUserId).single()
      if (banned?.email && !banned.email.endsWith('@example.com')) {
        sendEmail(banned.email, accountBannedEmail(banned.name || 'there')).catch(() => {})
      }
    }
    notifyReporter('User banned').catch(() => {})

    return NextResponse.json({ done: true })
  }

  if (action === 'dismiss') {
    await db.from('flagged_content').update({ status: 'dismissed' }).eq('id', flagId)
    await logAdminAction(request, auth.email, 'admin_dismiss_flag', 'flagged_content', flagId)
    notifyReporter('Dismissed — no action taken').catch(() => {})
    return NextResponse.json({ done: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
