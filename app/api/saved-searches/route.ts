import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { verifySession } from '@/lib/auth-utils'
import { categoryBySlug } from '@/lib/data'

const COOKIE_NAME = 'nyc_classifieds_user'
const MAX_ALERTS = 25

function generateLabel(body: { keywords?: string; category?: string; subcategory?: string; minPrice?: number; maxPrice?: number }): string {
  const parts: string[] = []

  if (body.keywords?.trim()) {
    parts.push(body.keywords.trim())
  }

  if (body.category) {
    const cat = categoryBySlug[body.category]
    const catName = cat?.name || body.category
    if (body.subcategory) {
      parts.push(body.subcategory.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
    } else {
      parts.push(catName)
    }
  }

  if (body.minPrice != null && body.maxPrice != null) {
    parts.push(`$${body.minPrice.toLocaleString()}–$${body.maxPrice.toLocaleString()}`)
  } else if (body.minPrice != null) {
    parts.push(`$${body.minPrice.toLocaleString()}+`)
  } else if (body.maxPrice != null) {
    parts.push(`under $${body.maxPrice.toLocaleString()}`)
  }

  return parts.join(' — ') || 'All listings'
}

// GET — list user's saved searches
export async function GET(request: NextRequest) {
  const userId = verifySession(request.cookies.get(COOKIE_NAME)?.value)
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('saved_searches')
    .select('*')
    .eq('user_id', parseInt(userId))
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }

  return NextResponse.json({ alerts: data || [] })
}

// POST — create a new saved search alert
export async function POST(request: NextRequest) {
  const userId = verifySession(request.cookies.get(COOKIE_NAME)?.value)
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const ip = getClientIp(request.headers)
  if (!await rateLimit(`saved-search:${userId}`, 20, 86_400_000)) {
    return NextResponse.json({ error: 'Too many alerts created today. Try again tomorrow.' }, { status: 429 })
  }

  const db = getSupabaseAdmin()

  // Check limit
  const { count } = await db
    .from('saved_searches')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', parseInt(userId))

  if ((count || 0) >= MAX_ALERTS) {
    return NextResponse.json({ error: `Maximum ${MAX_ALERTS} alerts allowed. Delete some to create more.` }, { status: 400 })
  }

  const body = await request.json()
  const { keywords, category, subcategory, minPrice, maxPrice } = body

  // Must have at least one filter
  if (!keywords?.trim() && !category) {
    return NextResponse.json({ error: 'Please provide keywords or select a category' }, { status: 400 })
  }

  const label = generateLabel(body)

  const { data, error } = await db
    .from('saved_searches')
    .insert({
      user_id: parseInt(userId),
      label,
      keywords: keywords?.trim() || null,
      category: category || null,
      subcategory: subcategory || null,
      min_price: minPrice != null ? Math.round(minPrice) : null,
      max_price: maxPrice != null ? Math.round(maxPrice) : null,
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
  }

  return NextResponse.json({ alert: data }, { status: 201 })
}

// DELETE — remove a saved search alert
export async function DELETE(request: NextRequest) {
  const userId = verifySession(request.cookies.get(COOKIE_NAME)?.value)
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await request.json()
  const { id } = body

  if (!id) {
    return NextResponse.json({ error: 'Alert ID required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const { error } = await db
    .from('saved_searches')
    .delete()
    .eq('id', id)
    .eq('user_id', parseInt(userId))

  if (error) {
    return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
