import { sendPushToAdmins } from '@/lib/push'
import { sendEmail } from '@/lib/email'
import { systemErrorAlertEmail } from '@/lib/email-templates'
import { getSupabaseAdmin } from '@/lib/supabase-server'

/**
 * Notify admins of a system error via console, push, and email.
 * Use `pushOnly: true` for paths where sending email could cause loops
 * (e.g. inside the email delivery code itself).
 */
export async function notifyError(
  context: string,
  error: unknown,
  opts?: { pushOnly?: boolean },
) {
  const message = error instanceof Error ? error.message : String(error)

  console.error(`[${context}]`, error)

  // Push notification (fire-and-forget)
  sendPushToAdmins({
    title: `Error: ${context}`,
    body: message.slice(0, 200),
    url: '/admin',
  }).catch(() => {})

  // Email to admins (skip if pushOnly to avoid loops)
  if (!opts?.pushOnly) {
    try {
      const db = getSupabaseAdmin()
      const { data: admins } = await db
        .from('users')
        .select('email')
        .eq('role', 'admin')
        .eq('banned', false)
        .not('email', 'like', '%@example.com')

      if (admins) {
        const template = systemErrorAlertEmail(context, message)
        for (const admin of admins) {
          if (admin.email) {
            sendEmail(admin.email, template).catch(() => {})
          }
        }
      }
    } catch {
      // Don't let error notification errors cascade
    }
  }
}
