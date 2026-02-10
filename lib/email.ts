import { Resend } from 'resend'

let _resend: Resend | null = null

function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY || '')
  return _resend
}

const FROM_ADDRESS = 'The NYC Classifieds <notifications@thenycclassifieds.com>'

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
      console.error('Email send error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Email send exception:', err)
    return { success: false, error: String(err) }
  }
}
