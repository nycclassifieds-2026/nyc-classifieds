import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { runSeedCron } from '@/lib/seed-engine'
import { runListingSeedCron } from '@/lib/seed-listings-engine'
import { createDailySeedUsers } from '@/lib/seed-users'

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = getSupabaseAdmin()

    // Create new seed users first (5-15/day)
    const newUsers = await createDailySeedUsers(db)

    // Clean up old page_views and user_events (>90 days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString()
    await Promise.all([
      db.from('page_views').delete().lt('created_at', ninetyDaysAgo),
      db.from('user_events').delete().lt('created_at', ninetyDaysAgo),
    ])

    // Run both engines in parallel
    const [porchResult, listingResult] = await Promise.all([
      runSeedCron(db),
      runListingSeedCron(db),
    ])

    return NextResponse.json({
      ok: true,
      porch: porchResult,
      listings: listingResult,
      new_seed_users: newUsers,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Cron seed error:', err)
    return NextResponse.json({ error: 'Cron execution failed' }, { status: 500 })
  }
}
