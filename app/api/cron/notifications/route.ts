import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { sendEmail } from '@/lib/email'
import { listingExpiringEmail, listingExpiredEmail, adminDailyDigestEmail, DailyDigestStats } from '@/lib/email-templates'
import { createNotification } from '@/lib/notifications'

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
  const todayStart = new Date(etNow)
  todayStart.setHours(0, 0, 0, 0)
  const todayStartISO = todayStart.toISOString()

  // ── 1. Listings expiring in 3 days — send reminder ──

  const threeDaysFromNow = new Date(etNow.getTime() + 3 * 86400000)
  const threeDaysStart = new Date(threeDaysFromNow.setHours(0, 0, 0, 0)).toISOString()
  const threeDaysEnd = new Date(threeDaysFromNow.setHours(23, 59, 59, 999)).toISOString()

  const { data: expiringListings } = await db
    .from('listings')
    .select('id, title, category_slug, user_id, users!inner(email, name)')
    .eq('status', 'active')
    .gte('expires_at', threeDaysStart)
    .lte('expires_at', threeDaysEnd)
    .not('users.email', 'like', '%@example.com')

  for (const listing of expiringListings || []) {
    const user = listing.users as unknown as { email: string; name: string | null }
    if (!user?.email) continue

    // In-app notification
    await createNotification(
      listing.user_id,
      'listing_expiring',
      'Your listing expires in 3 days',
      listing.title,
      `/listings/${(listing as any).category_slug}/${listing.id}`,
    )

    const template = listingExpiringEmail(
      user.name || 'there',
      listing.title,
      listing.id,
      (listing as any).category_slug,
    )
    const result = await sendEmail(user.email, template)
    if (result.success) expiringNotified++
  }

  // ── 2. Listings that expired today — send expired notice ──

  const yesterdayStart = new Date(todayStart.getTime() - 86400000)

  const { data: expiredListings } = await db
    .from('listings')
    .select('id, title, user_id, users!inner(email, name)')
    .eq('status', 'active')
    .gte('expires_at', yesterdayStart.toISOString())
    .lte('expires_at', todayStartISO)
    .not('users.email', 'like', '%@example.com')

  if (expiredListings && expiredListings.length > 0) {
    const ids = expiredListings.map(l => l.id)
    await db.from('listings').update({ status: 'expired' }).in('id', ids)
  }

  for (const listing of expiredListings || []) {
    const user = listing.users as unknown as { email: string; name: string | null }
    if (!user?.email) continue

    // In-app notification
    await createNotification(
      listing.user_id,
      'listing_expired',
      'Your listing has expired',
      listing.title,
      '/account',
    )

    const template = listingExpiredEmail(user.name || 'there', listing.title)
    const result = await sendEmail(user.email, template)
    if (result.success) expiredNotified++
  }

  // ── 3. Daily admin digest ──

  let digestSent = false
  try {
    // Yesterday boundaries for growth comparison
    const yesterdayStart = new Date(todayStart.getTime() - 86400000)
    const yesterdayStartISO2 = yesterdayStart.toISOString()

    // Gather today's stats (real users only, exclude @example.com seed users)
    const [
      { count: newUsers },
      { count: newListings },
      { count: newPorchPosts },
      { count: newReplies },
      { count: newMessages },
      { count: pendingFlags },
      { count: totalUsers },
      { count: totalListings },
    ] = await Promise.all([
      db.from('users').select('id', { count: 'exact', head: true })
        .gte('created_at', todayStartISO)
        .not('email', 'like', '%@example.com')
        .eq('verified', true),
      db.from('listings').select('id', { count: 'exact', head: true })
        .gte('created_at', todayStartISO)
        .not('user_id', 'in', `(SELECT id FROM users WHERE email LIKE '%@example.com')`),
      db.from('porch_posts').select('id', { count: 'exact', head: true })
        .gte('created_at', todayStartISO)
        .not('user_id', 'in', `(SELECT id FROM users WHERE email LIKE '%@example.com')`),
      db.from('porch_replies').select('id', { count: 'exact', head: true })
        .gte('created_at', todayStartISO)
        .not('user_id', 'in', `(SELECT id FROM users WHERE email LIKE '%@example.com')`),
      db.from('messages').select('id', { count: 'exact', head: true })
        .gte('created_at', todayStartISO),
      db.from('flagged_content').select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      db.from('users').select('id', { count: 'exact', head: true })
        .not('email', 'like', '%@example.com')
        .eq('verified', true),
      db.from('listings').select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
    ])

    // Seed stats today
    const [
      { count: seedPostsToday },
      { count: seedRepliesToday },
      { count: seedListingsToday },
      { count: seedNewUsers },
      { count: totalSeedUsers },
      { count: totalPorchPosts },
      { count: totalSeedListings },
    ] = await Promise.all([
      db.from('porch_posts').select('id', { count: 'exact', head: true })
        .gte('created_at', todayStartISO)
        .filter('user_id', 'in', `(SELECT id FROM users WHERE email LIKE '%@example.com')`),
      db.from('porch_replies').select('id', { count: 'exact', head: true })
        .gte('created_at', todayStartISO)
        .filter('user_id', 'in', `(SELECT id FROM users WHERE email LIKE '%@example.com')`),
      db.from('listings').select('id', { count: 'exact', head: true })
        .gte('created_at', todayStartISO)
        .filter('user_id', 'in', `(SELECT id FROM users WHERE email LIKE '%@example.com')`),
      db.from('users').select('id', { count: 'exact', head: true })
        .gte('created_at', todayStartISO)
        .like('email', '%@example.com'),
      db.from('users').select('id', { count: 'exact', head: true })
        .like('email', '%@example.com'),
      db.from('porch_posts').select('id', { count: 'exact', head: true }),
      db.from('listings').select('id', { count: 'exact', head: true })
        .filter('user_id', 'in', `(SELECT id FROM users WHERE email LIKE '%@example.com')`)
        .eq('status', 'active'),
    ])

    // Yesterday stats for growth comparison
    const [
      { count: yesterdayListings },
      { count: yesterdayPorchPosts },
      { count: yesterdaySeedUsers },
    ] = await Promise.all([
      db.from('listings').select('id', { count: 'exact', head: true })
        .gte('created_at', yesterdayStartISO2)
        .lt('created_at', todayStartISO),
      db.from('porch_posts').select('id', { count: 'exact', head: true })
        .gte('created_at', yesterdayStartISO2)
        .lt('created_at', todayStartISO),
      db.from('users').select('id', { count: 'exact', head: true })
        .gte('created_at', yesterdayStartISO2)
        .lt('created_at', todayStartISO)
        .like('email', '%@example.com'),
    ])

    // Seed listings by category today
    const { data: seedListingCats } = await db
      .from('listings')
      .select('category_slug')
      .gte('created_at', todayStartISO)
      .filter('user_id', 'in', `(SELECT id FROM users WHERE email LIKE '%@example.com')`)

    const seedListingsByCategory: Record<string, number> = {}
    for (const row of seedListingCats || []) {
      seedListingsByCategory[row.category_slug] = (seedListingsByCategory[row.category_slug] || 0) + 1
    }

    const stats: DailyDigestStats = {
      newUsers: newUsers || 0,
      newListings: newListings || 0,
      newPorchPosts: newPorchPosts || 0,
      newReplies: newReplies || 0,
      newMessages: newMessages || 0,
      pendingFlags: pendingFlags || 0,
      seedPostsToday: seedPostsToday || 0,
      totalUsers: totalUsers || 0,
      totalListings: totalListings || 0,
      expiringNotified,
      expiredNotified,
      seedListingsToday: seedListingsToday || 0,
      seedRepliesToday: seedRepliesToday || 0,
      seedNewUsers: seedNewUsers || 0,
      totalSeedUsers: totalSeedUsers || 0,
      totalPorchPosts: totalPorchPosts || 0,
      totalSeedListings: totalSeedListings || 0,
      yesterdayListings: yesterdayListings || 0,
      yesterdayPorchPosts: yesterdayPorchPosts || 0,
      yesterdaySeedUsers: yesterdaySeedUsers || 0,
      seedListingsByCategory,
    }

    // Send to all admins
    const { data: admins } = await db
      .from('users')
      .select('email')
      .eq('role', 'admin')
      .eq('banned', false)
      .not('email', 'like', '%@example.com')

    if (admins && admins.length > 0) {
      const digestTemplate = adminDailyDigestEmail(stats)
      for (const admin of admins) {
        if (admin.email) {
          await sendEmail(admin.email, digestTemplate)
        }
      }
      digestSent = true
    }
  } catch (err) {
    console.error('Daily digest error:', err)
  }

  return NextResponse.json({
    ok: true,
    expiring_notified: expiringNotified,
    expired_notified: expiredNotified,
    digest_sent: digestSent,
    timestamp: new Date().toISOString(),
  })
}
