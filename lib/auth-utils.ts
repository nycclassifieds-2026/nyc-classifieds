import crypto from 'crypto'

const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SERVICE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_KEY — add it to .env.local')
}

const EMAIL_TOKEN_SECRET = SERVICE_KEY
const SESSION_SECRET = process.env.SESSION_SECRET || SERVICE_KEY

export function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin + SERVICE_KEY).digest('hex')
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

/** Sign a session cookie: userId.timestamp.hmac */
export function signSession(userId: string): string {
  const ts = Date.now()
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(`${userId}:${ts}`).digest('hex')
  return `${userId}.${ts}.${sig}`
}

/** Verify a signed session cookie. Returns userId or null. */
export function verifySession(cookie: string | undefined): string | null {
  if (!cookie) return null
  const parts = cookie.split('.')
  if (parts.length !== 3) return null
  const [userId, tsStr, sig] = parts
  const ts = parseInt(tsStr)
  if (!userId || isNaN(ts)) return null
  // Sessions expire after 30 days
  if (Date.now() - ts > 30 * 24 * 60 * 60 * 1000) return null
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(`${userId}:${ts}`).digest('hex')
  if (sig.length !== expected.length) return null
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  return userId
}
