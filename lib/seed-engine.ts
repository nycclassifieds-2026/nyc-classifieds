/**
 * Cron seed engine — generates a full day's content in one batch.
 *
 * Called once daily at 08:00 UTC by Vercel cron.
 * Uses a single-row `cron_seed_state` table for persistence.
 * Generates varying daily totals with staggered timestamps.
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
  dm_threads_created: number
  skipped_moderation: number
  kill_switch_level: string
  growth_multiplier: number
  daily_total: number
  enabled: boolean
}

// ─── 12 Tone Profiles ───

type ToneProfile =
  | 'gen_z' | 'millennial' | 'boomer' | 'texter'
  | 'professional' | 'storyteller' | 'straight_shooter' | 'hype'
  | 'chill' | 'parent' | 'old_school_nyc' | 'poet'

function getToneProfile(userId: number): ToneProfile {
  const tones: ToneProfile[] = [
    'gen_z', 'millennial', 'boomer', 'texter',
    'professional', 'storyteller', 'straight_shooter', 'hype',
    'chill', 'parent', 'old_school_nyc', 'poet',
  ]
  return tones[userId % tones.length]
}

function applyTone(text: string, tone: ToneProfile): string {
  switch (tone) {
    case 'gen_z':
      return text.toLowerCase().replace(/\./g, '').replace(/'/g, '').replace(/!+/g, ' fr').replace(/,\s/g, ' ').trim()
    case 'millennial':
      return text.replace(/\.$/, ' lol').replace(/!$/, ' tbh')
    case 'boomer':
      return text.replace(/(^|\. )([a-z])/g, (_, pre, c) => pre + c.toUpperCase())
    case 'texter':
      return text.toLowerCase().replace(/\./g, '').replace(/'/g, '').replace(/you/g, 'u').replace(/are/g, 'r').replace(/to /g, '2 ').replace(/for /g, '4 ')
    case 'professional':
      return text.replace(/(^|\. )([a-z])/g, (_, pre, c) => pre + c.toUpperCase()).replace(/dont/g, 'do not').replace(/cant/g, 'cannot').replace(/wont/g, 'will not')
    case 'storyteller':
      return text
    case 'straight_shooter':
      return text.replace(/!+/g, '.').replace(/\.\./g, '.')
    case 'hype':
      return Math.random() < 0.3 ? text.toUpperCase() : text.replace(/\.$/, '!!!')
    case 'chill':
      return text.replace(/\./g, '...').replace(/!/g, '...')
    case 'parent':
      return text
    case 'old_school_nyc':
      return text.replace(/\.$/, ', ya know what I mean?')
    case 'poet':
      return text.replace(/\./g, ' —')
    default:
      return text
  }
}

// ─── Hourly weights for staggering timestamps ───

const HOURLY_WEIGHTS: Record<number, number> = {
  0: 1, 1: 0, 2: 0, 3: 0, 4: 0, 5: 1,
  6: 5, 7: 7, 8: 8,
  9: 6, 10: 5, 11: 6,
  12: 10, 13: 15, 14: 10,
  15: 6, 16: 5, 17: 6,
  18: 10, 19: 15, 20: 12,
  21: 8, 22: 5, 23: 3,
}

/** Pick a random hour weighted by NYC activity patterns */
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

/** Generate a staggered timestamp for today */
function staggeredTimestamp(): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const hour = pickHour()
  const min = Math.floor(Math.random() * 60)
  const sec = Math.floor(Math.random() * 60)
  return new Date(today.getTime() + hour * 3600000 + min * 60000 + sec * 1000).toISOString()
}

// ─── Growth multiplier — scales up over time ───

function getGrowthMultiplier(startDate: string): number {
  const start = new Date(startDate)
  const now = new Date()
  const daysSinceLaunch = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000))
  return Math.min(1.0 + (daysSinceLaunch * 0.015), 3.0)
}

// ─── Daily target — varies each day ───

function getDailyTarget(growthMultiplier: number): number {
  const day = new Date().getDay()
  const isWeekend = day === 0 || day === 6

  // Base: 80-200 weekday, 120-250 weekend
  const min = isWeekend ? 120 : 80
  const max = isWeekend ? 250 : 200
  return Math.round(rb(min, max) * growthMultiplier)
}

// ─── ET Time Helpers ───

function getETDate(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
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
    biz: `${user.name.split(' ').pop()}'s ${pick(['Service', 'Shop', 'Co', 'Studio', 'Solutions'])}`,
  }
}

function generatePorchPost(user: SeedUser, created_at: string) {
  const types = Object.keys(PORCH)
  const type = pick(types)
  const tmpl = pick(PORCH[type])
  const vars = generateTemplateVars(user)
  const tone = getToneProfile(user.id)

  const title = applyTone(fill(tmpl.t, vars).slice(0, 100), tone)
  const body = applyTone(fill(tmpl.b, vars).slice(0, 500), tone)

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
    expires_at: new Date(new Date(created_at).getTime() + expH * 3600000).toISOString(),
    created_at,
  }
}

function generateListing(user: SeedUser, created_at: string) {
  const catKeys = Object.keys(LISTINGS)
  const catSlug = pick(catKeys)
  const subs = LISTINGS[catSlug]
  const subGrp = pick(subs)
  const idx = rb(0, subGrp.t.length - 1)
  const vars = generateTemplateVars(user)
  const tone = getToneProfile(user.id)

  return {
    user_id: user.id,
    title: applyTone(fill(subGrp.t[idx], vars).slice(0, 200), tone),
    description: applyTone(fill(subGrp.d[idx], vars), tone),
    price: subGrp.p[idx] || null,
    category_slug: catSlug,
    subcategory_slug: subGrp.sub,
    images: '{}',
    location: `${nhName(user._nh)}, ${nhName(user._borough)}`,
    lat: BOROUGHS[user._borough].lat + (Math.random() - 0.5) * 0.04,
    lng: BOROUGHS[user._borough].lng + (Math.random() - 0.5) * 0.04,
    status: 'active',
    expires_at: new Date(new Date(created_at).getTime() + 30 * 86400000).toISOString(),
    created_at,
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
      posts_created: 0, replies_created: 0, listings_created: 0, dm_threads_created: 0,
      skipped_moderation: 0, kill_switch_level: 'disabled', growth_multiplier: 1,
      daily_total: state.posts_today, enabled: false,
    }
  }

  // Prevent double-run on same day
  const today = getETDate()
  if (state.date === today && state.posts_today > 0) {
    return {
      posts_created: 0, replies_created: 0, listings_created: 0, dm_threads_created: 0,
      skipped_moderation: 0, kill_switch_level: 'already ran today', growth_multiplier: 1,
      daily_total: state.posts_today, enabled: true,
    }
  }

  // Reset for new day
  state.date = today
  state.posts_today = 0
  state.replies_today = 0
  state.posts_by_user = {}
  state.last_post_at = null

  // Kill switch
  const killSwitch = await computeKillSwitch(db)
  if (killSwitch.multiplier === 0) {
    await saveState(db, state)
    return {
      posts_created: 0, replies_created: 0, listings_created: 0, dm_threads_created: 0,
      skipped_moderation: 0, kill_switch_level: killSwitch.level, growth_multiplier: 1,
      daily_total: 0, enabled: true,
    }
  }

  // Get seed users
  const seedUsers = await getSeedUsers(db)
  if (seedUsers.length === 0) {
    return {
      posts_created: 0, replies_created: 0, listings_created: 0, dm_threads_created: 0,
      skipped_moderation: 0, kill_switch_level: 'no seed users', growth_multiplier: 1,
      daily_total: 0, enabled: true,
    }
  }

  // Daily target varies with growth multiplier, scaled by kill switch
  const growthMult = getGrowthMultiplier(state.start_date)
  const rawTarget = getDailyTarget(growthMult)
  const totalTarget = Math.round(rawTarget * killSwitch.multiplier)

  // Split: 50% porch, 25% listings, 25% replies (boosted reply ratio for engagement)
  const porchTarget = Math.round(totalTarget * 0.50)
  const listingTarget = Math.round(totalTarget * 0.25)
  const replyTarget = Math.round(totalTarget * 0.15)
  const dmTarget = totalTarget - porchTarget - listingTarget - replyTarget // ~10% for DMs

  let postsCreated = 0
  let listingsCreated = 0
  let repliesCreated = 0
  let dmThreadsCreated = 0
  let skippedModeration = 0

  // Select users (max 5 per user per day to spread across 500 users)
  function selectUser(): SeedUser | null {
    const candidates = seedUsers.filter(u => {
      const dailyCount = state.posts_by_user[String(u.id)] || 0
      return dailyCount < 5
    })
    if (candidates.length === 0) return null

    const boroughSlug = pick(BOROUGH_WEIGHTS)
    const boroughCandidates = candidates.filter(u => u._borough === boroughSlug)
    return boroughCandidates.length > 0 ? pick(boroughCandidates) : pick(candidates)
  }

  // Create porch posts with staggered timestamps
  for (let i = 0; i < porchTarget; i++) {
    const user = selectUser()
    if (!user) break

    const ts = staggeredTimestamp()
    const post = generatePorchPost(user, ts)

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

  // Create listings with staggered timestamps
  for (let i = 0; i < listingTarget; i++) {
    const user = selectUser()
    if (!user) break

    const ts = staggeredTimestamp()
    const listing = generateListing(user, ts)

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

  // Create replies to recent porch posts
  if (replyTarget > 0) {
    const cutoff = new Date(Date.now() - 48 * 3600000).toISOString()
    const { data: recentPosts } = await db
      .from('porch_posts')
      .select('id, user_id')
      .gte('created_at', cutoff)
      .limit(200)

    if (recentPosts && recentPosts.length > 0) {
      for (let i = 0; i < replyTarget; i++) {
        const targetPost = pick(recentPosts)
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
          created_at: staggeredTimestamp(),
        })
        if (!error) {
          repliesCreated++
          state.replies_today++
        }
      }
    }
  }

  // Create DM threads between seed users
  if (dmTarget > 0) {
    const DM_OPENERS = [
      'Hey, saw your post — is this still available?',
      'Hi! Interested in this. Can we meet up?',
      'How much would you take for this?',
      'Hey is this still up for grabs?',
      'Interested! When works for pickup?',
      'Hi, I live nearby. Is this still available?',
      'Love this — can I come see it this weekend?',
      'Would you do a lower price if I pick up today?',
      'Hey! Do you deliver or is it pickup only?',
      'This is exactly what Ive been looking for. DM me your availability!',
    ]
    const DM_REPLIES = [
      'Yes still available! When works for you?',
      'Sure thing. Im free this weekend.',
      'Hey! Yes its available. Im near {nh}.',
      'Yep! Can meet anytime after 5pm.',
      'Still got it. Cash or Venmo works.',
      'Hey yes! Pickup only, Im near {street}.',
      'For sure. Saturday morning work?',
      'Its yours if you want it. DM me when youre ready.',
    ]

    for (let i = 0; i < dmTarget; i++) {
      const sender = selectUser()
      if (!sender) break
      const receiver = seedUsers.find(u => u.id !== sender.id) || pick(seedUsers)
      const ts = staggeredTimestamp()

      const openerBody = pick(DM_OPENERS)
      const vars = generateTemplateVars(receiver)
      const replyBody = pick(DM_REPLIES).replace('{nh}', vars.nh).replace('{street}', vars.street)

      // Create conversation thread
      const { data: thread, error: threadErr } = await db.from('messages').insert({
        sender_id: sender.id,
        receiver_id: receiver.id,
        body: applyTone(openerBody, getToneProfile(sender.id)),
        created_at: ts,
      }).select('id').single()

      if (!threadErr && thread) {
        // Add a reply ~1-4 hours later
        const replyTs = new Date(new Date(ts).getTime() + rb(1, 4) * 3600000).toISOString()
        await db.from('messages').insert({
          sender_id: receiver.id,
          receiver_id: sender.id,
          body: applyTone(replyBody, getToneProfile(receiver.id)),
          created_at: replyTs,
        })
        dmThreadsCreated++
      }
    }
  }

  // Save state
  await saveState(db, state)

  return {
    posts_created: postsCreated,
    replies_created: repliesCreated,
    listings_created: listingsCreated,
    dm_threads_created: dmThreadsCreated,
    skipped_moderation: skippedModeration,
    kill_switch_level: killSwitch.level,
    growth_multiplier: growthMult,
    daily_total: state.posts_today,
    enabled: true,
  }
}
