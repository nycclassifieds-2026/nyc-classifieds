import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

let cached: { count: number; ts: number } | null = null
const CACHE_TTL = 60_000 // 60 seconds

export async function GET() {
  const target = parseInt(process.env.NEXT_PUBLIC_PRELAUNCH_TARGET || '10000', 10)
  const live = process.env.NEXT_PUBLIC_PRELAUNCH !== 'true'

  const now = Date.now()
  if (!cached || now - cached.ts > CACHE_TTL) {
    const db = getSupabaseAdmin()
    const { count } = await db.from('users').select('id', { count: 'exact', head: true })
    cached = { count: count || 0, ts: now }
  }

  return NextResponse.json({ count: cached.count, target, live })
}
