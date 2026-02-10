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
    .select('id, name, business_name, business_slug, business_category, business_description, website, phone, hours, service_area, photo_gallery, selfie_url, verified, created_at')
    .eq('business_slug', slug)
    .eq('account_type', 'business')
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  // Get their listings
  const { data: listings } = await db
    .from('listings')
    .select('id, title, price, images, category_slug, subcategory_slug, location, created_at, status')
    .eq('user_id', business.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ business, listings: listings || [] })
}
