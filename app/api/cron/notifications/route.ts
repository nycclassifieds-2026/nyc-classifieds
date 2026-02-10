import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { sendEmail } from '@/lib/email'
import { listingExpiringEmail, listingExpiredEmail } from '@/lib/email-templates'

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

  const db = getSupabaseAdmin()
  let expiringNotified = 0
  let expiredNotified = 0

  // Use Eastern Time for date boundaries
  const etNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }))

  // 1. Listings expiring in 3 days — send reminder
  const threeDaysFromNow = new Date(etNow.getTime() + 3 * 86400000)
  const threeDaysStart = new Date(threeDaysFromNow.setHours(0, 0, 0, 0)).toISOString()
  const threeDaysEnd = new Date(threeDaysFromNow.setHours(23, 59, 59, 999)).toISOString()

  const { data: expiringListings } = await db
    .from('listings')
    .select('id, title, category_slug, user_id, users!inner(email, name)')
    .eq('status', 'active')
    .gte('expires_at', threeDaysStart)
    .lte('expires_at', threeDaysEnd)
    .not('users.email', 'like', '%@example.com') // Skip seed users

  for (const listing of expiringListings || []) {
    const user = listing.users as unknown as { email: string; name: string | null }
    if (!user?.email) continue

    const template = listingExpiringEmail(
      user.name || 'there',
      listing.title,
      listing.id,
      (listing as any).category_slug,
    )
    const result = await sendEmail(user.email, template)
    if (result.success) expiringNotified++
  }

  // 2. Listings that expired today — send expired notice
  const todayStart = new Date(etNow)
  todayStart.setHours(0, 0, 0, 0)
  const yesterdayStart = new Date(todayStart.getTime() - 86400000)

  const { data: expiredListings } = await db
    .from('listings')
    .select('id, title, user_id, users!inner(email, name)')
    .eq('status', 'active')
    .gte('expires_at', yesterdayStart.toISOString())
    .lte('expires_at', todayStart.toISOString())
    .not('users.email', 'like', '%@example.com')

  // Update expired listings to 'expired' status
  if (expiredListings && expiredListings.length > 0) {
    const ids = expiredListings.map(l => l.id)
    await db.from('listings').update({ status: 'expired' }).in('id', ids)
  }

  for (const listing of expiredListings || []) {
    const user = listing.users as unknown as { email: string; name: string | null }
    if (!user?.email) continue

    const template = listingExpiredEmail(user.name || 'there', listing.title)
    const result = await sendEmail(user.email, template)
    if (result.success) expiredNotified++
  }

  return NextResponse.json({
    ok: true,
    expiring_notified: expiringNotified,
    expired_notified: expiredNotified,
    timestamp: new Date().toISOString(),
  })
}
