import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { logEvent } from '@/lib/events'
import { verifySession } from '@/lib/auth-utils'

const COOKIE_NAME = 'nyc_classifieds_user'

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('user_id')
  if (!userId) {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('business_updates')
    .select('id, title, body, photos, created_at')
    .eq('user_id', parseInt(userId))
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch updates' }, { status: 500 })
  }

  return NextResponse.json({ updates: data || [] })
}

export async function POST(request: NextRequest) {
  const cookieUserId = verifySession(request.cookies.get(COOKIE_NAME)?.value)
  if (!cookieUserId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const db = getSupabaseAdmin()

  const { data: user } = await db
    .from('users')
    .select('id, account_type')
    .eq('id', parseInt(cookieUserId))
    .single()

  if (!user || user.account_type !== 'business') {
    return NextResponse.json({ error: 'Business account required' }, { status: 403 })
  }

  const body = await request.json()
  const title = String(body.title || '').trim()
  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const updateBody = body.body ? String(body.body).trim() || null : null
  const photos = Array.isArray(body.photos) ? body.photos.slice(0, 3) : []

  const { data, error } = await db
    .from('business_updates')
    .insert({ user_id: user.id, title, body: updateBody, photos })
    .select('id, title, body, photos, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create update' }, { status: 500 })
  }

  logEvent('business_update_posted', { user_id: user.id, title }, { userId: user.id })

  return NextResponse.json({ update: data })
}

export async function DELETE(request: NextRequest) {
  const cookieUserId = verifySession(request.cookies.get(COOKIE_NAME)?.value)
  if (!cookieUserId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const id = request.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  // Verify ownership
  const { data: update } = await db
    .from('business_updates')
    .select('user_id')
    .eq('id', parseInt(id))
    .single()

  if (!update || update.user_id !== parseInt(cookieUserId)) {
    return NextResponse.json({ error: 'Not found or not authorized' }, { status: 404 })
  }

  const { error } = await db
    .from('business_updates')
    .delete()
    .eq('id', parseInt(id))

  if (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
