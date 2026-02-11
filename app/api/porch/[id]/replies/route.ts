import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { moderateFields } from '@/lib/porch-moderation'
import { sendEmail } from '@/lib/email'
import { porchReplyEmail } from '@/lib/email-templates'
import { createNotification } from '@/lib/notifications'

const COOKIE_NAME = 'nyc_classifieds_user'
const MAX_REPLIES_PER_THREAD = 3

// ---------------------------------------------------------------------------
// POST — Create a reply on a porch post (requires auth + verified)
// ---------------------------------------------------------------------------
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const postId = parseInt(id)
  if (isNaN(postId)) {
    return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
  }

  const userId = request.cookies.get(COOKIE_NAME)?.value
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Rate limit: 10 replies per day per user
  if (!rateLimit(`porch-reply:${userId}`, 10, 86_400_000)) {
    return NextResponse.json({ error: 'You can only post 10 replies per day' }, { status: 429 })
  }

  const ip = getClientIp(request.headers)
  const db = getSupabaseAdmin()

  // Verify user
  const { data: user } = await db
    .from('users')
    .select('verified')
    .eq('id', userId)
    .single()

  if (!user?.verified) {
    return NextResponse.json({ error: 'Account must be verified to reply on the Porch' }, { status: 403 })
  }

  // Check the post exists
  const { data: post } = await db
    .from('porch_posts')
    .select('id')
    .eq('id', postId)
    .single()

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  // Max 3 replies per thread per user
  const { count: existingCount } = await db
    .from('porch_replies')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId)
    .eq('user_id', parseInt(userId))

  if ((existingCount || 0) >= MAX_REPLIES_PER_THREAD) {
    return NextResponse.json(
      { error: `You can only reply ${MAX_REPLIES_PER_THREAD} times per thread` },
      { status: 403 },
    )
  }

  const reqBody = await request.json()
  const { body: replyBody } = reqBody

  // Validate
  if (!replyBody?.trim() || replyBody.trim().length < 1 || replyBody.trim().length > 300) {
    return NextResponse.json({ error: 'Reply body is required and must be 1–300 characters' }, { status: 400 })
  }

  // Content moderation
  const moderation = moderateFields(replyBody.trim())
  if (moderation.blocked) {
    return NextResponse.json(
      { error: `Reply blocked: ${moderation.reason}` },
      { status: 400 },
    )
  }

  // Insert reply
  const { data: reply, error } = await db
    .from('porch_replies')
    .insert({
      post_id: postId,
      user_id: parseInt(userId),
      body: replyBody.trim(),
      helpful_count: 0,
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 })
  }

  // Audit log
  await db.from('audit_log').insert({
    actor: userId,
    action: 'create_porch_reply',
    entity: 'porch_reply',
    entity_id: reply.id,
    ip,
  })

  // Send email + in-app notification to post author (async, don't block response)
  ;(async () => {
    try {
      const { data: postData } = await db
        .from('porch_posts')
        .select('title, slug, user_id, users!inner(email, name)')
        .eq('id', postId)
        .single()
      if (!postData) return
      if (String(postData.user_id) === userId) return // don't notify self-replies
      const postAuthor = postData.users as unknown as { email: string; name: string | null }
      const { data: replier } = await db.from('users').select('name').eq('id', userId).single()
      const replierName = replier?.name || 'Someone'

      // In-app notification
      await createNotification(
        postData.user_id,
        'porch_reply',
        `${replierName} replied to your post`,
        postData.title,
        `/porch/post/${postId}/${postData.slug || postId}`,
      )

      if (postAuthor?.email && !postAuthor.email.endsWith('@example.com')) {
        await sendEmail(
          postAuthor.email,
          porchReplyEmail(postAuthor.name || 'there', replierName, postData.title, postId),
        )
      }
    } catch {}
  })()

  return NextResponse.json({ id: reply.id, reply }, { status: 201 })
}
