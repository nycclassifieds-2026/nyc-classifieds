import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { sendEmail } from '@/lib/email'
import { newMessageEmail } from '@/lib/email-templates'
import { createNotification } from '@/lib/notifications'
import { logEvent } from '@/lib/events'
import { verifySession } from '@/lib/auth-utils'

const COOKIE_NAME = 'nyc_classifieds_user'

// GET — inbox (list threads)
export async function GET(request: NextRequest) {
  const userId = verifySession(request.cookies.get(COOKIE_NAME)?.value)
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const db = getSupabaseAdmin()
  const uid = parseInt(userId)

  // Get user's blocked list
  const { data: blocks } = await db
    .from('blocked_users')
    .select('blocked_id')
    .eq('blocker_id', uid)
  const blockedIds = new Set((blocks || []).map(b => b.blocked_id))

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
    if (blockedIds.has(otherUserId)) continue
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
  const userId = verifySession(request.cookies.get(COOKIE_NAME)?.value)
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const ip = getClientIp(request.headers)
  if (!await rateLimit(`msg:${ip}`, 30, 60_000)) {
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
  const uid = parseInt(userId)

  // Check if either side has blocked the other
  const { data: blockCheck } = await db
    .from('blocked_users')
    .select('id')
    .or(`and(blocker_id.eq.${uid},blocked_id.eq.${recipient_id}),and(blocker_id.eq.${recipient_id},blocked_id.eq.${uid})`)
    .limit(1)

  if (blockCheck && blockCheck.length > 0) {
    return NextResponse.json({ error: 'Unable to send message to this user' }, { status: 403 })
  }

  // Verify listing exists and is active
  const { data: listing } = await db
    .from('listings')
    .select('id')
    .eq('id', listing_id)
    .eq('status', 'active')
    .single()

  if (!listing) {
    return NextResponse.json({ error: 'Listing not found or no longer active' }, { status: 404 })
  }

  const { data, error } = await db
    .from('messages')
    .insert({
      listing_id,
      sender_id: uid,
      recipient_id,
      content: content.trim(),
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }

  // Send email + in-app notification to recipient (async, don't block response)
  ;(async () => {
    try {
      const [recipientResult, senderResult, listingResult] = await Promise.all([
        db.from('users').select('email, name').eq('id', recipient_id).single(),
        db.from('users').select('name').eq('id', uid).single(),
        db.from('listings').select('title').eq('id', listing_id).single(),
      ])
      const recipient = recipientResult.data
      const sender = senderResult.data
      const listingData = listingResult.data
      const senderName = sender?.name || 'Someone'
      const listingTitle = listingData?.title || 'a listing'

      // In-app notification
      const threadId = `${listing_id}-${Math.min(uid, recipient_id)}-${Math.max(uid, recipient_id)}`
      await createNotification(
        recipient_id,
        'new_message',
        `New message from ${senderName}`,
        `Re: ${listingTitle}`,
        `/messages/${threadId}`,
      )

      if (recipient?.email && !recipient.email.endsWith('@example.com') && listingData?.title) {
        await sendEmail(
          recipient.email,
          newMessageEmail(recipient.name || 'there', senderName, listingTitle),
        )
      }
    } catch {}
  })()

  logEvent('message_sent', { from: uid, to: recipient_id, listing_id }, {
    userId: uid,
    notify: true,
    notifyTitle: 'New message',
    notifyBody: `Message sent re: listing #${listing_id}`,
  })

  return NextResponse.json({ id: data.id }, { status: 201 })
}
