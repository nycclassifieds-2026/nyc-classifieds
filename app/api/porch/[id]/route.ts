import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { verifySession } from '@/lib/auth-utils'

const COOKIE_NAME = 'nyc_classifieds_user'

// ---------------------------------------------------------------------------
// GET — Single porch post with all replies
// ---------------------------------------------------------------------------
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const postId = parseInt(id)
  if (isNaN(postId)) {
    return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  // Fetch the post with user data
  const { data: post, error: postError } = await db
    .from('porch_posts')
    .select(
      'id, user_id, post_type, title, body, borough_slug, neighborhood_slug, pinned, expires_at, created_at, updated_at, users!inner(id, name, verified, selfie_url)',
    )
    .eq('id', postId)
    .single()

  if (postError || !post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  // Fetch all replies with user data, ordered oldest-first
  const { data: replies, error: repliesError } = await db
    .from('porch_replies')
    .select(
      'id, post_id, user_id, body, helpful_count, created_at, users!inner(id, name, verified, selfie_url)',
    )
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (repliesError) {
    return NextResponse.json({ error: 'Failed to fetch replies' }, { status: 500 })
  }

  // If the user is logged in, check which replies they have voted helpful on
  let userVotes: number[] = []
  const userId = verifySession(request.cookies.get(COOKIE_NAME)?.value)

  if (userId) {
    const replyIds = (replies || []).map((r) => r.id)
    if (replyIds.length > 0) {
      const { data: votes } = await db
        .from('porch_helpful_votes')
        .select('reply_id')
        .eq('user_id', parseInt(userId))
        .in('reply_id', replyIds)

      userVotes = (votes || []).map((v) => v.reply_id)
    }
  }

  return NextResponse.json({
    post,
    replies: replies || [],
    userVotes,
  })
}
