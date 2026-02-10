import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin, logAdminAction } from '@/lib/admin-auth'

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

  if (action === 'remove_listing' && flag.content_type === 'listing') {
    await db.from('listings').update({ status: 'removed' }).eq('id', flag.content_id)
    await db.from('flagged_content').update({ status: 'resolved' }).eq('id', flagId)
    await logAdminAction(request, auth.email, 'admin_remove_flagged_listing', 'listing', flag.content_id, { flagId })
    return NextResponse.json({ done: true })
  }

  if (action === 'ban_user') {
    const targetUserId = flag.content_type === 'user' ? flag.content_id : null
    if (flag.content_type === 'listing') {
      const { data: listing } = await db.from('listings').select('user_id').eq('id', flag.content_id).single()
      if (listing) {
        await db.from('users').update({ banned: true }).eq('id', listing.user_id)
        await logAdminAction(request, auth.email, 'admin_ban_user', 'user', listing.user_id, { flagId })
      }
    } else if (targetUserId) {
      await db.from('users').update({ banned: true }).eq('id', targetUserId)
      await logAdminAction(request, auth.email, 'admin_ban_user', 'user', targetUserId, { flagId })
    }
    await db.from('flagged_content').update({ status: 'resolved' }).eq('id', flagId)
    return NextResponse.json({ done: true })
  }

  if (action === 'dismiss') {
    await db.from('flagged_content').update({ status: 'dismissed' }).eq('id', flagId)
    await logAdminAction(request, auth.email, 'admin_dismiss_flag', 'flagged_content', flagId)
    return NextResponse.json({ done: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
