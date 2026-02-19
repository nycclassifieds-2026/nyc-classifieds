import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { logEvent } from '@/lib/events'

const PAGE_SIZE = 24

/** Escape PostgREST LIKE wildcards */
function escLike(s: string): string {
  return s.replace(/[%_\\]/g, c => '\\' + c)
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  if (!await rateLimit(`search:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { searchParams } = request.nextUrl
  const q = searchParams.get('q')?.trim()
  const category = searchParams.get('category')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const sort = searchParams.get('sort') || 'relevance'
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))

  if (!q) {
    return NextResponse.json({ listings: [], total: 0, page, pageSize: PAGE_SIZE, totalPages: 0 })
  }

  // Sanitize search input — strip chars that break PostgREST filter syntax, escape LIKE wildcards
  const safeQ = escLike(q.replace(/[.,()\\]/g, ' ').trim())
  if (!safeQ) {
    return NextResponse.json({ listings: [], total: 0, page, pageSize: PAGE_SIZE, totalPages: 0 })
  }

  const db = getSupabaseAdmin()

  // Build the query using trigram ILIKE search
  let query = db
    .from('listings')
    .select('id, title, price, images, location, category_slug, subcategory_slug, created_at, user_id, users!inner(name, verified)', { count: 'exact' })
    .eq('status', 'active')
    .or(`title.ilike.%${safeQ}%,description.ilike.%${safeQ}%`)

  if (category) query = query.eq('category_slug', category)
  if (minPrice) query = query.gte('price', parseInt(minPrice))
  if (maxPrice) query = query.lte('price', parseInt(maxPrice))

  if (sort === 'price-low') query = query.order('price', { ascending: true, nullsFirst: false })
  else if (sort === 'price-high') query = query.order('price', { ascending: false, nullsFirst: true })
  else if (sort === 'newest') query = query.order('created_at', { ascending: false })
  else query = query.order('created_at', { ascending: false }) // default

  query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }

  logEvent('search', { query: q, results_count: count || 0 })

  return NextResponse.json({
    listings: data || [],
    total: count || 0,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil((count || 0) / PAGE_SIZE),
  })
}
