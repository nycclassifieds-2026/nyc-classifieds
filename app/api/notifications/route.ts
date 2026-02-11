import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

const COOKIE_NAME = 'nyc_classifieds_user'

// GET — list user's notifications
export async function GET(request: NextRequest) {
  const userId = request.cookies.get(COOKIE_NAME)?.value
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const db = getSupabaseAdmin()

  const { data: notifications } = await db
    .from('notifications')
    .select('id, type, title, body, link, read, created_at')
    .eq('user_id', parseInt(userId))
    .order('created_at', { ascending: false })
    .limit(50)

  return NextResponse.json({ notifications: notifications || [] })
}

// PATCH — mark notifications as read
export async function PATCH(request: NextRequest) {
  const userId = request.cookies.get(COOKIE_NAME)?.value
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { ids } = await request.json()
  const db = getSupabaseAdmin()

  if (ids === 'all') {
    await db.from('notifications')
      .update({ read: true })
      .eq('user_id', parseInt(userId))
      .eq('read', false)
  } else if (Array.isArray(ids) && ids.length > 0) {
    await db.from('notifications')
      .update({ read: true })
      .eq('user_id', parseInt(userId))
      .in('id', ids)
  }

  return NextResponse.json({ ok: true })
}
