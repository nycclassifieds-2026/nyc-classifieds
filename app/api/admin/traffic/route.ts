import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return auth

  const db = getSupabaseAdmin()
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

  // Fetch page_views, users, and user_events in parallel
  const [viewsResult, usersResult, eventsResult] = await Promise.all([
    db.from('page_views')
      .select('path, referrer_source, device_type, visitor_hash, country, city, created_at')
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: false }),
    db.from('users')
      .select('id, email, created_at')
      .not('email', 'like', '%@example.com%'),
    db.from('user_events')
      .select('event_type, details')
      .gte('created_at', thirtyDaysAgo),
  ])

  const views = viewsResult.data || []
  const realUsers = usersResult.data || []

  // Totals
  const viewsToday = views.filter(v => v.created_at >= todayStart).length
  const viewsWeek = views.filter(v => v.created_at >= sevenDaysAgo).length
  const viewsMonth = views.length
  const uniqueHashes = new Set(views.map(v => v.visitor_hash)).size

  // Real signups
  const realSignupsToday = realUsers.filter(u => u.created_at >= todayStart).length
  const realSignups7d = realUsers.filter(u => u.created_at >= sevenDaysAgo).length
  const realSignups30d = realUsers.filter(u => u.created_at >= thirtyDaysAgo).length

  // Daily views (30d)
  const dailyViews: Record<string, number> = {}
  for (const v of views) {
    const day = v.created_at.slice(0, 10)
    dailyViews[day] = (dailyViews[day] || 0) + 1
  }

  // Traffic sources
  const sources: Record<string, number> = {}
  for (const v of views) {
    const src = v.referrer_source || 'Direct'
    sources[src] = (sources[src] || 0) + 1
  }

  // Top pages
  const pages: Record<string, number> = {}
  for (const v of views) {
    pages[v.path] = (pages[v.path] || 0) + 1
  }
  const topPages = Object.entries(pages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {} as Record<string, number>)

  // Devices
  const devices: Record<string, number> = {}
  for (const v of views) {
    const d = v.device_type || 'Desktop'
    devices[d] = (devices[d] || 0) + 1
  }

  // Locations
  const countries: Record<string, number> = {}
  const cities: Record<string, number> = {}
  for (const v of views) {
    if (v.country) countries[v.country] = (countries[v.country] || 0) + 1
    if (v.city) cities[v.city] = (cities[v.city] || 0) + 1
  }
  const topCountries = Object.entries(countries)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {} as Record<string, number>)
  const topCities = Object.entries(cities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {} as Record<string, number>)

  // Daily real signups (30d)
  const dailySignups: Record<string, number> = {}
  for (const u of realUsers) {
    if (u.created_at >= thirtyDaysAgo) {
      const day = u.created_at.slice(0, 10)
      dailySignups[day] = (dailySignups[day] || 0) + 1
    }
  }

  // Event counts by type (30d)
  const userEvents = eventsResult.data || []
  const eventCounts: Record<string, number> = {}
  const searchQueries: Record<string, number> = {}
  for (const e of userEvents) {
    eventCounts[e.event_type] = (eventCounts[e.event_type] || 0) + 1
    if (e.event_type === 'search' && e.details && typeof e.details === 'object') {
      const q = String((e.details as Record<string, unknown>).query || '').toLowerCase().trim()
      if (q) searchQueries[q] = (searchQueries[q] || 0) + 1
    }
  }
  const recentSearches = Object.entries(searchQueries)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {} as Record<string, number>)

  return NextResponse.json({
    totals: {
      views_today: viewsToday,
      views_week: viewsWeek,
      views_month: viewsMonth,
      unique_visitors_30d: uniqueHashes,
      real_users: realUsers.length,
      real_signups_today: realSignupsToday,
      real_signups_7d: realSignups7d,
      real_signups_30d: realSignups30d,
    },
    daily_views: dailyViews,
    daily_signups: dailySignups,
    sources,
    top_pages: topPages,
    devices,
    locations: {
      countries: topCountries,
      cities: topCities,
    },
    event_counts: eventCounts,
    recent_searches: recentSearches,
  })
}
