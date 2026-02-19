import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin, logAdminAction } from '@/lib/admin-auth'
import { sendEmail } from '@/lib/email'
import { accountBannedEmail, accountRestoredEmail, manuallyVerifiedEmail, roleChangedEmail } from '@/lib/email-templates'
import { createNotification } from '@/lib/notifications'

/** Escape PostgREST LIKE wildcards */
function escLike(s: string): string {
  return s.replace(/[%_\\]/g, c => '\\' + c)
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, 'moderator')
  if (auth instanceof NextResponse) return auth

  const { searchParams } = request.nextUrl
  const search = searchParams.get('search') || ''
  const role = searchParams.get('role') || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = 50
  const offset = (page - 1) * limit

  const db = getSupabaseAdmin()
  let query = db
    .from('users')
    .select('id, email, name, verified, role, banned, created_at', { count: 'exact' })

  if (search) {
    const safeSearch = escLike(search.replace(/[.,()\\]/g, ' ').trim())
    if (safeSearch) query = query.or(`email.ilike.%${safeSearch}%,name.ilike.%${safeSearch}%`)
  }
  if (role) {
    query = query.eq('role', role)
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }

  // Fetch warning counts
  const userIds = (data || []).map(u => u.id)
  let warningCounts: Record<number, number> = {}
  if (userIds.length > 0) {
    const { data: warnings } = await db
      .from('user_warnings')
      .select('user_id')
      .in('user_id', userIds)
    if (warnings) {
      for (const w of warnings) {
        warningCounts[w.user_id] = (warningCounts[w.user_id] || 0) + 1
      }
    }
  }

  const usersWithWarnings = (data || []).map(u => ({
    ...u,
    warning_count: warningCounts[u.id] || 0,
  }))

  return NextResponse.json({ users: usersWithWarnings, total: count || 0, page, limit })
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request, 'moderator')
  if (auth instanceof NextResponse) return auth

  const { id, action, value } = await request.json()
  if (!id || !action) {
    return NextResponse.json({ error: 'Missing id or action' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  if (action === 'toggle_verified') {
    const { data: user } = await db.from('users').select('verified, email, name').eq('id', id).single()
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const newVal = !user.verified
    await db.from('users').update({ verified: newVal }).eq('id', id)
    await logAdminAction(request, auth.email, 'admin_toggle_verified', 'user', id, { verified: newVal })

    if (newVal) {
      await createNotification(id, 'admin_notice', 'Your account has been verified', 'An admin has verified your account. You now have full access to The NYC Classifieds.')
      if (user.email && !user.email.endsWith('@example.com')) {
        sendEmail(user.email, manuallyVerifiedEmail(user.name || 'there')).catch(() => {})
      }
    }

    return NextResponse.json({ updated: true, verified: newVal })
  }

  if (action === 'ban') {
    const { data: user } = await db.from('users').select('email, name').eq('id', id).single()
    await db.from('users').update({ banned: true }).eq('id', id)
    await logAdminAction(request, auth.email, 'admin_ban_user', 'user', id)

    await createNotification(id, 'account_banned', 'Your account has been suspended', 'Your account was suspended for violating community guidelines.')

    if (user?.email && !user.email.endsWith('@example.com')) {
      sendEmail(user.email, accountBannedEmail(user.name || 'there')).catch(() => {})
    }

    return NextResponse.json({ updated: true, banned: true })
  }

  if (action === 'unban') {
    const { data: user } = await db.from('users').select('email, name').eq('id', id).single()
    await db.from('users').update({ banned: false }).eq('id', id)
    await logAdminAction(request, auth.email, 'admin_unban_user', 'user', id)

    await createNotification(id, 'account_restored', 'Your account has been restored', 'Your account is active again. Welcome back.')

    if (user?.email && !user.email.endsWith('@example.com')) {
      sendEmail(user.email, accountRestoredEmail(user.name || 'there')).catch(() => {})
    }

    return NextResponse.json({ updated: true, banned: false })
  }

  if (action === 'change_role') {
    // Only admins can change roles
    if (auth.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can change roles' }, { status: 403 })
    }
    if (!['user', 'moderator', 'admin'].includes(value)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }
    const { data: user } = await db.from('users').select('email, name').eq('id', id).single()
    await db.from('users').update({ role: value }).eq('id', id)
    await logAdminAction(request, auth.email, 'admin_change_role', 'user', id, { role: value })

    await createNotification(id, 'admin_notice', 'Your account role has been updated', `Your role has been changed to ${value}.`)

    if (user?.email && !user.email.endsWith('@example.com')) {
      sendEmail(user.email, roleChangedEmail(user.name || 'there', value)).catch(() => {})
    }

    return NextResponse.json({ updated: true, role: value })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
