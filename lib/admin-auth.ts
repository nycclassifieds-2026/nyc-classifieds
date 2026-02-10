import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { getClientIp } from '@/lib/rate-limit'

const COOKIE_NAME = 'nyc_classifieds_user'
const ROLE_HIERARCHY: Record<string, number> = { user: 0, moderator: 1, admin: 2 }

interface AdminUser {
  id: number
  email: string
  name: string | null
  role: string
  verified: boolean
}

/**
 * Require admin/moderator auth for an API route.
 * Returns the user object on success, or a NextResponse error on failure.
 */
export async function requireAdmin(
  request: NextRequest,
  minimumRole: 'moderator' | 'admin' = 'moderator'
): Promise<AdminUser | NextResponse> {
  const userId = request.cookies.get(COOKIE_NAME)?.value
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const db = getSupabaseAdmin()
  const { data: user } = await db
    .from('users')
    .select('id, email, name, role, verified, banned')
    .eq('id', userId)
    .single()

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 })
  }

  if (user.banned) {
    return NextResponse.json({ error: 'Account is banned' }, { status: 403 })
  }

  const userLevel = ROLE_HIERARCHY[user.role] ?? 0
  const requiredLevel = ROLE_HIERARCHY[minimumRole] ?? 1

  if (userLevel < requiredLevel) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  return { id: user.id, email: user.email, name: user.name, role: user.role, verified: user.verified }
}

/** Log an admin action to the audit_log table */
export async function logAdminAction(
  request: NextRequest,
  actor: string,
  action: string,
  entity: string,
  entityId: number | string,
  details?: Record<string, unknown>
) {
  const db = getSupabaseAdmin()
  await db.from('audit_log').insert({
    actor,
    action,
    entity,
    entity_id: Number(entityId),
    details: details || {},
    ip: getClientIp(request.headers),
  })
}
