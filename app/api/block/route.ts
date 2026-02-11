import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const COOKIE_NAME = 'nyc_classifieds_user'

// POST — block a user
export async function POST(request: NextRequest) {
  const userId = request.cookies.get(COOKIE_NAME)?.value
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const ip = getClientIp(request.headers)
  if (!rateLimit(`block:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { user_id } = await request.json()
  if (!user_id) {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 })
  }

  const uid = parseInt(userId)
  if (uid === user_id) {
    return NextResponse.json({ error: 'Cannot block yourself' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  const { error } = await db.from('blocked_users').insert({
    blocker_id: uid,
    blocked_id: user_id,
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'User already blocked' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to block user' }, { status: 500 })
  }

  return NextResponse.json({ blocked: true }, { status: 201 })
}

// DELETE — unblock a user
export async function DELETE(request: NextRequest) {
  const userId = request.cookies.get(COOKIE_NAME)?.value
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { user_id } = await request.json()
  if (!user_id) {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  const { error } = await db.from('blocked_users')
    .delete()
    .eq('blocker_id', parseInt(userId))
    .eq('blocked_id', user_id)

  if (error) {
    return NextResponse.json({ error: 'Failed to unblock user' }, { status: 500 })
  }

  return NextResponse.json({ unblocked: true })
}
