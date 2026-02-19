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
      .select('event_type, details, created_at')
      .gte('created_at', thirtyDaysAgo),
  ])

  const views = viewsResult.data || []
  const realUsers = usersResult.data || []
  const userEvents = eventsResult.data || []

  // === PAGE VIEW METRICS ===

  const viewsToday = views.filter(v => v.created_at >= todayStart).length
  const viewsWeek = views.filter(v => v.created_at >= sevenDaysAgo).length
  const viewsMonth = views.length

  // Unique visitors
  const allHashes = views.map(v => v.visitor_hash).filter(Boolean)
  const uniqueHashes = new Set(allHashes).size
  const todayHashes = new Set(views.filter(v => v.created_at >= todayStart).map(v => v.visitor_hash).filter(Boolean)).size

  // Returning vs new visitors (visitors seen on multiple days)
  const hashByDay = new Map<string, Set<string>>()
  for (const v of views) {
    if (!v.visitor_hash) continue
    const day = v.created_at.slice(0, 10)
    if (!hashByDay.has(v.visitor_hash)) hashByDay.set(v.visitor_hash, new Set())
    hashByDay.get(v.visitor_hash)!.add(day)
  }
  let returningVisitors = 0
  let newVisitors = 0
  for (const [, days] of hashByDay) {
    if (days.size > 1) returningVisitors++
    else newVisitors++
  }

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

  // Daily unique visitors (30d)
  const dailyUniques: Record<string, number> = {}
  const dailyHashSets: Record<string, Set<string>> = {}
  for (const v of views) {
    if (!v.visitor_hash) continue
    const day = v.created_at.slice(0, 10)
    if (!dailyHashSets[day]) dailyHashSets[day] = new Set()
    dailyHashSets[day].add(v.visitor_hash)
  }
  for (const [day, hashes] of Object.entries(dailyHashSets)) {
    dailyUniques[day] = hashes.size
  }

  // Hourly breakdown (all 30d data, by hour of day)
  const hourly: Record<string, number> = {}
  for (const v of views) {
    const hour = new Date(v.created_at).getUTCHours()
    const label = `${String(hour).padStart(2, '0')}:00`
    hourly[label] = (hourly[label] || 0) + 1
  }

  // Day-of-week breakdown
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const byDayOfWeek: Record<string, number> = {}
  for (const v of views) {
    const d = dayNames[new Date(v.created_at).getUTCDay()]
    byDayOfWeek[d] = (byDayOfWeek[d] || 0) + 1
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
    .slice(0, 30)
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
    .slice(0, 15)
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {} as Record<string, number>)

  // Daily real signups (30d)
  const dailySignups: Record<string, number> = {}
  for (const u of realUsers) {
    if (u.created_at >= thirtyDaysAgo) {
      const day = u.created_at.slice(0, 10)
      dailySignups[day] = (dailySignups[day] || 0) + 1
    }
  }

  // === USER EVENT METRICS ===

  const eventCounts: Record<string, number> = {}
  const searchQueries: Record<string, number> = {}
  const zeroResultSearches: Record<string, number> = {}
  const businessClicks: Record<string, number> = {}
  const listingContactClicks: Record<string, number> = {}
  const dailyEvents: Record<string, number> = {}

  for (const e of userEvents) {
    eventCounts[e.event_type] = (eventCounts[e.event_type] || 0) + 1

    // Daily event volume
    const day = e.created_at.slice(0, 10)
    dailyEvents[day] = (dailyEvents[day] || 0) + 1

    const det = (e.details && typeof e.details === 'object') ? e.details as Record<string, unknown> : {}

    if (e.event_type === 'search') {
      const q = String(det.query || '').toLowerCase().trim()
      if (q) {
        searchQueries[q] = (searchQueries[q] || 0) + 1
        if (det.results_count === 0) {
          zeroResultSearches[q] = (zeroResultSearches[q] || 0) + 1
        }
      }
    }

    if (e.event_type === 'business_link_click') {
      const linkType = String(det.linkType || 'unknown')
      businessClicks[linkType] = (businessClicks[linkType] || 0) + 1
    }

    if (e.event_type === 'listing_contact_click') {
      const lid = String(det.listing_id || '?')
      listingContactClicks[`listing #${lid}`] = (listingContactClicks[`listing #${lid}`] || 0) + 1
    }
  }

  const recentSearches = Object.entries(searchQueries)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {} as Record<string, number>)

  const topZeroResultSearches = Object.entries(zeroResultSearches)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {} as Record<string, number>)

  return NextResponse.json({
    totals: {
      views_today: viewsToday,
      views_week: viewsWeek,
      views_month: viewsMonth,
      unique_visitors_30d: uniqueHashes,
      unique_visitors_today: todayHashes,
      returning_visitors: returningVisitors,
      new_visitors: newVisitors,
      real_users: realUsers.length,
      real_signups_today: realSignupsToday,
      real_signups_7d: realSignups7d,
      real_signups_30d: realSignups30d,
      total_events_30d: userEvents.length,
    },
    daily_views: dailyViews,
    daily_uniques: dailyUniques,
    daily_events: dailyEvents,
    daily_signups: dailySignups,
    hourly,
    by_day_of_week: byDayOfWeek,
    sources,
    top_pages: topPages,
    devices,
    locations: {
      countries: topCountries,
      cities: topCities,
    },
    event_counts: eventCounts,
    recent_searches: recentSearches,
    zero_result_searches: topZeroResultSearches,
    business_clicks: businessClicks,
    listing_contact_clicks: listingContactClicks,
  })
}
