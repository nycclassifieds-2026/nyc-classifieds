/**
 * Cron seed engine — generates a full day's Porch content in one batch.
 *
 * Called once daily at 08:00 EST (13:00 UTC) by Vercel cron.
 * Uses a single-row `cron_seed_state` table for persistence.
 * Generates 20-50 Porch actions/day (posts + replies) with staggered
 * timestamps across all hours including late night.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import {
  pick, rb, nhName, fill,
  BOROUGHS, BOROUGH_WEIGHTS, NAMES, DEMO_WEIGHTS,
  STREETS, PLACES, CITIES, HOBBIES, MOVIES, BOOKS, TRAINS,
  PORCH, REPLIES_SHORT, REPLIES_MEDIUM, REPLIES_LONG,
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
  profiles_fixed: number
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
// Late-night hours (1-4) now have low weights for realistic NYC night-owl activity

const HOURLY_WEIGHTS: Record<number, number> = {
  0: 2, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1,
  6: 3, 7: 5, 8: 6,
  9: 5, 10: 4, 11: 5,
  12: 8, 13: 10, 14: 8,
  15: 5, 16: 4, 17: 5,
  18: 8, 19: 10, 20: 9,
  21: 7, 22: 4, 23: 3,
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

// ─── Daily target — 20-50 Porch actions/day ───

function getDailyTarget(growthMultiplier: number): number {
  const day = new Date().getDay()
  const isWeekend = day === 0 || day === 6

  // Base: 20-35 weekday, 30-50 weekend (before growth multiplier)
  const min = isWeekend ? 30 : 20
  const max = isWeekend ? 50 : 35
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

// ─── DiceBear Avatars ───

const AVATAR_STYLES = ['avataaars', 'personas', 'adventurer', 'big-ears', 'lorelei', 'notionists', 'open-peeps', 'thumbs']

function makeAvatar(name: string, id: number): string {
  const style = AVATAR_STYLES[id % AVATAR_STYLES.length]
  const seed = encodeURIComponent(name + id)
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&size=200`
}

// ─── Fix seed user profiles (pics + verified) ───

async function fixSeedProfiles(db: SupabaseClient): Promise<number> {
  const { data: incomplete } = await db
    .from('users')
    .select('id, name, selfie_url, verified')
    .like('email', '%@example.com')
    .or('selfie_url.is.null,verified.eq.false')
    .limit(500)

  if (!incomplete || incomplete.length === 0) return 0

  let fixed = 0
  for (const u of incomplete) {
    const updates: Record<string, unknown> = {}
    if (!u.selfie_url) updates.selfie_url = makeAvatar(u.name || 'User', u.id)
    if (!u.verified) updates.verified = true
    if (Object.keys(updates).length > 0) {
      await db.from('users').update(updates).eq('id', u.id)
      fixed++
    }
  }
  return fixed
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

/** Round-robin post type selection — guarantees all 12 types before repeating */
function createTypeRotation() {
  let remaining: string[] = []
  return function nextType(): string {
    if (remaining.length === 0) {
      remaining = [...Object.keys(PORCH)].sort(() => Math.random() - 0.5)
    }
    return remaining.pop()!
  }
}

/** Borough coverage tracker — prioritizes under-represented boroughs */
function createBoroughTracker() {
  const boroughKeys = Object.keys(BOROUGHS)
  const counts: Record<string, number> = {}
  for (const b of boroughKeys) counts[b] = 0

  return {
    pick(candidates: SeedUser[]): SeedUser {
      // Find the borough with lowest count among candidates
      const candidateBoroughs = [...new Set(candidates.map(u => u._borough))]
      const minCount = Math.min(...candidateBoroughs.map(b => counts[b] || 0))
      const underRep = candidateBoroughs.filter(b => (counts[b] || 0) === minCount)
      const targetBorough = pick(underRep)

      const boroughCandidates = candidates.filter(u => u._borough === targetBorough)
      const chosen = boroughCandidates.length > 0 ? pick(boroughCandidates) : pick(candidates)
      counts[chosen._borough] = (counts[chosen._borough] || 0) + 1
      return chosen
    },
  }
}

function generatePorchPost(user: SeedUser, created_at: string, postType: string) {
  const tmpl = pick(PORCH[postType])
  const vars = generateTemplateVars(user)
  const tone = getToneProfile(user.id)

  const title = applyTone(fill(tmpl.t, vars).slice(0, 100), tone)
  const body = applyTone(fill(tmpl.b, vars).slice(0, 500), tone)

  // Only ~10% of lost-and-found/pet-sighting get pinned — keeps feed natural
  const pinned = (postType === 'lost-and-found' || postType === 'pet-sighting') && Math.random() < 0.10
  const expH = postType === 'alert' ? 48 : (postType === 'lost-and-found' || postType === 'pet-sighting') ? 72 : 720

  return {
    user_id: user.id,
    post_type: postType,
    title,
    body,
    borough_slug: user._borough,
    neighborhood_slug: user._nh,
    pinned,
    expires_at: new Date(new Date(created_at).getTime() + expH * 3600000).toISOString(),
    created_at,
  }
}

/** Pick a reply from short (30%), medium (50%), or long (20%) pool */
function generateReply(user: SeedUser) {
  const roll = Math.random()
  let body: string
  if (roll < 0.30) {
    body = pick(REPLIES_SHORT)
  } else if (roll < 0.80) {
    body = pick(REPLIES_MEDIUM)
  } else {
    body = pick(REPLIES_LONG)
  }
  body = body.replace('{first}', user.name.split(' ')[0] || 'Friend')
  return applyTone(body, getToneProfile(user.id))
}

// ─── Main Engine ───

export async function runSeedCron(db: SupabaseClient): Promise<RunResult> {
  // Fix seed user profiles first (pics + verified)
  const profilesFixed = await fixSeedProfiles(db)

  const state = await getState(db)

  if (!state.enabled) {
    return {
      posts_created: 0, replies_created: 0, profiles_fixed: profilesFixed,
      skipped_moderation: 0, kill_switch_level: 'disabled', growth_multiplier: 1,
      daily_total: state.posts_today, enabled: false,
    }
  }

  // Prevent double-run on same day
  const today = getETDate()
  if (state.date === today && state.posts_today > 0) {
    return {
      posts_created: 0, replies_created: 0, profiles_fixed: profilesFixed,
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
      posts_created: 0, replies_created: 0, profiles_fixed: profilesFixed,
      skipped_moderation: 0, kill_switch_level: killSwitch.level, growth_multiplier: 1,
      daily_total: 0, enabled: true,
    }
  }

  // Get seed users
  const seedUsers = await getSeedUsers(db)
  if (seedUsers.length === 0) {
    return {
      posts_created: 0, replies_created: 0, profiles_fixed: profilesFixed,
      skipped_moderation: 0, kill_switch_level: 'no seed users', growth_multiplier: 1,
      daily_total: 0, enabled: true,
    }
  }

  // Daily target: 20-50 Porch actions, scaled by growth + kill switch
  const growthMult = getGrowthMultiplier(state.start_date)
  const rawTarget = getDailyTarget(growthMult)
  const totalTarget = Math.round(rawTarget * killSwitch.multiplier)

  // Split: ~60% porch posts, ~40% replies
  const porchTarget = Math.round(totalTarget * 0.60)
  const replyTarget = totalTarget - porchTarget

  let postsCreated = 0
  let repliesCreated = 0
  let skippedModeration = 0

  // Round-robin type selection + borough coverage
  const nextType = createTypeRotation()
  const boroughTracker = createBoroughTracker()

  // Track titles to avoid duplicates within same day
  const usedTitles = new Set<string>()

  // Select users (max 3 per user per day to spread across many users)
  function selectUser(): SeedUser | null {
    const candidates = seedUsers.filter(u => {
      const dailyCount = state.posts_by_user[String(u.id)] || 0
      return dailyCount < 3
    })
    if (candidates.length === 0) return null
    return boroughTracker.pick(candidates)
  }

  // Create porch posts with staggered timestamps
  for (let i = 0; i < porchTarget; i++) {
    const user = selectUser()
    if (!user) break

    const ts = staggeredTimestamp()
    const postType = nextType()

    // Try up to 3 times to avoid duplicate titles
    let post = generatePorchPost(user, ts, postType)
    let attempts = 0
    while (usedTitles.has(post.title.toLowerCase()) && attempts < 3) {
      post = generatePorchPost(user, ts, postType)
      attempts++
    }
    if (usedTitles.has(post.title.toLowerCase())) continue
    usedTitles.add(post.title.toLowerCase())

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

  // Save state
  await saveState(db, state)

  return {
    posts_created: postsCreated,
    replies_created: repliesCreated,
    profiles_fixed: profilesFixed,
    skipped_moderation: skippedModeration,
    kill_switch_level: killSwitch.level,
    growth_multiplier: growthMult,
    daily_total: state.posts_today + state.replies_today,
    enabled: true,
  }
}
