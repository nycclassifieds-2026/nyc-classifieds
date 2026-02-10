import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const COOKIE_NAME = 'nyc_classifieds_user'

// GET — inbox (list threads)
export async function GET(request: NextRequest) {
  const userId = request.cookies.get(COOKIE_NAME)?.value
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const db = getSupabaseAdmin()
  const uid = parseInt(userId)

  // Get all messages where user is sender or recipient, grouped by thread
  const { data: messages } = await db
    .from('messages')
    .select('id, listing_id, sender_id, recipient_id, content, read, created_at, listings!inner(title, images)')
    .or(`sender_id.eq.${uid},recipient_id.eq.${uid}`)
    .order('created_at', { ascending: false })

  if (!messages) {
    return NextResponse.json({ threads: [] })
  }

  // Group into threads by (listing_id, other_user_id)
  const threadMap = new Map<string, {
    threadId: string
    listing_id: number
    listing_title: string
    listing_image: string | null
    other_user_id: number
    last_message: string
    last_message_at: string
    unread: number
  }>()

  for (const msg of messages) {
    const otherUserId = msg.sender_id === uid ? msg.recipient_id : msg.sender_id
    const threadId = `${msg.listing_id}-${Math.min(uid, otherUserId)}-${Math.max(uid, otherUserId)}`

    if (!threadMap.has(threadId)) {
      const listing = msg.listings as unknown as { title: string; images: string[] }
      threadMap.set(threadId, {
        threadId,
        listing_id: msg.listing_id,
        listing_title: listing.title,
        listing_image: listing.images?.[0] || null,
        other_user_id: otherUserId,
        last_message: msg.content,
        last_message_at: msg.created_at,
        unread: 0,
      })
    }

    const thread = threadMap.get(threadId)!
    if (!msg.read && msg.recipient_id === uid) {
      thread.unread++
    }
  }

  // Fetch other user names
  const otherIds = [...new Set([...threadMap.values()].map(t => t.other_user_id))]
  const { data: users } = await db
    .from('users')
    .select('id, name, verified')
    .in('id', otherIds)

  const userMap = new Map((users || []).map(u => [u.id, u]))

  const threads = [...threadMap.values()]
    .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
    .map(t => ({
      ...t,
      other_user: userMap.get(t.other_user_id) || { name: 'Unknown', verified: false },
    }))

  return NextResponse.json({ threads })
}

// POST — send a message
export async function POST(request: NextRequest) {
  const userId = request.cookies.get(COOKIE_NAME)?.value
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const ip = getClientIp(request.headers)
  if (!rateLimit(`msg:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: 'Too many messages' }, { status: 429 })
  }

  const { listing_id, recipient_id, content } = await request.json()

  if (!listing_id || !recipient_id || !content?.trim()) {
    return NextResponse.json({ error: 'listing_id, recipient_id, and content required' }, { status: 400 })
  }

  if (String(recipient_id) === userId) {
    return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })
  }

  if (content.length > 2000) {
    return NextResponse.json({ error: 'Message too long (max 2000 characters)' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  const { data, error } = await db
    .from('messages')
    .insert({
      listing_id,
      sender_id: parseInt(userId),
      recipient_id,
      content: content.trim(),
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }

  return NextResponse.json({ id: data.id }, { status: 201 })
}
