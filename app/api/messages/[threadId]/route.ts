import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

const COOKIE_NAME = 'nyc_classifieds_user'

// GET — get messages for a thread
// threadId format: listingId-minUserId-maxUserId
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const userId = request.cookies.get(COOKIE_NAME)?.value
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { threadId } = await params
  const parts = threadId.split('-')
  if (parts.length !== 3) {
    return NextResponse.json({ error: 'Invalid thread ID' }, { status: 400 })
  }

  const [listingId, userA, userB] = parts.map(Number)
  const uid = parseInt(userId)

  if (uid !== userA && uid !== userB) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const db = getSupabaseAdmin()

  // Get messages
  const { data: messages } = await db
    .from('messages')
    .select('id, sender_id, content, read, created_at')
    .eq('listing_id', listingId)
    .or(`and(sender_id.eq.${userA},recipient_id.eq.${userB}),and(sender_id.eq.${userB},recipient_id.eq.${userA})`)
    .order('created_at', { ascending: true })

  // Mark unread messages as read
  await db
    .from('messages')
    .update({ read: true })
    .eq('listing_id', listingId)
    .eq('recipient_id', uid)
    .eq('read', false)

  // Get listing and other user info
  const otherUserId = uid === userA ? userB : userA
  const [{ data: listing }, { data: otherUser }] = await Promise.all([
    db.from('listings').select('id, title, images').eq('id', listingId).single(),
    db.from('users').select('id, name, verified').eq('id', otherUserId).single(),
  ])

  return NextResponse.json({
    messages: messages || [],
    listing,
    otherUser,
    threadId,
  })
}

// DELETE — delete all messages in a thread
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const userId = request.cookies.get(COOKIE_NAME)?.value
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { threadId } = await params
  const parts = threadId.split('-')
  if (parts.length !== 3) {
    return NextResponse.json({ error: 'Invalid thread ID' }, { status: 400 })
  }

  const [listingId, userA, userB] = parts.map(Number)
  const uid = parseInt(userId)

  if (uid !== userA && uid !== userB) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const db = getSupabaseAdmin()

  const { error } = await db
    .from('messages')
    .delete()
    .eq('listing_id', listingId)
    .or(`and(sender_id.eq.${userA},recipient_id.eq.${userB}),and(sender_id.eq.${userB},recipient_id.eq.${userA})`)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 })
  }

  return NextResponse.json({ deleted: true })
}
