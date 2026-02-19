import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = request.nextUrl
  const since = searchParams.get('since')
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200)

  const db = getSupabaseAdmin()

  let query = db
    .from('user_events')
    .select('id, event_type, user_id, path, details, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (since) {
    query = query.gt('created_at', since)
  }

  const { data: events, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }

  // Fetch user info for events that have user_id
  const userIds = [...new Set((events || []).map(e => e.user_id).filter(Boolean))]
  let userMap: Record<number, { name: string | null; email: string }> = {}

  if (userIds.length > 0) {
    const { data: users } = await db
      .from('users')
      .select('id, name, email')
      .in('id', userIds)

    if (users) {
      for (const u of users) {
        userMap[u.id] = { name: u.name, email: u.email }
      }
    }
  }

  const enriched = (events || []).map(e => ({
    ...e,
    user: e.user_id ? userMap[e.user_id] || null : null,
  }))

  return NextResponse.json({ events: enriched })
}
