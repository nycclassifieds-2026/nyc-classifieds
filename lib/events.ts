import { getSupabaseAdmin } from '@/lib/supabase-server'
import { sendPushToAdmins } from '@/lib/push'

interface LogEventOpts {
  userId?: number
  ip?: string
  path?: string
  visitorHash?: string
  notify?: boolean
  notifyTitle?: string
  notifyBody?: string
}

/**
 * Fire-and-forget event logger. Inserts into user_events and optionally
 * sends a push notification to all admins.
 */
export function logEvent(
  type: string,
  details?: Record<string, unknown>,
  opts?: LogEventOpts,
) {
  const db = getSupabaseAdmin()

  // Fire-and-forget insert
  db.from('user_events').insert({
    event_type: type,
    user_id: opts?.userId ?? null,
    path: opts?.path ?? null,
    details: details ?? {},
    ip: opts?.ip ?? null,
    visitor_hash: opts?.visitorHash ?? null,
  }).then(() => {}, () => {})

  // Optional push notification
  if (opts?.notify && opts.notifyTitle) {
    sendPushToAdmins({
      title: opts.notifyTitle,
      body: opts.notifyBody || type,
      url: '/admin',
    }).catch(() => {})
  }
}
