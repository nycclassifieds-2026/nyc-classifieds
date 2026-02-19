import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { sendEmail } from '@/lib/email'
import { listingLiveEmail } from '@/lib/email-templates'
import { sendPushToAdmins } from '@/lib/push'
import { logEvent } from '@/lib/events'

const COOKIE_NAME = 'nyc_classifieds_user'
const PAGE_SIZE = 24

// GET — browse listings with filters
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const category = searchParams.get('category')
  const subcategory = searchParams.get('subcategory')
  const borough = searchParams.get('borough')
  const neighborhood = searchParams.get('neighborhood')
  const sort = searchParams.get('sort') || 'newest'
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const userId = searchParams.get('user')

  const db = getSupabaseAdmin()
  let query = db
    .from('listings')
    .select('id, title, price, images, location, category_slug, subcategory_slug, posting_as, created_at, user_id, users!inner(name, verified, selfie_url, business_name)', { count: 'exact' })

  // When filtering by user, show all their listings (any status); otherwise only active
  if (userId) {
    query = query.eq('user_id', parseInt(userId))
  } else {
    query = query.eq('status', 'active')
  }

  if (category) query = query.eq('category_slug', category)
  if (subcategory) query = query.eq('subcategory_slug', subcategory)
  if (borough) query = query.ilike('location', `%${borough}%`)
  if (neighborhood) query = query.ilike('location', `%${neighborhood}%`)
  if (minPrice) query = query.gte('price', parseInt(minPrice))
  if (maxPrice) query = query.lte('price', parseInt(maxPrice))

  if (sort === 'price-low') query = query.order('price', { ascending: true, nullsFirst: false })
  else if (sort === 'price-high') query = query.order('price', { ascending: false, nullsFirst: true })
  else query = query.order('created_at', { ascending: false })

  query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }

  return NextResponse.json({
    listings: data || [],
    total: count || 0,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil((count || 0) / PAGE_SIZE),
  })
}

// POST — create listing (requires auth + verified)
export async function POST(request: NextRequest) {
  const userId = request.cookies.get(COOKIE_NAME)?.value
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const ip = getClientIp(request.headers)
  if (!rateLimit(`listing:${ip}`, 10, 300_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const db = getSupabaseAdmin()

  const body = await request.json()
  const { title, description, price, category_slug, subcategory_slug, images, location, posting_as } = body

  if (!title?.trim() || !category_slug) {
    return NextResponse.json({ error: 'Title and category required' }, { status: 400 })
  }

  if (title.length > 200) {
    return NextResponse.json({ error: 'Title too long (max 200 characters)' }, { status: 400 })
  }

  const { data: listing, error } = await db
    .from('listings')
    .insert({
      user_id: parseInt(userId),
      title: title.trim(),
      description: description?.trim() || null,
      price: price != null ? Math.round(price) : null,
      category_slug,
      subcategory_slug: subcategory_slug || null,
      images: images || [],
      location: location || null,
      posting_as: posting_as === 'business' ? 'business' : 'personal',
      expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }

  // Audit
  await db.from('audit_log').insert({
    actor: userId,
    action: 'create_listing',
    entity: 'listing',
    entity_id: listing.id,
    ip,
  })

  // Push notification to admins
  sendPushToAdmins({ title: 'New listing', body: title.trim(), url: `/listings/${listing.id}` }).catch(() => {})

  logEvent('listing_created', { listing_id: listing.id, title: title.trim(), category: category_slug }, { userId: parseInt(userId), ip })

  // Send listing live email (async)
  ;(async () => {
    try {
      const { data: u } = await db.from('users').select('email, name').eq('id', userId).single()
      if (u?.email && !u.email.endsWith('@example.com')) {
        await sendEmail(u.email, listingLiveEmail(u.name || 'there', title.trim(), listing.id, category_slug))
      }
    } catch {}
  })()

  return NextResponse.json({ id: listing.id }, { status: 201 })
}
