import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, 'moderator')
  if (auth instanceof NextResponse) return auth

  const db = getSupabaseAdmin()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()

  // Run all queries in parallel
  const [
    totalUsers,
    totalListings,
    totalPorchPosts,
    totalPorchReplies,
    totalMessages,
    recentUsers,
    recentPorchPosts,
    recentListings,
    recentReplies,
    recentMessages,
    porchByBorough,
    porchByType,
    listingsByCategory,
    cronState,
    signupEvents30d,
    signupEvents7d,
  ] = await Promise.all([
    db.from('users').select('id', { count: 'exact', head: true }),
    db.from('listings').select('id', { count: 'exact', head: true }),
    db.from('porch_posts').select('id', { count: 'exact', head: true }),
    db.from('porch_replies').select('id', { count: 'exact', head: true }),
    db.from('messages').select('id', { count: 'exact', head: true }),
    // Daily signups last 30 days
    db.from('users').select('created_at, email').gte('created_at', thirtyDaysAgo).order('created_at', { ascending: true }),
    // Daily porch posts last 30 days
    db.from('porch_posts').select('created_at, user_id').gte('created_at', thirtyDaysAgo).order('created_at', { ascending: true }),
    // Daily listings last 30 days
    db.from('listings').select('created_at, user_id').gte('created_at', thirtyDaysAgo).order('created_at', { ascending: true }),
    // Daily replies
    db.from('porch_replies').select('created_at').gte('created_at', thirtyDaysAgo),
    // Daily messages
    db.from('messages').select('created_at').gte('created_at', thirtyDaysAgo),
    // Porch posts by borough
    db.from('porch_posts').select('borough_slug'),
    // Porch posts by type
    db.from('porch_posts').select('post_type'),
    // Listings by category
    db.from('listings').select('category_slug'),
    // Cron state
    db.from('cron_seed_state').select('*').eq('id', 1).single(),
    // Signup funnel events last 30 days
    db.from('signup_events').select('step, status, error').gte('created_at', thirtyDaysAgo),
    // Signup funnel events last 7 days
    db.from('signup_events').select('step, status, error').gte('created_at', sevenDaysAgo),
  ])

  // Helper: group items by date
  function groupByDate(items: { created_at: string }[]): Record<string, number> {
    const groups: Record<string, number> = {}
    for (const item of items || []) {
      const date = item.created_at?.slice(0, 10)
      if (date) groups[date] = (groups[date] || 0) + 1
    }
    return groups
  }

  // Helper: count real vs seed for items with user info
  function splitRealSeed(items: { created_at: string; email?: string }[]): { real: Record<string, number>; seed: Record<string, number> } {
    const real: Record<string, number> = {}
    const seed: Record<string, number> = {}
    for (const item of items || []) {
      const date = item.created_at?.slice(0, 10)
      if (!date) continue
      if (item.email?.endsWith('@example.com')) {
        seed[date] = (seed[date] || 0) + 1
      } else {
        real[date] = (real[date] || 0) + 1
      }
    }
    return { real, seed }
  }

  // Helper: count by field
  function countByField(items: Record<string, string>[], field: string): Record<string, number> {
    const counts: Record<string, number> = {}
    for (const item of items || []) {
      const val = item[field]
      if (val) counts[val] = (counts[val] || 0) + 1
    }
    return counts
  }

  // Build user growth with real/seed split
  const userGrowth = splitRealSeed((recentUsers.data || []) as { created_at: string; email: string }[])

  // For posts, we need to look up which user_ids are seed users
  // Get all seed user IDs
  const { data: seedUserRows } = await db
    .from('users')
    .select('id')
    .like('email', '%@example.com')

  const seedUserIds = new Set((seedUserRows || []).map(u => u.id))

  function splitPostsRealSeed(items: { created_at: string; user_id: number }[]): { real: Record<string, number>; seed: Record<string, number> } {
    const real: Record<string, number> = {}
    const seed: Record<string, number> = {}
    for (const item of items || []) {
      const date = item.created_at?.slice(0, 10)
      if (!date) continue
      if (seedUserIds.has(item.user_id)) {
        seed[date] = (seed[date] || 0) + 1
      } else {
        real[date] = (real[date] || 0) + 1
      }
    }
    return { real, seed }
  }

  const postVolume = splitPostsRealSeed((recentPorchPosts.data || []) as { created_at: string; user_id: number }[])
  const listingVolume = splitPostsRealSeed((recentListings.data || []) as { created_at: string; user_id: number }[])

  // Build signup funnel data
  type SignupEvent = { step: string; status: string; error: string | null }
  function buildFunnelData(events: SignupEvent[]) {
    const funnel: Record<string, { started: number; completed: number; failed: number; errors: Record<string, number> }> = {}
    for (const e of events || []) {
      if (!funnel[e.step]) funnel[e.step] = { started: 0, completed: 0, failed: 0, errors: {} }
      const s = funnel[e.step]
      if (e.status === 'started') s.started++
      else if (e.status === 'completed') s.completed++
      else if (e.status === 'failed') {
        s.failed++
        if (e.error) s.errors[e.error] = (s.errors[e.error] || 0) + 1
      }
    }
    return funnel
  }

  const signupFunnel = {
    last_7_days: buildFunnelData((signupEvents7d.data || []) as SignupEvent[]),
    last_30_days: buildFunnelData((signupEvents30d.data || []) as SignupEvent[]),
  }

  // Today's stats
  const todayStr = new Date().toISOString().slice(0, 10)
  const postsToday = (postVolume.real[todayStr] || 0) + (postVolume.seed[todayStr] || 0) +
                     (listingVolume.real[todayStr] || 0) + (listingVolume.seed[todayStr] || 0)

  return NextResponse.json({
    totals: {
      users: totalUsers.count || 0,
      listings: totalListings.count || 0,
      porch_posts: totalPorchPosts.count || 0,
      porch_replies: totalPorchReplies.count || 0,
      messages: totalMessages.count || 0,
      posts_today: postsToday,
    },
    daily: {
      user_growth: userGrowth,
      post_volume: postVolume,
      listing_volume: listingVolume,
      replies: groupByDate((recentReplies.data || []) as { created_at: string }[]),
      messages: groupByDate((recentMessages.data || []) as { created_at: string }[]),
    },
    breakdowns: {
      by_borough: countByField((porchByBorough.data || []) as Record<string, string>[], 'borough_slug'),
      by_post_type: countByField((porchByType.data || []) as Record<string, string>[], 'post_type'),
      by_category: countByField((listingsByCategory.data || []) as Record<string, string>[], 'category_slug'),
    },
    cron: cronState.data || null,
    signup_funnel: signupFunnel,
  })
}
