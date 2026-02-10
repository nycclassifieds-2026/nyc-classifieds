import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { sendEmail } from '@/lib/email'
import { helpfulVoteEmail } from '@/lib/email-templates'

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

    voted = false
  } else {
    // Add vote
    await db
      .from('porch_helpful_votes')
      .insert({
        reply_id: parsedReplyId,
        user_id: numericUserId,
      })

    voted = true
  }

  // Recount from source of truth to avoid race conditions
  const { count } = await db
    .from('porch_helpful_votes')
    .select('id', { count: 'exact', head: true })
    .eq('reply_id', parsedReplyId)

  newCount = count || 0

  // Update the denormalized count on the reply
  await db
    .from('porch_replies')
    .update({ helpful_count: newCount })
    .eq('id', parsedReplyId)

  // Notify reply author when someone votes helpful (async, only on new votes)
  if (voted) {
    ;(async () => {
      try {
        const { data: replyData } = await db.from('porch_replies').select('user_id').eq('id', parsedReplyId).single()
        if (!replyData || replyData.user_id === numericUserId) return // don't notify self-votes
        const { data: replyAuthor } = await db.from('users').select('email, name').eq('id', replyData.user_id).single()
        if (!replyAuthor?.email || replyAuthor.email.endsWith('@example.com')) return
        const { data: voter } = await db.from('users').select('name').eq('id', numericUserId).single()
        const { data: postData } = await db.from('porch_posts').select('title').eq('id', postId).single()
        await sendEmail(
          replyAuthor.email,
          helpfulVoteEmail(replyAuthor.name || 'there', voter?.name || 'Someone', postData?.title || 'a post', postId),
        )
      } catch {}
    })()
  }

  return NextResponse.json({ helpful_count: newCount, voted })
}
