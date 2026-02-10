/**
 * Cron seed engine — generates realistic content on a schedule.
 *
 * Called every 15 min by Vercel cron. Uses a single-row `cron_seed_state`
 * table for persistence across serverless invocations.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import {
  pick, rb, nhName, fill,
  BOROUGHS, BOROUGH_WEIGHTS, NAMES, DEMO_WEIGHTS,
  STREETS, PLACES, CITIES, HOBBIES, MOVIES, BOOKS, TRAINS,
  PORCH, LISTINGS, REPLY_POOL,
} from './seed-templates'
import { moderateFields } from './porch-moderation'

// ─── Types ───

interface CronState {
  id: number
  date: string          // ET date string e.g. "2026-02-10"
  posts_today: number
  replies_today: number
  last_post_at: string | null
  posts_by_user: Record<string, number>  // userId -> count
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

interface RunResult {
  posts_created: number
  replies_created: number
  listings_created: number
  skipped_moderation: number
  kill_switch_level: string
  daily_total: number
  enabled: boolean
}

// ─── Tone Profiles ───
// Deterministic from userId % 100
type ToneProfile = 'texter' | 'neighbor' | 'straight_shooter' | 'storyteller' | 'parent' | 'professional'

function getToneProfile(userId: number): ToneProfile {
  const bucket = userId % 100
  if (bucket < 20) return 'texter'            // 20%
  if (bucket < 45) return 'neighbor'           // 25%
  if (bucket < 65) return 'straight_shooter'   // 20%
  if (bucket < 80) return 'storyteller'        // 15%
  if (bucket < 90) return 'parent'             // 10%
  return 'professional'                        // 10%
}

/** Apply tone adjustments to generated content */
function applyTone(text: string, tone: ToneProfile): string {
  switch (tone) {
    case 'texter':
      return text.toLowerCase().replace(/\./g, '').replace(/'/g, '')
    case 'professional':
      // Capitalize first letter of each sentence
      return text.replace(/(^|\. )([a-z])/g, (_, pre, c) => pre + c.toUpperCase())
    case 'storyteller':
      return text // storytellers use templates as-is (they're already varied)
    case 'parent':
      return text
    case 'neighbor':
      return text
    case 'straight_shooter':
      return text.replace(/!+/g, '.') // less excitable
    default:
      return text
  }
}

// ─── Scheduling ───

/** Hourly post weights — matches NYC activity patterns */
const HOURLY_WEIGHTS: Record<number, number> = {
  0: 1, 1: 0, 2: 0, 3: 0, 4: 0, 5: 1,
  6: 5, 7: 7, 8: 8,
  9: 6, 10: 5, 11: 6,
  12: 10, 13: 15, 14: 10,
  15: 6, 16: 5, 17: 6,
  18: 10, 19: 15, 20: 12,
  21: 8, 22: 5, 23: 3,
}

/** Weekly ramp multiplier (Week 1 = lower, Week 4+ = full) */
function getWeeklyRamp(weekNumber: number): number {
  if (weekNumber <= 1) return 0.65   // 55-70/day
  if (weekNumber <= 2) return 0.80   // 65-85/day
  if (weekNumber <= 3) return 0.92   // 75-95/day
  return 1.0                         // 85-110/day
}

/** Weekend multiplier */
function getWeekendMultiplier(): number {
  const day = new Date().getDay()
  return (day === 0 || day === 6) ? 1.2 : 1.0
}

// ─── ET Time Helpers ───

function getETDate(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
}

function getETHour(): number {
  return parseInt(new Date().toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false }))
}

// ─── Kill Switch ───

interface KillSwitchResult {
  multiplier: number
  level: string
}

async function computeKillSwitch(db: SupabaseClient): Promise<KillSwitchResult> {
  const todayStart = getETDate() + 'T00:00:00'
  const { count } = await db
    .from('porch_posts')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', todayStart)
    .not('user_id', 'in', `(SELECT id FROM users WHERE email LIKE '%@example.com')`)

  const realPosts = count || 0

  if (realPosts >= 200) return { multiplier: 0, level: 'off (200+ real posts)' }
  if (realPosts >= 100) return { multiplier: 0.25, level: '25% (100+ real posts)' }
  if (realPosts >= 50)  return { multiplier: 0.50, level: '50% (50+ real posts)' }
  return { multiplier: 1.0, level: 'full' }
}

// ─── State Management ───

async function getState(db: SupabaseClient): Promise<CronState> {
  const { data } = await db
    .from('cron_seed_state')
    .select('*')
    .eq('id', 1)
    .single()

  if (data) return data as CronState

  // Initialize if not exists
  const now = getETDate()
  const initial: CronState = {
    id: 1,
    date: now,
    posts_today: 0,
    replies_today: 0,
    last_post_at: null,
    posts_by_user: {},
    start_date: now,
    enabled: true,
  }
  await db.from('cron_seed_state').upsert(initial)
  return initial
}

async function saveState(db: SupabaseClient, state: CronState): Promise<void> {
  await db.from('cron_seed_state').upsert(state)
}

// ─── Seed User Selection ───

async function getSeedUsers(db: SupabaseClient): Promise<SeedUser[]> {
  const { data } = await db
    .from('users')
    .select('id, email, name, address')
    .like('email', '%@example.com')
    .eq('verified', true)
    .limit(500)

  if (!data) return []

  return data.map(u => {
    // Derive borough from the user's lat/lng would be complex;
    // Instead, pick a random borough weighted — seed users are spread across boroughs
    const borough = pick(BOROUGH_WEIGHTS)
    const nh = pick(BOROUGHS[borough].nhs)
    return { id: u.id, email: u.email, name: u.name || 'User', _borough: borough, _nh: nh }
  })
}

// ─── Content Generation ───

function generateTemplateVars(user: SeedUser): Record<string, string> {
  const demo = pick(DEMO_WEIGHTS)
  const namePool = NAMES[demo]
  return {
    nh: nhName(user._nh),
    last: pick(namePool?.last || ['Smith']),
    first: user.name.split(' ')[0] || 'Friend',
    street: pick(STREETS),
    street2: pick(STREETS),
    street3: pick(STREETS),
    place: pick(PLACES),
    city: pick(CITIES),
    hobby: pick(HOBBIES),
    hobby2: pick(HOBBIES),
    movie: pick(MOVIES),
    book: pick(BOOKS),
    train: pick(TRAINS),
    biz: `${user.name.split(' ').pop()}'s ${pick(['Service', 'Shop', 'Co'])}`,
  }
}

function generatePorchPost(user: SeedUser) {
  const types = Object.keys(PORCH)
  const type = pick(types)
  const tmpl = pick(PORCH[type])
  const vars = generateTemplateVars(user)
  const tone = getToneProfile(user.id)

  let title = fill(tmpl.t, vars).slice(0, 100)
  let body = fill(tmpl.b, vars).slice(0, 500)

  title = applyTone(title, tone)
  body = applyTone(body, tone)

  const pinned = (type === 'lost-and-found' || type === 'pet-sighting') && Math.random() < 0.4
  const expH = type === 'alert' ? 48 : (type === 'lost-and-found' || type === 'pet-sighting') ? 72 : 720

  return {
    user_id: user.id,
    post_type: type,
    title,
    body,
    borough_slug: user._borough,
    neighborhood_slug: user._nh,
    pinned,
    expires_at: new Date(Date.now() + expH * 3600000).toISOString(),
  }
}

function generateListing(user: SeedUser) {
  const catKeys = Object.keys(LISTINGS)
  const catSlug = pick(catKeys)
  const subs = LISTINGS[catSlug]
  const subGrp = pick(subs)
  const idx = rb(0, subGrp.t.length - 1)
  const vars = generateTemplateVars(user)

  return {
    user_id: user.id,
    title: fill(subGrp.t[idx], vars).slice(0, 200),
    description: fill(subGrp.d[idx], vars),
    price: subGrp.p[idx] || null,
    category_slug: catSlug,
    subcategory_slug: subGrp.sub,
    images: '{}',
    location: `${nhName(user._nh)}, ${nhName(user._borough)}`,
    lat: BOROUGHS[user._borough].lat + (Math.random() - 0.5) * 0.04,
    lng: BOROUGHS[user._borough].lng + (Math.random() - 0.5) * 0.04,
    status: 'active',
    expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
  }
}

function generateReply(user: SeedUser) {
  let body = pick(REPLY_POOL)
  body = body.replace('{first}', user.name.split(' ')[0] || 'Friend')
  return applyTone(body, getToneProfile(user.id))
}

// ─── Main Engine ───

export async function runSeedCron(db: SupabaseClient): Promise<RunResult> {
  const state = await getState(db)

  if (!state.enabled) {
    return {
      posts_created: 0, replies_created: 0, listings_created: 0,
      skipped_moderation: 0, kill_switch_level: 'disabled',
      daily_total: state.posts_today, enabled: false,
    }
  }

  // Reset daily counters if new day
  const today = getETDate()
  if (state.date !== today) {
    state.date = today
    state.posts_today = 0
    state.replies_today = 0
    state.posts_by_user = {}
    state.last_post_at = null
  }

  // Compute week number from start_date
  const startDate = new Date(state.start_date)
  const weekNumber = Math.ceil((Date.now() - startDate.getTime()) / (7 * 86400000)) || 1
  const weeklyRamp = getWeeklyRamp(weekNumber)
  const weekendMult = getWeekendMultiplier()

  // Kill switch
  const killSwitch = await computeKillSwitch(db)
  if (killSwitch.multiplier === 0) {
    await saveState(db, state)
    return {
      posts_created: 0, replies_created: 0, listings_created: 0,
      skipped_moderation: 0, kill_switch_level: killSwitch.level,
      daily_total: state.posts_today, enabled: true,
    }
  }

  // Compute target posts for this 15-min run
  const hour = getETHour()
  const hourlyWeight = HOURLY_WEIGHTS[hour] || 1
  const basePostsThisRun = (hourlyWeight / 4) * weeklyRamp * weekendMult * killSwitch.multiplier
  const targetPosts = Math.round(basePostsThisRun + (Math.random() - 0.5) * 2) // jitter ±1

  if (targetPosts <= 0) {
    await saveState(db, state)
    return {
      posts_created: 0, replies_created: 0, listings_created: 0,
      skipped_moderation: 0, kill_switch_level: killSwitch.level,
      daily_total: state.posts_today, enabled: true,
    }
  }

  // Get seed users
  const seedUsers = await getSeedUsers(db)
  if (seedUsers.length === 0) {
    return {
      posts_created: 0, replies_created: 0, listings_created: 0,
      skipped_moderation: 0, kill_switch_level: 'no seed users',
      daily_total: state.posts_today, enabled: true,
    }
  }

  // Split: 60% porch, 40% listings
  const porchTarget = Math.ceil(targetPosts * 0.6)
  const listingTarget = targetPosts - porchTarget

  let postsCreated = 0
  let listingsCreated = 0
  let repliesCreated = 0
  let skippedModeration = 0

  // Select users (max 3 per user per day)
  function selectUser(): SeedUser | null {
    const candidates = seedUsers.filter(u => {
      const dailyCount = state.posts_by_user[String(u.id)] || 0
      return dailyCount < 3
    })
    if (candidates.length === 0) return null

    // Prefer users from weighted boroughs
    const boroughSlug = pick(BOROUGH_WEIGHTS)
    const boroughCandidates = candidates.filter(u => u._borough === boroughSlug)
    return boroughCandidates.length > 0 ? pick(boroughCandidates) : pick(candidates)
  }

  // Create porch posts
  for (let i = 0; i < porchTarget; i++) {
    const user = selectUser()
    if (!user) break

    const post = generatePorchPost(user)

    // Run moderation
    const modResult = moderateFields(post.title, post.body)
    if (modResult.blocked) {
      skippedModeration++
      continue
    }

    const { error } = await db.from('porch_posts').insert(post)
    if (!error) {
      postsCreated++
      state.posts_today++
      state.posts_by_user[String(user.id)] = (state.posts_by_user[String(user.id)] || 0) + 1
      state.last_post_at = new Date().toISOString()
    }
  }

  // Create listings
  for (let i = 0; i < listingTarget; i++) {
    const user = selectUser()
    if (!user) break

    const listing = generateListing(user)

    const modResult = moderateFields(listing.title, listing.description)
    if (modResult.blocked) {
      skippedModeration++
      continue
    }

    const { error } = await db.from('listings').insert(listing)
    if (!error) {
      listingsCreated++
      state.posts_today++
      state.posts_by_user[String(user.id)] = (state.posts_by_user[String(user.id)] || 0) + 1
    }
  }

  // Add replies: for every 3 posts, add 1-2 replies to existing posts
  const replyTarget = Math.floor((postsCreated + listingsCreated) / 3) * rb(1, 2)

  if (replyTarget > 0) {
    // Get recent porch post IDs to reply to (posts from last 48 hours)
    const cutoff = new Date(Date.now() - 48 * 3600000).toISOString()
    const { data: recentPosts } = await db
      .from('porch_posts')
      .select('id, user_id')
      .gte('created_at', cutoff)
      .limit(100)

    if (recentPosts && recentPosts.length > 0) {
      for (let i = 0; i < replyTarget; i++) {
        const targetPost = pick(recentPosts)
        // Pick a different user for the reply
        const replyUser = seedUsers.find(u => u.id !== targetPost.user_id) || pick(seedUsers)
        const replyBody = generateReply(replyUser)

        const modResult = moderateFields(replyBody)
        if (modResult.blocked) {
          skippedModeration++
          continue
        }

        const { error } = await db.from('porch_replies').insert({
          post_id: targetPost.id,
          user_id: replyUser.id,
          body: replyBody,
          helpful_count: Math.random() < 0.3 ? rb(1, 10) : 0,
        })
        if (!error) {
          repliesCreated++
          state.replies_today++
        }
      }
    }
  }

  // Save state
  await saveState(db, state)

  return {
    posts_created: postsCreated,
    replies_created: repliesCreated,
    listings_created: listingsCreated,
    skipped_moderation: skippedModeration,
    kill_switch_level: killSwitch.level,
    daily_total: state.posts_today,
    enabled: true,
  }
}
