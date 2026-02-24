import { Resend } from 'resend'
import { sendPushToAdmins } from '@/lib/push'

let _resend: Resend | null = null

function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY || '')
  return _resend
}

const FROM_ADDRESS = 'The NYC Classifieds <notifications@thenycclassifieds.com>'

/** Notify admin of email delivery failure via push only (no email to avoid loops) */
function notifyEmailError(context: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[Email delivery] ${context}:`, error)
  sendPushToAdmins({
    title: 'Email delivery error',
    body: `${context}: ${message}`.slice(0, 200),
    url: '/admin',
  }).catch(() => {})
}

export async function sendEmail(
  to: string,
  template: { subject: string; html: string },
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await getResend().emails.send({
      from: FROM_ADDRESS,
      to,
      subject: template.subject,
      html: template.html,
    })

    if (error) {
      notifyEmailError(`Failed to send "${template.subject}" to ${to}`, error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    notifyEmailError(`Exception sending "${template.subject}" to ${to}`, err)
    return { success: false, error: String(err) }
  }
}
