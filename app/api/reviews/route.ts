import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

const COOKIE_NAME = 'nyc_classifieds_user'

// GET — fetch reviews for a business
export async function GET(request: NextRequest) {
  const businessUserId = request.nextUrl.searchParams.get('business_user_id')
  if (!businessUserId) {
    return NextResponse.json({ error: 'business_user_id required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const { data: reviews } = await db
    .from('reviews')
    .select('id, rating, body, reply, replied_at, created_at, reported, reviewer_user_id, reviewer:users!reviews_reviewer_user_id_fkey(name, selfie_url, verified)')
    .eq('business_user_id', parseInt(businessUserId))
    .order('created_at', { ascending: false })
    .limit(50)

  // Calculate average
  const ratings = (reviews || []).map(r => r.rating)
  const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0

  return NextResponse.json({
    reviews: reviews || [],
    average: Math.round(avg * 10) / 10,
    count: ratings.length,
  })
}

// POST — create review, reply, or report
export async function POST(request: NextRequest) {
  const userId = request.cookies.get(COOKIE_NAME)?.value
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const db = getSupabaseAdmin()
  const body = await request.json()
  const { action } = body

  if (action === 'create') {
    const { business_user_id, rating, body: reviewBody } = body
    if (!business_user_id || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid review data' }, { status: 400 })
    }
    if (parseInt(userId) === business_user_id) {
      return NextResponse.json({ error: 'Cannot review your own business' }, { status: 400 })
    }

    const { error } = await db.from('reviews').insert({
      business_user_id,
      reviewer_user_id: parseInt(userId),
      rating,
      body: reviewBody?.trim() || null,
    })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'You already reviewed this business' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  }

  if (action === 'reply') {
    const { review_id, reply } = body
    if (!review_id || !reply?.trim()) {
      return NextResponse.json({ error: 'Reply text required' }, { status: 400 })
    }

    // Verify this user owns the business being reviewed
    const { data: review } = await db
      .from('reviews')
      .select('business_user_id')
      .eq('id', review_id)
      .single()

    if (!review || review.business_user_id !== parseInt(userId)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const { error } = await db
      .from('reviews')
      .update({ reply: reply.trim(), replied_at: new Date().toISOString() })
      .eq('id', review_id)

    if (error) {
      return NextResponse.json({ error: 'Failed to reply' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  }

  if (action === 'report') {
    const { review_id, reason } = body
    if (!review_id) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400 })
    }

    // Only the business owner can report reviews on their profile
    const { data: review } = await db
      .from('reviews')
      .select('business_user_id')
      .eq('id', review_id)
      .single()

    if (!review || review.business_user_id !== parseInt(userId)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const { error } = await db
      .from('reviews')
      .update({ reported: true, report_reason: reason?.trim() || null })
      .eq('id', review_id)

    if (error) {
      return NextResponse.json({ error: 'Failed to report' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
