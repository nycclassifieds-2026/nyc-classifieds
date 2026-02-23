/**
 * Listing seed engine — generates daily classified listings across all categories.
 *
 * Called by the cron seed route alongside the Porch engine.
 * Targets 100-300 listings/day with growth multiplier.
 * Personals weighted heavily (~25% of all listings).
 */

import { SupabaseClient } from '@supabase/supabase-js'
import {
  pick, pickN, rb, nhName, fill, expandDescription,
  BOROUGHS, BOROUGH_WEIGHTS, NAMES, DEMO_WEIGHTS,
  STREETS, PLACES, CITIES, HOBBIES, TRAINS,
} from './seed-templates'
import {
  LISTING_TEMPLATES, CATEGORY_WEIGHTS, pickCategory, pickListingTemplate,
} from './seed-listing-templates'

// ─── Types ───

interface ListingState {
  id: number
  date: string
  listings_today: number
  start_date: string
  enabled: boolean
}

interface SeedUser {
  id: number
  email: string
  name: string
  _borough: string
  _nh: string
}

export interface ListingRunResult {
  listings_created: number
  kill_switch_level: string
  growth_multiplier: number
  daily_total: number
  enabled: boolean
}

// ─── Hourly weights — same NYC activity curve ───

const HOURLY_WEIGHTS: Record<number, number> = {
  0: 2, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1,
  6: 3, 7: 5, 8: 6,
  9: 5, 10: 4, 11: 5,
  12: 8, 13: 10, 14: 8,
  15: 5, 16: 4, 17: 5,
  18: 8, 19: 10, 20: 9,
  21: 7, 22: 4, 23: 3,
}

function pickHour(): number {
  const entries = Object.entries(HOURLY_WEIGHTS)
  const total = entries.reduce((sum, [, w]) => sum + w, 0)
  let r = Math.random() * total
  for (const [h, w] of entries) {
    r -= w
    if (r <= 0) return parseInt(h)
  }
  return 12
}

function staggeredTimestamp(): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const hour = pickHour()
  const min = Math.floor(Math.random() * 60)
  const sec = Math.floor(Math.random() * 60)
  return new Date(today.getTime() + hour * 3600000 + min * 60000 + sec * 1000).toISOString()
}

/** Staggered timestamp for a specific date (used by backfill) */
export function staggeredTimestampForDate(date: Date): string {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const hour = pickHour()
  const min = Math.floor(Math.random() * 60)
  const sec = Math.floor(Math.random() * 60)
  return new Date(day.getTime() + hour * 3600000 + min * 60000 + sec * 1000).toISOString()
}

// ─── ET helpers ───

function getETDate(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
}

// ─── Growth multiplier ───

function getGrowthMultiplier(startDate: string): number {
  const start = new Date(startDate)
  const now = new Date()
  const daysSinceLaunch = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000))
  return Math.min(1.0 + (daysSinceLaunch * 0.015), 3.0)
}

// ─── Daily target — 300-600 listings/day (higher volume for coverage) ───

function getDailyTarget(growthMultiplier: number): number {
  const day = new Date().getDay()
  const isWeekend = day === 0 || day === 6
  const min = isWeekend ? 400 : 300
  const max = isWeekend ? 600 : 500
  return Math.round(rb(min, max) * growthMultiplier)
}

// ─── Kill switch — reduces seeds as real listings increase ───

async function computeKillSwitch(db: SupabaseClient): Promise<{ multiplier: number; level: string }> {
  const todayStart = getETDate() + 'T00:00:00'
  const { count } = await db
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', todayStart)
    .not('user_id', 'in', `(SELECT id FROM users WHERE email LIKE '%@example.com')`)

  const realListings = count || 0
  if (realListings >= 500) return { multiplier: 0, level: 'off (500+ real listings)' }
  if (realListings >= 200) return { multiplier: 0.25, level: '25% (200+ real listings)' }
  if (realListings >= 100) return { multiplier: 0.50, level: '50% (100+ real listings)' }
  return { multiplier: 1.0, level: 'full' }
}

// ─── State management ───
// Uses the same cron_seed_state table — adds listing-specific fields via JSONB or separate columns.
// For simplicity, we track listing state in a second row (id=2).

async function getListingState(db: SupabaseClient): Promise<ListingState> {
  const { data } = await db
    .from('cron_seed_state')
    .select('*')
    .eq('id', 2)
    .single()

  if (data) {
    return {
      id: 2,
      date: data.date,
      listings_today: data.posts_today || 0,
      start_date: data.start_date,
      enabled: data.enabled,
    }
  }

  const now = getETDate()
  const initial = {
    id: 2,
    date: now,
    posts_today: 0,
    replies_today: 0,
    last_post_at: null,
    posts_by_user: {},
    start_date: now,
    enabled: true,
  }
  await db.from('cron_seed_state').upsert(initial)
  return { id: 2, date: now, listings_today: 0, start_date: now, enabled: true }
}

async function saveListingState(db: SupabaseClient, state: ListingState): Promise<void> {
  await db.from('cron_seed_state').upsert({
    id: state.id,
    date: state.date,
    posts_today: state.listings_today,
    replies_today: 0,
    last_post_at: new Date().toISOString(),
    posts_by_user: {},
    start_date: state.start_date,
    enabled: state.enabled,
  })
}

// ─── Seed user selection ───

async function getSeedUsers(db: SupabaseClient): Promise<SeedUser[]> {
  const { data } = await db
    .from('users')
    .select('id, email, name, address')
    .like('email', '%@example.com')
    .eq('verified', true)
    .limit(500)

  if (!data) return []

  return data.map(u => {
    const borough = pick(BOROUGH_WEIGHTS)
    const nh = pick(BOROUGHS[borough].nhs)
    return { id: u.id, email: u.email, name: u.name || 'User', _borough: borough, _nh: nh }
  })
}

// ─── Template variable generation ───

function generateVars(user: SeedUser): Record<string, string> {
  const demo = pick(DEMO_WEIGHTS)
  const namePool = NAMES[demo]
  return {
    nh: nhName(user._nh),
    last: pick(namePool?.last || ['Smith']),
    first: user.name.split(' ')[0] || 'Friend',
    street: pick(STREETS),
    street2: pick(STREETS),
    place: pick(PLACES),
    city: pick(CITIES),
    hobby: pick(HOBBIES),
    train: pick(TRAINS),
    biz: `${user.name.split(' ').pop()}'s ${pick(['Service', 'Shop', 'Co', 'Studio', 'Solutions'])}`,
  }
}

// ─── Location from borough/neighborhood ───

function getLocation(borough: string, nh: string): { location: string; lat: number; lng: number } {
  const b = BOROUGHS[borough]
  if (!b) return { location: nhName(nh) + ', NYC', lat: 40.7128, lng: -73.9660 }

  // Jitter lat/lng slightly for variety
  const lat = b.lat + (Math.random() - 0.5) * 0.02
  const lng = b.lng + (Math.random() - 0.5) * 0.02
  const boroughName = nhName(borough)
  return { location: `${nhName(nh)}, ${boroughName}`, lat, lng }
}

// ─── Coverage tracker — systematic borough + neighborhood + category rotation ───

function createCoverageTracker() {
  const nhCounts: Record<string, number> = {}
  const catCounts: Record<string, number> = {}

  // Init all neighborhoods
  for (const [borough, data] of Object.entries(BOROUGHS)) {
    for (const nh of data.nhs) {
      nhCounts[`${borough}:${nh}`] = 0
    }
  }

  // Init all categories
  for (const cat of Object.keys(CATEGORY_WEIGHTS)) {
    catCounts[cat] = 0
  }

  return {
    /** Pick the least-served borough+neighborhood for a user, returning a reassigned user */
    pickUser(candidates: SeedUser[]): SeedUser {
      // Find least-served borough
      const boroughTotals: Record<string, number> = {}
      for (const [key, c] of Object.entries(nhCounts)) {
        const b = key.split(':')[0]
        boroughTotals[b] = (boroughTotals[b] || 0) + c
      }
      // Weight by target (manhattan should have more, etc.)
      const boroughWeightMap: Record<string, number> = { manhattan: 35, brooklyn: 30, queens: 20, bronx: 10, 'staten-island': 5 }
      const boroughs = Object.keys(BOROUGHS)
      const minRatio = Math.min(...boroughs.map(b => (boroughTotals[b] || 0) / (boroughWeightMap[b] || 1)))
      const underBoroughs = boroughs.filter(b => (boroughTotals[b] || 0) / (boroughWeightMap[b] || 1) <= minRatio + 0.5)
      const targetBorough = pick(underBoroughs)

      // Within borough, pick least-served neighborhood
      const boroughNhs = BOROUGHS[targetBorough].nhs
      const minNh = Math.min(...boroughNhs.map(nh => nhCounts[`${targetBorough}:${nh}`] || 0))
      const underNhs = boroughNhs.filter(nh => (nhCounts[`${targetBorough}:${nh}`] || 0) === minNh)
      const targetNh = pick(underNhs)

      // Find a candidate in this borough or reassign one
      let chosen = candidates.find(u => u._borough === targetBorough)
      if (!chosen) chosen = pick(candidates)

      // Override to target neighborhood for even coverage
      chosen = { ...chosen, _borough: targetBorough, _nh: targetNh }
      nhCounts[`${targetBorough}:${targetNh}`] = (nhCounts[`${targetBorough}:${targetNh}`] || 0) + 1
      return chosen
    },

    /** Pick least-served category (weighted by CATEGORY_WEIGHTS) */
    pickCategory(): string {
      const cats = Object.keys(CATEGORY_WEIGHTS)
      const minRatio = Math.min(...cats.map(c => (catCounts[c] || 0) / (CATEGORY_WEIGHTS[c] || 1)))
      const underCats = cats.filter(c => (catCounts[c] || 0) / (CATEGORY_WEIGHTS[c] || 1) <= minRatio + 0.5)
      const chosen = pick(underCats)
      catCounts[chosen] = (catCounts[chosen] || 0) + 1
      return chosen
    },
  }
}

// ─── Main engine ───

export async function runListingSeedCron(db: SupabaseClient): Promise<ListingRunResult> {
  const state = await getListingState(db)

  if (!state.enabled) {
    return {
      listings_created: 0, kill_switch_level: 'disabled',
      growth_multiplier: 1, daily_total: 0, enabled: false,
    }
  }

  const today = getETDate()

  // Reset for new day
  if (state.date !== today) {
    state.date = today
    state.listings_today = 0
  }

  // Kill switch
  const killSwitch = await computeKillSwitch(db)
  if (killSwitch.multiplier === 0) {
    await saveListingState(db, state)
    return {
      listings_created: 0, kill_switch_level: killSwitch.level,
      growth_multiplier: 1, daily_total: state.listings_today, enabled: true,
    }
  }

  const seedUsers = await getSeedUsers(db)
  if (seedUsers.length === 0) {
    return {
      listings_created: 0, kill_switch_level: 'no seed users',
      growth_multiplier: 1, daily_total: 0, enabled: true,
    }
  }

  const growthMult = getGrowthMultiplier(state.start_date)
  const rawTarget = getDailyTarget(growthMult)
  const dailyTarget = Math.round(rawTarget * killSwitch.multiplier)

  // Create all remaining listings for the day in a single run
  const runTarget = dailyTarget - state.listings_today

  if (runTarget <= 0) {
    return {
      listings_created: 0, kill_switch_level: killSwitch.level,
      growth_multiplier: growthMult, daily_total: state.listings_today, enabled: true,
    }
  }

  const coverageTracker = createCoverageTracker()
  const usedTitles = new Set<string>()
  let created = 0

  // Batch insert for performance — collect rows, insert in chunks of 50
  const batch: Record<string, unknown>[] = []

  for (let i = 0; i < runTarget; i++) {
    const user = coverageTracker.pickUser(seedUsers)
    const vars = generateVars(user)
    const catSlug = coverageTracker.pickCategory()

    const tmpl = pickListingTemplate(catSlug, user._nh, vars)
    if (!tmpl) continue

    const titleLower = tmpl.title.toLowerCase()
    if (usedTitles.has(titleLower)) continue
    usedTitles.add(titleLower)

    const loc = getLocation(user._borough, user._nh)

    // Expand description with category-specific bonus detail
    const expandedDesc = expandDescription(tmpl.description, catSlug, vars)

    batch.push({
      user_id: user.id,
      title: tmpl.title,
      description: expandedDesc,
      price: tmpl.price || null,
      category_slug: catSlug,
      subcategory_slug: tmpl.subcategory,
      images: [],
      location: loc.location,
      lat: loc.lat,
      lng: loc.lng,
      status: 'active',
      expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
      created_at: staggeredTimestamp(),
    })

    // Insert in chunks of 50
    if (batch.length >= 50) {
      const { error } = await db.from('listings').insert(batch)
      if (!error) created += batch.length
      batch.length = 0
    }
  }

  // Insert remaining
  if (batch.length > 0) {
    const { error } = await db.from('listings').insert(batch)
    if (!error) created += batch.length
  }

  state.listings_today += created
  await saveListingState(db, state)

  return {
    listings_created: created,
    kill_switch_level: killSwitch.level,
    growth_multiplier: growthMult,
    daily_total: state.listings_today,
    enabled: true,
  }
}

// Re-export for backfill script usage
export { pickListingTemplate, BOROUGHS, BOROUGH_WEIGHTS, pick, rb, nhName, NAMES, DEMO_WEIGHTS, STREETS, PLACES, CITIES, HOBBIES, TRAINS }
