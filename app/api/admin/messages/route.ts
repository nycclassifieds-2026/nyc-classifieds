import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, 'moderator')
  if (auth instanceof NextResponse) return auth

  const { searchParams } = request.nextUrl
  const flaggedOnly = searchParams.get('flagged') === 'true'
  const threadListingId = searchParams.get('listing_id')
  const threadUserId = searchParams.get('user_id')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = 50
  const offset = (page - 1) * limit

  const db = getSupabaseAdmin()

  // View a specific thread
  if (threadListingId && threadUserId) {
    const { data } = await db
      .from('messages')
      .select('id, content, read, created_at, sender_id, recipient_id, sender:users!messages_sender_id_fkey(email, name), recipient:users!messages_recipient_id_fkey(email, name)')
      .eq('listing_id', threadListingId)
      .or(`sender_id.eq.${threadUserId},recipient_id.eq.${threadUserId}`)
      .order('created_at', { ascending: true })
      .limit(200)

    return NextResponse.json({ messages: data || [] })
  }

  // List flagged messages with details
  if (flaggedOnly) {
    const { data, count } = await db
      .from('flagged_content')
      .select('id, content_id, reason, status, created_at, reporter:users!flagged_content_reporter_id_fkey(email, name)', { count: 'exact' })
      .eq('content_type', 'message')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Fetch the actual message content for each flag
    const flags = data || []
    const messageIds = flags.map(f => f.content_id)
    let messages: Record<number, unknown> = {}
    if (messageIds.length > 0) {
      const { data: msgs } = await db
        .from('messages')
        .select('id, content, created_at, listing_id, sender:users!messages_sender_id_fkey(email, name)')
        .in('id', messageIds)
      if (msgs) {
        messages = Object.fromEntries(msgs.map(m => [m.id, m]))
      }
    }

    return NextResponse.json({
      flags: flags.map(f => ({ ...f, message: messages[f.content_id] || null })),
      total: count || 0,
      page,
      limit,
    })
  }

  // Default: recent messages
  const { data, count } = await db
    .from('messages')
    .select('id, content, read, created_at, listing_id, sender:users!messages_sender_id_fkey(email, name), recipient:users!messages_recipient_id_fkey(email, name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return NextResponse.json({ messages: data || [], total: count || 0, page, limit })
}
