import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const db = getSupabaseAdmin()

  const { data: business } = await db
    .from('users')
    .select('id, name, business_name, business_slug, business_category, business_description, website, phone, hours, service_area, photo_gallery, selfie_url, business_photo, business_address, social_links, verified, created_at')
    .eq('business_slug', slug)
    .eq('account_type', 'business')
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  // Get business-only listings (posting_as = 'business')
  const { data: listings } = await db
    .from('listings')
    .select('id, title, price, images, category_slug, subcategory_slug, location, created_at, status')
    .eq('user_id', business.id)
    .eq('status', 'active')
    .eq('posting_as', 'business')
    .order('created_at', { ascending: false })
    .limit(20)

  // Fetch reviews + average + count
  const { data: reviews } = await db
    .from('reviews')
    .select('id, rating, body, reply, replied_at, created_at, reported, reviewer_user_id, reviewer:users!reviews_reviewer_user_id_fkey(name, selfie_url, verified)')
    .eq('business_user_id', business.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const ratings = (reviews || []).map(r => r.rating)
  const reviewAverage = ratings.length > 0
    ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length * 10) / 10
    : 0

  return NextResponse.json({
    business,
    listings: listings || [],
    reviews: reviews || [],
    reviewAverage,
    reviewCount: ratings.length,
  })
}
