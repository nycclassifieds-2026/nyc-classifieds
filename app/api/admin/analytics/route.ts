import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, 'moderator')
  if (auth instanceof NextResponse) return auth

  const db = getSupabaseAdmin()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()

  // Get seed user IDs upfront so we can exclude them everywhere
  const { data: seedUserRows } = await db
    .from('users')
    .select('id')
    .like('email', '%@example.com')

  const seedIds = (seedUserRows || []).map(u => u.id)
  const seedUserIds = new Set(seedIds)

  // Run all queries in parallel — filter out seed users on every query
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
    signupEvents30d,
    signupEvents7d,
  ] = await Promise.all([
    db.from('users').select('id', { count: 'exact', head: true }).not('email', 'like', '%@example.com'),
    seedIds.length > 0
      ? db.from('listings').select('id', { count: 'exact', head: true }).not('user_id', 'in', `(${seedIds.join(',')})`)
      : db.from('listings').select('id', { count: 'exact', head: true }),
    seedIds.length > 0
      ? db.from('porch_posts').select('id', { count: 'exact', head: true }).not('user_id', 'in', `(${seedIds.join(',')})`)
      : db.from('porch_posts').select('id', { count: 'exact', head: true }),
    seedIds.length > 0
      ? db.from('porch_replies').select('id', { count: 'exact', head: true }).not('user_id', 'in', `(${seedIds.join(',')})`)
      : db.from('porch_replies').select('id', { count: 'exact', head: true }),
    // Messages: exclude where BOTH sender and recipient are seed
    db.from('messages').select('id', { count: 'exact', head: true }),
    // Daily signups last 30 days (real only)
    db.from('users').select('created_at').not('email', 'like', '%@example.com').gte('created_at', thirtyDaysAgo).order('created_at', { ascending: true }),
    // Daily porch posts last 30 days (all, filtered client-side)
    db.from('porch_posts').select('created_at, user_id').gte('created_at', thirtyDaysAgo).order('created_at', { ascending: true }),
    // Daily listings last 30 days (all, filtered client-side)
    db.from('listings').select('created_at, user_id').gte('created_at', thirtyDaysAgo).order('created_at', { ascending: true }),
    // Daily replies (all, filtered client-side)
    db.from('porch_replies').select('created_at, user_id').gte('created_at', thirtyDaysAgo),
    // Daily messages (all, filtered client-side)
    db.from('messages').select('created_at, sender_id').gte('created_at', thirtyDaysAgo),
    // Porch posts by borough (all, filtered client-side)
    db.from('porch_posts').select('borough_slug, user_id'),
    // Porch posts by type (all, filtered client-side)
    db.from('porch_posts').select('post_type, user_id'),
    // Listings by category (all, filtered client-side)
    db.from('listings').select('category_slug, user_id'),
    // Signup funnel events last 30 days
    db.from('signup_events').select('step, status, error').gte('created_at', thirtyDaysAgo),
    // Signup funnel events last 7 days
    db.from('signup_events').select('step, status, error').gte('created_at', sevenDaysAgo),
  ])

  // Helper: group items by date, excluding seed users
  function groupByDateReal(items: { created_at: string; user_id?: number; sender_id?: number }[]): Record<string, number> {
    const groups: Record<string, number> = {}
    for (const item of items || []) {
      const uid = item.user_id ?? item.sender_id
      if (uid != null && seedUserIds.has(uid)) continue
      const date = item.created_at?.slice(0, 10)
      if (date) groups[date] = (groups[date] || 0) + 1
    }
    return groups
  }

  // Helper: count by field, excluding seed users
  function countByFieldReal(items: { user_id?: number; [key: string]: unknown }[], field: string): Record<string, number> {
    const counts: Record<string, number> = {}
    for (const item of items || []) {
      if (item.user_id != null && seedUserIds.has(item.user_id as number)) continue
      const val = item[field] as string
      if (val) counts[val] = (counts[val] || 0) + 1
    }
    return counts
  }

  const userGrowth = groupByDateReal((recentUsers.data || []) as { created_at: string }[])
  const postVolume = groupByDateReal((recentPorchPosts.data || []) as { created_at: string; user_id: number }[])
  const listingVolume = groupByDateReal((recentListings.data || []) as { created_at: string; user_id: number }[])

  // Count real messages (exclude where sender is a seed user)
  const realMessages = ((recentMessages.data || []) as { created_at: string; sender_id: number }[])
    .filter(m => !seedUserIds.has(m.sender_id))
  const realMessageCount = realMessages.length

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

  // Today's stats (real users only)
  const todayStr = new Date().toISOString().slice(0, 10)
  const postsToday = (postVolume[todayStr] || 0) + (listingVolume[todayStr] || 0)

  return NextResponse.json({
    totals: {
      users: totalUsers.count || 0,
      listings: totalListings.count || 0,
      porch_posts: totalPorchPosts.count || 0,
      porch_replies: totalPorchReplies.count || 0,
      messages: realMessageCount,
      posts_today: postsToday,
    },
    daily: {
      user_growth: userGrowth,
      post_volume: postVolume,
      listing_volume: listingVolume,
      replies: groupByDateReal((recentReplies.data || []) as { created_at: string; user_id: number }[]),
      messages: groupByDateReal(realMessages as { created_at: string; sender_id: number }[]),
    },
    breakdowns: {
      by_borough: countByFieldReal((porchByBorough.data || []) as { user_id: number; borough_slug: string }[], 'borough_slug'),
      by_post_type: countByFieldReal((porchByType.data || []) as { user_id: number; post_type: string }[], 'post_type'),
      by_category: countByFieldReal((listingsByCategory.data || []) as { user_id: number; category_slug: string }[], 'category_slug'),
    },
    signup_funnel: signupFunnel,
  })
}
