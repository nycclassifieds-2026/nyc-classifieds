import crypto from 'crypto'

const EMAIL_TOKEN_SECRET = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'fallback'

export function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin + (process.env.SUPABASE_SERVICE_KEY || '')).digest('hex')
}

/** Sign an email verification token (HMAC) so signup can proceed without storing a user */
export function signEmailToken(email: string): string {
  const ts = Date.now()
  const sig = crypto.createHmac('sha256', EMAIL_TOKEN_SECRET).update(`${email}:${ts}`).digest('hex')
  return `${ts}:${sig}`
}

/** Constant-time string comparison to prevent timing attacks */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

/** Verify a PIN hash matches (constant-time) */
export function verifyPin(pin: string, storedHash: string): boolean {
  return safeEqual(hashPin(pin), storedHash)
}

/** Verify an email token is valid and not expired (default 1 hour) */
export function verifyEmailToken(email: string, token: string, maxAgeMs = 60 * 60 * 1000): boolean {
  const parts = token.split(':')
  if (parts.length !== 2) return false
  const [tsStr, sig] = parts
  const ts = parseInt(tsStr)
  if (isNaN(ts) || Date.now() - ts > maxAgeMs) return false
  const expected = crypto.createHmac('sha256', EMAIL_TOKEN_SECRET).update(`${email}:${ts}`).digest('hex')
  return safeEqual(sig, expected)
}
