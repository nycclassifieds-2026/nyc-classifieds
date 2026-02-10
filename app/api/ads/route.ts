import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const type = searchParams.get('type') || 'homepage'
  const category = searchParams.get('category') || ''
  const borough = searchParams.get('borough') || ''
  const neighborhood = searchParams.get('neighborhood') || ''

  const db = getSupabaseAdmin()
  const now = new Date().toISOString()

  // Homepage — simple single lookup
  if (type === 'homepage') {
    const { data } = await db
      .from('ads')
      .select('id, type, advertiser, image_url, link_url')
      .eq('type', 'homepage')
      .eq('active', true)
      .gte('expires_at', now)
      .lte('starts_at', now)
      .limit(1)
      .single()

    return NextResponse.json({ ad: data || null })
  }

  // Category ads — fallback chain: neighborhood → borough → all-nyc
  if (category) {
    // Try neighborhood-level first
    if (borough && neighborhood) {
      const { data } = await db
        .from('ads')
        .select('id, type, advertiser, image_url, link_url')
        .eq('type', 'neighborhood')
        .eq('category_slug', category)
        .eq('borough_slug', borough)
        .eq('neighborhood_slug', neighborhood)
        .eq('active', true)
        .gte('expires_at', now)
        .lte('starts_at', now)
        .limit(1)
        .single()

      if (data) return NextResponse.json({ ad: data })
    }

    // Try borough-level
    if (borough) {
      const { data } = await db
        .from('ads')
        .select('id, type, advertiser, image_url, link_url')
        .eq('type', 'borough')
        .eq('category_slug', category)
        .eq('borough_slug', borough)
        .eq('active', true)
        .gte('expires_at', now)
        .lte('starts_at', now)
        .limit(1)
        .single()

      if (data) return NextResponse.json({ ad: data })
    }

    // Try all-nyc
    const { data } = await db
      .from('ads')
      .select('id, type, advertiser, image_url, link_url')
      .eq('type', 'all-nyc')
      .eq('category_slug', category)
      .eq('active', true)
      .gte('expires_at', now)
      .lte('starts_at', now)
      .limit(1)
      .single()

    return NextResponse.json({ ad: data || null })
  }

  return NextResponse.json({ ad: null })
}
