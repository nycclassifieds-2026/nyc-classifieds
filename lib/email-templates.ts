export function otpEmail(code: string): { subject: string; html: string } {
  return {
    subject: `${code} — Your NYC Classifieds verification code`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem;">
        <h1 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem;">NYC Classifieds</h1>
        <p style="color: #475569; margin-bottom: 1.5rem;">Enter this code to verify your email:</p>
        <div style="background: #f1f5f9; border-radius: 0.75rem; padding: 1.5rem; text-align: center; margin-bottom: 1.5rem;">
          <span style="font-size: 2rem; font-weight: 700; letter-spacing: 0.25em; color: #0f172a;">${code}</span>
        </div>
        <p style="color: #94a3b8; font-size: 0.875rem;">This code expires in 15 minutes. If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  }
}
