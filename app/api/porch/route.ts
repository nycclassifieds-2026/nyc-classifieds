import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { moderateFields } from '@/lib/porch-moderation'
import { sendEmail } from '@/lib/email'
import { urgentPostLiveEmail } from '@/lib/email-templates'
import { sendPushToAdmins } from '@/lib/push'
import { logEvent } from '@/lib/events'

const COOKIE_NAME = 'nyc_classifieds_user'
const PAGE_SIZE = 20

const VALID_POST_TYPES = [
  'recommendation',
  'question',
  'alert',
  'lost-and-found',
  'event',
  'stoop-sale',
  'garage-sale',
  'volunteer',
  'carpool',
  'pet-sighting',
  'welcome',
  'group',
]

/** Post types that get pinned to the top of the feed */
const PINNED_TYPES = new Set(['lost-and-found', 'pet-sighting'])

/** Hours until a post expires, by post_type */
function getExpirationHours(postType: string): number {
  switch (postType) {
    case 'alert':
      return 48
    case 'lost-and-found':
    case 'pet-sighting':
      return 72
    default:
      return 720 // 30 days
  }
}

// ---------------------------------------------------------------------------
// GET — Porch feed with filters
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const borough = searchParams.get('borough')
  const neighborhood = searchParams.get('neighborhood')
  const postType = searchParams.get('post_type')
  const userId = searchParams.get('user')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const pageSize = PAGE_SIZE

  const db = getSupabaseAdmin()

  let query = db
    .from('porch_posts')
    .select(
      'id, user_id, post_type, title, body, borough_slug, neighborhood_slug, pinned, expires_at, created_at, updated_at, users!inner(id, name, verified, selfie_url)',
      { count: 'exact' },
    )
    .gt('expires_at', new Date().toISOString())

  if (userId) query = query.eq('user_id', userId)

  if (borough) query = query.eq('borough_slug', borough)
  if (neighborhood) query = query.eq('neighborhood_slug', neighborhood)
  if (postType) query = query.eq('post_type', postType)

  // Pinned first, then newest
  query = query
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  const { data: posts, count, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch porch posts', details: error.message }, { status: 500 })
  }

  // Attach reply counts -------------------------------------------------------
  const postIds = (posts || []).map((p) => p.id)
  let replyCounts: Record<number, number> = {}

  if (postIds.length > 0) {
    const { data: counts } = await db
      .from('porch_replies')
      .select('post_id')
      .in('post_id', postIds)

    if (counts) {
      for (const row of counts) {
        replyCounts[row.post_id] = (replyCounts[row.post_id] || 0) + 1
      }
    }
  }

  const postsWithCounts = (posts || []).map((p) => ({
    ...p,
    reply_count: replyCounts[p.id] || 0,
  }))

  return NextResponse.json({
    posts: postsWithCounts,
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  })
}

// ---------------------------------------------------------------------------
// POST — Create a porch post (requires auth + verified)
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const userId = request.cookies.get(COOKIE_NAME)?.value
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Rate limit: 3 posts per day per user
  if (!rateLimit(`porch-post:${userId}`, 3, 86_400_000)) {
    return NextResponse.json({ error: 'You can only create 3 porch posts per day' }, { status: 429 })
  }

  const ip = getClientIp(request.headers)
  const db = getSupabaseAdmin()

  const body = await request.json()
  const { title, body: postBody, post_type, borough_slug, neighborhood_slug } = body

  // --- Validation ---
  if (!title?.trim() || title.trim().length < 1 || title.trim().length > 100) {
    return NextResponse.json({ error: 'Title is required and must be 1–100 characters' }, { status: 400 })
  }

  if (!postBody?.trim() || postBody.trim().length < 1 || postBody.trim().length > 500) {
    return NextResponse.json({ error: 'Body is required and must be 1–500 characters' }, { status: 400 })
  }

  if (!post_type || !VALID_POST_TYPES.includes(post_type)) {
    return NextResponse.json(
      { error: `Invalid post type. Must be one of: ${VALID_POST_TYPES.join(', ')}` },
      { status: 400 },
    )
  }

  if (!borough_slug?.trim()) {
    return NextResponse.json({ error: 'Borough is required' }, { status: 400 })
  }

  if (!neighborhood_slug?.trim()) {
    return NextResponse.json({ error: 'Neighborhood is required' }, { status: 400 })
  }

  // --- Content moderation ---
  const moderation = moderateFields(title.trim(), postBody.trim())
  if (moderation.blocked) {
    return NextResponse.json(
      { error: `Post blocked: ${moderation.reason}` },
      { status: 400 },
    )
  }

  // --- Compute expiry & pinned status ---
  const expirationHours = getExpirationHours(post_type)
  const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000).toISOString()
  const pinned = PINNED_TYPES.has(post_type)

  // --- Insert ---
  const { data: post, error } = await db
    .from('porch_posts')
    .insert({
      user_id: parseInt(userId),
      post_type,
      title: title.trim(),
      body: postBody.trim(),
      borough_slug: borough_slug.trim(),
      neighborhood_slug: neighborhood_slug.trim(),
      pinned,
      expires_at: expiresAt,
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }

  // Audit log
  await db.from('audit_log').insert({
    actor: userId,
    action: 'create_porch_post',
    entity: 'porch_post',
    entity_id: post.id,
    ip,
  })

  // Push notification to admins
  sendPushToAdmins({ title: 'New porch post', body: title.trim(), url: `/porch/${post.id}` }).catch(() => {})

  logEvent('porch_post_created', { post_id: post.id, post_type, title: title.trim() }, { userId: parseInt(userId), ip })

  // Send confirmation email for urgent post types (async)
  const URGENT_TYPES = new Set(['lost-and-found', 'pet-sighting', 'alert'])
  if (URGENT_TYPES.has(post_type)) {
    ;(async () => {
      try {
        const { data: u } = await db.from('users').select('email, name').eq('id', userId).single()
        if (u?.email && !u.email.endsWith('@example.com')) {
          await sendEmail(u.email, urgentPostLiveEmail(u.name || 'there', title.trim(), post_type, post.id))
        }
      } catch {}
    })()
  }

  return NextResponse.json({ id: post.id, post }, { status: 201 })
}
