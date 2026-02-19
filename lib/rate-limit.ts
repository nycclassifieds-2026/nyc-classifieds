import { getSupabaseAdmin } from '@/lib/supabase-server'

/**
 * Supabase-backed rate limiter.
 * Returns true if the request is allowed, false if rate limited.
 * Fails open on DB error (returns true).
 */
export async function rateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): Promise<boolean> {
  try {
    const db = getSupabaseAdmin()
    const { data, error } = await db.rpc('check_rate_limit', {
      p_key: key,
      p_max: maxRequests,
      p_window_ms: windowMs,
    })
    if (error) {
      console.error('Rate limit DB error:', error.message)
      return true // fail open
    }
    return data as boolean
  } catch (err) {
    console.error('Rate limit error:', err)
    return true // fail open
  }
}

/**
 * Get client IP from request headers.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    '127.0.0.1'
  )
}
