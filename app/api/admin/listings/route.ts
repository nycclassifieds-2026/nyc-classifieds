import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin, logAdminAction } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, 'moderator')
  if (auth instanceof NextResponse) return auth

  const { searchParams } = request.nextUrl
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = 50
  const offset = (page - 1) * limit

  const db = getSupabaseAdmin()
  let query = db
    .from('listings')
    .select('id, title, price, category_slug, status, images, created_at, user_id, users!inner(email, name)', { count: 'exact' })

  if (search) {
    query = query.ilike('title', `%${search}%`)
  }
  if (status) {
    query = query.eq('status', status)
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }

  return NextResponse.json({ listings: data || [], total: count || 0, page, limit })
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request, 'moderator')
  if (auth instanceof NextResponse) return auth

  const { id, status } = await request.json()
  if (!id || !['active', 'sold', 'expired', 'removed'].includes(status)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  await db.from('listings').update({ status }).eq('id', id)
  await logAdminAction(request, auth.email, 'admin_change_listing_status', 'listing', id, { status })

  return NextResponse.json({ updated: true })
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request, 'admin')
  if (auth instanceof NextResponse) return auth

  const { id } = await request.json()
  if (!id) {
    return NextResponse.json({ error: 'Listing ID required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  await db.from('listings').delete().eq('id', id)
  await logAdminAction(request, auth.email, 'admin_delete_listing', 'listing', id)

  return NextResponse.json({ deleted: true })
}
