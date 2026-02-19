import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin, logAdminAction } from '@/lib/admin-auth'
import { sendEmail } from '@/lib/email'
import { userWarningEmail, accountBannedEmail } from '@/lib/email-templates'
import { createNotification } from '@/lib/notifications'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, 'moderator')
  if (auth instanceof NextResponse) return auth

  const userId = request.nextUrl.searchParams.get('user_id')
  if (!userId) {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const { data: warnings, error } = await db
    .from('user_warnings')
    .select('id, user_id, admin_id, reason, severity, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch warnings' }, { status: 500 })
  }

  return NextResponse.json({ warnings: warnings || [] })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, 'moderator')
  if (auth instanceof NextResponse) return auth

  const { user_id, reason, severity } = await request.json()

  if (!user_id || !reason || !severity) {
    return NextResponse.json({ error: 'user_id, reason, and severity required' }, { status: 400 })
  }

  if (!['low', 'medium', 'high'].includes(severity)) {
    return NextResponse.json({ error: 'severity must be low, medium, or high' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  // Get user info
  const { data: user } = await db
    .from('users')
    .select('id, email, name, banned')
    .eq('id', user_id)
    .single()

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (user.banned) {
    return NextResponse.json({ error: 'User is already banned' }, { status: 400 })
  }

  // Insert warning
  const { error: insertError } = await db.from('user_warnings').insert({
    user_id,
    admin_id: auth.id,
    reason,
    severity,
  })

  if (insertError) {
    return NextResponse.json({ error: 'Failed to create warning' }, { status: 500 })
  }

  // Count total warnings
  const { count: warningCount } = await db
    .from('user_warnings')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user_id)

  const totalWarnings = warningCount || 1

  // Log admin action
  await logAdminAction(request, auth.email, 'admin_warn_user', 'user', user_id, {
    reason,
    severity,
    warning_number: totalWarnings,
  })

  // Send in-app notification
  await createNotification(
    user_id,
    'admin_warning',
    'You have received a warning',
    `Reason: ${reason}. This is warning #${totalWarnings} on your account.`,
  )

  // Send email
  if (user.email && !user.email.endsWith('@example.com')) {
    sendEmail(user.email, userWarningEmail(user.name || 'there', reason, severity, totalWarnings)).catch(() => {})
  }

  // Auto-ban on 3rd warning
  let autoBanned = false
  if (totalWarnings >= 3) {
    await db.from('users').update({ banned: true }).eq('id', user_id)
    autoBanned = true

    await logAdminAction(request, auth.email, 'admin_auto_ban', 'user', user_id, {
      reason: `Auto-banned after ${totalWarnings} warnings`,
    })

    await createNotification(
      user_id,
      'account_banned',
      'Your account has been suspended',
      `Your account was automatically suspended after receiving ${totalWarnings} warnings.`,
    )

    if (user.email && !user.email.endsWith('@example.com')) {
      sendEmail(user.email, accountBannedEmail(user.name || 'there')).catch(() => {})
    }
  }

  return NextResponse.json({
    ok: true,
    warning_count: totalWarnings,
    auto_banned: autoBanned,
  })
}
