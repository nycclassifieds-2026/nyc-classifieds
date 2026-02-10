import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin, logAdminAction } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, 'admin')
  if (auth instanceof NextResponse) return auth

  const { searchParams } = request.nextUrl
  const type = searchParams.get('type') || ''
  const active = searchParams.get('active')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = 50
  const offset = (page - 1) * limit

  const db = getSupabaseAdmin()
  let query = db.from('ads').select('*', { count: 'exact' })

  if (type) query = query.eq('type', type)
  if (active === 'true') query = query.eq('active', true)
  if (active === 'false') query = query.eq('active', false)

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 })
  }

  return NextResponse.json({ ads: data || [], total: count || 0, page, limit })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, 'admin')
  if (auth instanceof NextResponse) return auth

  const body = await request.json()
  const { type, advertiser, image_url, link_url, category_slug, borough_slug, neighborhood_slug, starts_at, expires_at } = body

  if (!type || !['neighborhood', 'borough', 'all-nyc', 'homepage'].includes(type)) {
    return NextResponse.json({ error: 'Invalid ad type' }, { status: 400 })
  }
  if (!advertiser || !image_url) {
    return NextResponse.json({ error: 'Advertiser and image are required' }, { status: 400 })
  }
  if (type === 'neighborhood' && (!category_slug || !borough_slug || !neighborhood_slug)) {
    return NextResponse.json({ error: 'Neighborhood ads require category, borough, and neighborhood' }, { status: 400 })
  }
  if (type === 'borough' && (!category_slug || !borough_slug)) {
    return NextResponse.json({ error: 'Borough ads require category and borough' }, { status: 400 })
  }
  if (type === 'all-nyc' && !category_slug) {
    return NextResponse.json({ error: 'All-NYC ads require a category' }, { status: 400 })
  }

  const needsCategory = ['neighborhood', 'borough', 'all-nyc'].includes(type)
  const needsBorough = ['neighborhood', 'borough'].includes(type)
  const needsNeighborhood = type === 'neighborhood'

  const db = getSupabaseAdmin()
  const { data, error } = await db.from('ads').insert({
    type,
    advertiser,
    image_url,
    link_url: link_url || '',
    category_slug: needsCategory ? category_slug : null,
    borough_slug: needsBorough ? borough_slug : null,
    neighborhood_slug: needsNeighborhood ? neighborhood_slug : null,
    starts_at: starts_at || new Date().toISOString(),
    expires_at: expires_at || new Date(Date.now() + 30 * 86400000).toISOString(),
  }).select().single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'An active ad already exists for this slot' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 })
  }

  await logAdminAction(request, auth.email, 'admin_create_ad', 'ad', data.id, { type, advertiser })

  return NextResponse.json({ ad: data })
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request, 'admin')
  if (auth instanceof NextResponse) return auth

  const body = await request.json()
  const { id, ...updates } = body

  if (!id) {
    return NextResponse.json({ error: 'Ad ID required' }, { status: 400 })
  }

  const allowed = ['advertiser', 'image_url', 'link_url', 'category_slug', 'borough_slug', 'neighborhood_slug', 'active', 'starts_at', 'expires_at']
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (key in updates) patch[key] = updates[key]
  }

  const db = getSupabaseAdmin()
  const { error } = await db.from('ads').update(patch).eq('id', id)

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'An active ad already exists for this slot' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to update ad' }, { status: 500 })
  }

  await logAdminAction(request, auth.email, 'admin_update_ad', 'ad', id, patch)

  return NextResponse.json({ updated: true })
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request, 'admin')
  if (auth instanceof NextResponse) return auth

  const { id } = await request.json()
  if (!id) {
    return NextResponse.json({ error: 'Ad ID required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  await db.from('ads').delete().eq('id', id)
  await logAdminAction(request, auth.email, 'admin_delete_ad', 'ad', id)

  return NextResponse.json({ deleted: true })
}
