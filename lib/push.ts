import webpush from 'web-push'
import { getSupabaseAdmin } from '@/lib/supabase-server'

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY

let configured = false

function ensureConfigured() {
  if (configured) return
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    console.warn('VAPID keys not set — push notifications disabled')
    return
  }
  webpush.setVapidDetails(
    'mailto:jefftuckernyc@gmail.com',
    VAPID_PUBLIC,
    VAPID_PRIVATE,
  )
  configured = true
}

interface PushPayload {
  title: string
  body: string
  url?: string
}

/**
 * Send a push notification to all subscriptions for a given user.
 * Silently removes expired subscriptions (410 Gone).
 */
export async function sendPush(userId: number, payload: PushPayload) {
  ensureConfigured()
  if (!configured) return

  const db = getSupabaseAdmin()
  const { data: subs } = await db
    .from('push_subscriptions')
    .select('id, endpoint, keys_p256dh, keys_auth')
    .eq('user_id', userId)

  if (!subs || subs.length === 0) return

  const body = JSON.stringify(payload)

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth },
          },
          body,
        )
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode
        if (status === 410 || status === 404) {
          await db.from('push_subscriptions').delete().eq('id', sub.id)
        }
      }
    }),
  )
}

/**
 * Send a push notification to all admin and moderator users.
 */
export async function sendPushToAdmins(payload: PushPayload) {
  ensureConfigured()
  if (!configured) return

  const db = getSupabaseAdmin()
  const { data: admins } = await db
    .from('users')
    .select('id')
    .in('role', ['admin', 'moderator'])
    .eq('banned', false)

  if (!admins || admins.length === 0) return

  await Promise.allSettled(admins.map((a) => sendPush(a.id, payload)))
}
