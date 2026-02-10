import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin, logAdminAction } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, 'moderator')
  if (auth instanceof NextResponse) return auth

  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }

  return NextResponse.json({ categories: data || [] })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, 'admin')
  if (auth instanceof NextResponse) return auth

  const { name, slug, icon, subcategories, sort_order } = await request.json()
  if (!name || !slug) {
    return NextResponse.json({ error: 'Name and slug required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('categories')
    .insert({ name, slug, icon: icon || '', subcategories: subcategories || [], sort_order: sort_order || 0 })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }

  await logAdminAction(request, auth.email, 'admin_create_category', 'category', data.id, { name, slug })
  return NextResponse.json({ category: data })
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request, 'admin')
  if (auth instanceof NextResponse) return auth

  const { id, ...updates } = await request.json()
  if (!id) {
    return NextResponse.json({ error: 'Category ID required' }, { status: 400 })
  }

  const allowed = ['name', 'slug', 'icon', 'subcategories', 'sort_order']
  const filtered: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in updates) filtered[key] = updates[key]
  }

  const db = getSupabaseAdmin()
  const { error } = await db.from('categories').update(filtered).eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }

  await logAdminAction(request, auth.email, 'admin_update_category', 'category', id, filtered)
  return NextResponse.json({ updated: true })
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request, 'admin')
  if (auth instanceof NextResponse) return auth

  const { id } = await request.json()
  if (!id) {
    return NextResponse.json({ error: 'Category ID required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  await db.from('categories').delete().eq('id', id)
  await logAdminAction(request, auth.email, 'admin_delete_category', 'category', id)

  return NextResponse.json({ deleted: true })
}
