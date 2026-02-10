import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

const COOKIE_NAME = 'nyc_classifieds_user'

// ---------------------------------------------------------------------------
// POST — Toggle helpful vote on a reply (requires auth)
// ---------------------------------------------------------------------------
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; replyId: string }> },
) {
  const { id, replyId } = await params
  const postId = parseInt(id)
  const parsedReplyId = parseInt(replyId)

  if (isNaN(postId) || isNaN(parsedReplyId)) {
    return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 })
  }

  const userId = request.cookies.get(COOKIE_NAME)?.value
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const db = getSupabaseAdmin()
  const numericUserId = parseInt(userId)

  // Verify the reply exists and belongs to the given post
  const { data: reply } = await db
    .from('porch_replies')
    .select('id, helpful_count')
    .eq('id', parsedReplyId)
    .eq('post_id', postId)
    .single()

  if (!reply) {
    return NextResponse.json({ error: 'Reply not found' }, { status: 404 })
  }

  // Check if user already voted
  const { data: existingVote } = await db
    .from('porch_helpful_votes')
    .select('id')
    .eq('reply_id', parsedReplyId)
    .eq('user_id', numericUserId)
    .single()

  let newCount: number
  let voted: boolean

  if (existingVote) {
    // Remove vote
    await db
      .from('porch_helpful_votes')
      .delete()
      .eq('id', existingVote.id)

    newCount = Math.max(0, (reply.helpful_count || 0) - 1)
    voted = false
  } else {
    // Add vote
    await db
      .from('porch_helpful_votes')
      .insert({
        reply_id: parsedReplyId,
        user_id: numericUserId,
      })

    newCount = (reply.helpful_count || 0) + 1
    voted = true
  }

  // Update the denormalized count on the reply
  await db
    .from('porch_replies')
    .update({ helpful_count: newCount })
    .eq('id', parsedReplyId)

  return NextResponse.json({ helpful_count: newCount, voted })
}
