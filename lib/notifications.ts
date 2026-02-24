import { getSupabaseAdmin } from '@/lib/supabase-server'
import { sendPush } from '@/lib/push'

export type NotificationType =
  | 'new_message'
  | 'porch_reply'
  | 'helpful_vote'
  | 'listing_expiring'
  | 'listing_expired'
  | 'listing_removed'
  | 'porch_post_removed'
  | 'flag_resolved'
  | 'account_banned'
  | 'account_restored'
  | 'admin_notice'
  | 'feedback_reply'
  | 'admin_warning'
  | 'saved_search_match'

export async function createNotification(
  userId: number,
  type: NotificationType,
  title: string,
  body: string,
  link?: string,
) {
  const db = getSupabaseAdmin()
  await db.from('notifications').insert({
    user_id: userId,
    type,
    title,
    body,
    link: link || null,
  })

  // Fire push notification (async, don't block)
  sendPush(userId, { title, body, url: link || '/' }).catch(() => {})
}
