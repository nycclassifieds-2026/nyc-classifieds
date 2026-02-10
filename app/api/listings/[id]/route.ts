import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

const COOKIE_NAME = 'nyc_classifieds_user'

// GET — single listing detail
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const db = getSupabaseAdmin()

  const { data: listing, error } = await db
    .from('listings')
    .select('*, users!inner(id, name, verified, created_at)')
    .eq('id', id)
    .neq('status', 'removed')
    .single()

  if (error || !listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  return NextResponse.json(listing)
}

// PATCH — update listing (owner only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userId = request.cookies.get(COOKIE_NAME)?.value
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const db = getSupabaseAdmin()

  // Verify ownership
  const { data: listing } = await db
    .from('listings')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!listing || String(listing.user_id) !== userId) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const body = await request.json()
  const allowedFields = ['title', 'description', 'price', 'images', 'location', 'status', 'subcategory_slug']
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field]
    }
  }

  const { error } = await db
    .from('listings')
    .update(updates)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  return NextResponse.json({ updated: true })
}

// DELETE — remove listing (owner only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userId = request.cookies.get(COOKIE_NAME)?.value
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const db = getSupabaseAdmin()

  const { data: listing } = await db
    .from('listings')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!listing || String(listing.user_id) !== userId) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  await db.from('listings').update({ status: 'removed' }).eq('id', id)

  return NextResponse.json({ deleted: true })
}
