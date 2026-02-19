import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { boroughs } from '@/lib/data'

const PAGE_SIZE = 24

/** Escape PostgREST LIKE wildcards */
function escLike(s: string): string {
  return s.replace(/[%_\\]/g, c => '\\' + c)
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  if (!await rateLimit(`businesses:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { searchParams } = request.nextUrl
  const q = searchParams.get('q')?.trim()
  const category = searchParams.get('category')
  const borough = searchParams.get('borough')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))

  const db = getSupabaseAdmin()

  let query = db
    .from('users')
    .select('id, business_name, business_slug, business_category, business_description, selfie_url, verified, service_area, phone, website', { count: 'exact' })
    .eq('account_type', 'business')
    .not('business_slug', 'is', null)

  if (q) {
    const safeQ = escLike(q.replace(/[.,()\\]/g, ' ').trim())
    if (safeQ) {
      query = query.or(`business_name.ilike.%${safeQ}%,business_description.ilike.%${safeQ}%`)
    }
  }

  if (category) {
    query = query.eq('business_category', category)
  }

  if (borough) {
    const b = boroughs.find(b => b.slug === borough)
    if (b) {
      const conditions = b.neighborhoods.map(n => `service_area.cs.{"${n}"}`).join(',')
      query = query.or(conditions)
    }
  }

  query = query
    .order('verified', { ascending: false })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }

  return NextResponse.json({
    businesses: data || [],
    total: count || 0,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil((count || 0) / PAGE_SIZE),
  })
}
