/**
 * Cron seed engine — generates Porch content incrementally throughout the day.
 *
 * Called every 2 hours by Vercel cron (12x/day).
 * Each run creates a fraction of the daily target (~1/12 per run).
 * 30 distinct tone profiles. Systematic neighborhood coverage.
 * Generates 80-200 Porch actions/day (posts + replies).
 */

import { SupabaseClient } from '@supabase/supabase-js'
import {
  pick, rb, nhName, fill, filterSeasonal, varyText,
  BOROUGHS, BOROUGH_WEIGHTS, NAMES, DEMO_WEIGHTS,
  STREETS, PLACES, CITIES, HOBBIES, MOVIES, BOOKS, TRAINS,
  PORCH, getRepliesForType,
} from './seed-templates'
import { moderateFields } from './porch-moderation'

// ─── Types ───

interface CronState {
  id: number
  date: string
  posts_today: number
  replies_today: number
  last_post_at: string | null
  posts_by_user: Record<string, number>
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

// ─── 30 Tone Profiles ───
// Each user gets a consistent personality based on their ID

type ToneProfile =
  | 'gen_z_chill' | 'gen_z_hype' | 'gen_z_dry'
  | 'millennial_earnest' | 'millennial_ironic' | 'millennial_anxious'
  | 'boomer_formal' | 'boomer_warm' | 'boomer_grumpy'
  | 'texter_fast' | 'texter_emoji' | 'texter_minimal'
  | 'professional_polished' | 'professional_casual'
  | 'storyteller_long' | 'storyteller_nostalgic'
  | 'straight_shooter' | 'hype_beast'
  | 'chill_surfer' | 'chill_stoner'
  | 'parent_tired' | 'parent_proud'
  | 'old_school_nyc' | 'old_school_brooklyn'
  | 'poet_lyrical' | 'poet_haiku'
  | 'immigrant_grateful' | 'transplant_excited'
  | 'activist_passionate' | 'local_historian'

const TONES: ToneProfile[] = [
  'gen_z_chill', 'gen_z_hype', 'gen_z_dry',
  'millennial_earnest', 'millennial_ironic', 'millennial_anxious',
  'boomer_formal', 'boomer_warm', 'boomer_grumpy',
  'texter_fast', 'texter_emoji', 'texter_minimal',
  'professional_polished', 'professional_casual',
  'storyteller_long', 'storyteller_nostalgic',
  'straight_shooter', 'hype_beast',
  'chill_surfer', 'chill_stoner',
  'parent_tired', 'parent_proud',
  'old_school_nyc', 'old_school_brooklyn',
  'poet_lyrical', 'poet_haiku',
  'immigrant_grateful', 'transplant_excited',
  'activist_passionate', 'local_historian',
]

function getToneProfile(userId: number): ToneProfile {
  return TONES[userId % TONES.length]
}

/**
 * Apply subtle tone to BODY text only.
 * Titles are never transformed — they stay clean and readable.
 * Most tones are light touches: a trailing phrase, slight punctuation shift.
 * Templates already have built-in voice variety, so tone is seasoning, not a rewrite.
 */
function applyTone(text: string, tone: ToneProfile): string {
  // 40% chance of no transformation at all — keeps variety natural
  if (Math.random() < 0.40) return text

  switch (tone) {
    case 'gen_z_chill':
    case 'gen_z_dry':
      // Subtle: just drop trailing period sometimes
      return Math.random() < 0.5 ? text.replace(/\.$/,'') : text
    case 'gen_z_hype':
      // Occasional emphasis on last sentence only
      return Math.random() < 0.5 ? text.replace(/\.$/,' fr') : text
    case 'millennial_earnest':
      return text.replace(/\.$/, Math.random() < 0.5 ? ' tbh.' : ' honestly.')
    case 'millennial_ironic':
      return text.replace(/\.$/, Math.random() < 0.5 ? ' lol' : ' but yeah.')
    case 'millennial_anxious':
      return Math.random() < 0.4 ? text.replace(/\.$/, '...right?') : text
    case 'boomer_formal':
    case 'professional_polished':
      // Capitalize sentence starts, expand one contraction
      return text.replace(/(^|\. )([a-z])/g, (_, pre, c) => pre + c.toUpperCase())
    case 'boomer_warm':
      return text // Templates already have warm tone built in
    case 'boomer_grumpy':
      return Math.random() < 0.3 ? text.replace(/\.$/, '. Just saying.') : text
    case 'texter_fast':
    case 'texter_minimal':
      // Just drop trailing punctuation — don't butcher the whole text
      return text.replace(/\.$/,'')
    case 'texter_emoji':
      return text // No-op, templates already vary
    case 'professional_casual':
      return text.replace(/(^|\. )([a-z])/g, (_, pre, c) => pre + c.toUpperCase())
    case 'storyteller_long':
    case 'storyteller_nostalgic':
    case 'parent_proud':
      return text // These tones are already in the template voice
    case 'straight_shooter':
      return text.replace(/!+$/,'.')
    case 'hype_beast':
      return Math.random() < 0.3 ? text.replace(/\.$/,'!!') : text
    case 'chill_surfer':
    case 'chill_stoner':
      return text // No-op — the surfer/stoner regex was destroying content
    case 'parent_tired':
      return Math.random() < 0.3 ? text.replace(/\.$/, '. If I can stay awake lol.') : text
    case 'old_school_nyc':
      return Math.random() < 0.3 ? text.replace(/\.$/, '. You know how it is.') : text
    case 'old_school_brooklyn':
      return text
    case 'poet_lyrical':
    case 'poet_haiku':
      return text // Never transform prose into pseudo-poetry
    case 'immigrant_grateful':
      return Math.random() < 0.2 ? text.replace(/\.$/, '. Love this city.') : text
    case 'transplant_excited':
      return Math.random() < 0.2 ? text.replace(/\.$/, '. Still getting used to everything here.') : text
    case 'activist_passionate':
      return Math.random() < 0.3 ? text.replace(/\.$/, '. Community matters.') : text
    case 'local_historian':
      return Math.random() < 0.3 ? text.replace(/\.$/, '. Seen a lot of changes around here.') : text
    default:
      return text
  }
}

// ─── Hourly weights for staggering timestamps ───

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

// ─── Growth multiplier ───

function getGrowthMultiplier(startDate: string): number {
  const start = new Date(startDate)
  const now = new Date()
  const daysSinceLaunch = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000))
  return Math.min(1.0 + (daysSinceLaunch * 0.015), 3.0)
}

// ─── Daily target — 80-200 Porch actions/day ───

function getDailyTarget(growthMultiplier: number): number {
  const day = new Date().getDay()
  const isWeekend = day === 0 || day === 6
  const min = isWeekend ? 120 : 80
  const max = isWeekend ? 200 : 140
  return Math.round(rb(min, max) * growthMultiplier)
}

// ─── ET Time ───

function getETDate(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
}

// ─── Kill Switch ───

async function computeKillSwitch(db: SupabaseClient): Promise<{ multiplier: number; level: string }> {
  const todayStart = getETDate() + 'T00:00:00'
  const { count } = await db
    .from('porch_posts')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', todayStart)
    .not('user_id', 'in', `(SELECT id FROM users WHERE email LIKE '%@example.com')`)

  const realPosts = count || 0
  if (realPosts >= 200) return { multiplier: 0, level: 'off (200+ real posts)' }
  if (realPosts >= 100) return { multiplier: 0.25, level: '25% (100+ real posts)' }
  if (realPosts >= 50) return { multiplier: 0.50, level: '50% (50+ real posts)' }
  return { multiplier: 1.0, level: 'full' }
}

// ─── State Management ───

async function getState(db: SupabaseClient): Promise<CronState> {
  const { data } = await db.from('cron_seed_state').select('*').eq('id', 1).single()
  if (data) return data as CronState

  const now = getETDate()
  const initial: CronState = {
    id: 1, date: now, posts_today: 0, replies_today: 0,
    last_post_at: null, posts_by_user: {}, start_date: now, enabled: true,
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

// ─── Fix seed user profiles ───

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

/** Round-robin type selection — guarantees all types before repeating */
function createTypeRotation() {
  let remaining: string[] = []
  return function nextType(): string {
    if (remaining.length === 0) {
      remaining = [...Object.keys(PORCH)].sort(() => Math.random() - 0.5)
    }
    return remaining.pop()!
  }
}

/** Neighborhood coverage tracker — cycles through ALL neighborhoods systematically */
function createNeighborhoodTracker() {
  // Build flat list of all borough:nh pairs
  const allNhs: { borough: string; nh: string }[] = []
  for (const [borough, data] of Object.entries(BOROUGHS)) {
    for (const nh of data.nhs) {
      allNhs.push({ borough, nh })
    }
  }

  let remaining = [...allNhs].sort(() => Math.random() - 0.5)

  return {
    next(): { borough: string; nh: string } {
      if (remaining.length === 0) {
        remaining = [...allNhs].sort(() => Math.random() - 0.5)
      }
      return remaining.pop()!
    },
  }
}

function generatePorchPost(user: SeedUser, created_at: string, postType: string, usedTemplates: Set<string>) {
  const allTemplates = PORCH[postType]
  if (!allTemplates) return null
  // Filter by current season before selecting
  const templates = filterSeasonal(allTemplates)
  const available = templates.filter(t => !usedTemplates.has(`${postType}:${t.t}`))
  if (available.length === 0) return null

  const tmpl = pick(available)
  usedTemplates.add(`${postType}:${tmpl.t}`)

  const vars = generateTemplateVars(user)
  const tone = getToneProfile(user.id)

  const title = fill(tmpl.t, vars).slice(0, 100) // Never transform titles
  const body = applyTone(varyText(fill(tmpl.b, vars)).slice(0, 500), tone)

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

function generateReply(user: SeedUser, postType?: string) {
  const pool = getRepliesForType(postType || '')
  const roll = Math.random()
  let body: string
  if (roll < 0.30) body = pick(pool.short)
  else if (roll < 0.80) body = pick(pool.medium)
  else body = pick(pool.long)
  body = body.replace('{first}', user.name.split(' ')[0] || 'Friend').replace('{street}', pick(STREETS))
  return applyTone(body, getToneProfile(user.id))
}

// ─── Main Engine — Incremental (runs every 2 hours) ───

export async function runSeedCron(db: SupabaseClient): Promise<RunResult> {
  const profilesFixed = await fixSeedProfiles(db)
  const state = await getState(db)

  if (!state.enabled) {
    return {
      posts_created: 0, replies_created: 0, profiles_fixed: profilesFixed,
      skipped_moderation: 0, kill_switch_level: 'disabled', growth_multiplier: 1,
      daily_total: state.posts_today, enabled: false,
    }
  }

  const today = getETDate()

  // Reset for new day, but DON'T block on "already ran today"
  if (state.date !== today) {
    state.date = today
    state.posts_today = 0
    state.replies_today = 0
    state.posts_by_user = {}
    state.last_post_at = null
  }

  // Kill switch
  const killSwitch = await computeKillSwitch(db)
  if (killSwitch.multiplier === 0) {
    await saveState(db, state)
    return {
      posts_created: 0, replies_created: 0, profiles_fixed: profilesFixed,
      skipped_moderation: 0, kill_switch_level: killSwitch.level, growth_multiplier: 1,
      daily_total: state.posts_today, enabled: true,
    }
  }

  const seedUsers = await getSeedUsers(db)
  if (seedUsers.length === 0) {
    return {
      posts_created: 0, replies_created: 0, profiles_fixed: profilesFixed,
      skipped_moderation: 0, kill_switch_level: 'no seed users', growth_multiplier: 1,
      daily_total: 0, enabled: true,
    }
  }

  // Calculate daily target and how many to create THIS run
  const growthMult = getGrowthMultiplier(state.start_date)
  const fullDayTarget = getDailyTarget(growthMult)
  const scaledTarget = Math.round(fullDayTarget * killSwitch.multiplier)

  // How many left to create today?
  const alreadyDone = state.posts_today + state.replies_today
  const remaining = Math.max(0, scaledTarget - alreadyDone)
  // Each run creates ~1/12 of daily target (runs every 2 hours, 12 runs/day)
  // But also catch up if behind schedule
  const etHour = parseInt(new Date().toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false }))
  const expectedFraction = Math.min(1.0, (etHour + 2) / 24)
  const expectedDone = Math.round(scaledTarget * expectedFraction)
  const runTarget = Math.max(Math.round(scaledTarget / 12), expectedDone - alreadyDone)
  const thisRunTarget = Math.min(runTarget, remaining)

  if (thisRunTarget <= 0) {
    return {
      posts_created: 0, replies_created: 0, profiles_fixed: profilesFixed,
      skipped_moderation: 0, kill_switch_level: 'daily target reached', growth_multiplier: growthMult,
      daily_total: alreadyDone, enabled: true,
    }
  }

  // Split: ~60% posts, ~40% replies
  const porchTarget = Math.round(thisRunTarget * 0.60)
  const replyTarget = thisRunTarget - porchTarget

  let postsCreated = 0
  let repliesCreated = 0
  let skippedModeration = 0

  const nextType = createTypeRotation()
  const nhTracker = createNeighborhoodTracker()
  const usedTitles = new Set<string>()
  const usedTemplates = new Set<string>()

  // Select users (max 5 per user per day)
  function selectUser(): SeedUser | null {
    const candidates = seedUsers.filter(u => {
      const dailyCount = state.posts_by_user[String(u.id)] || 0
      return dailyCount < 5
    })
    if (candidates.length === 0) return null

    // Assign user to next neighborhood in rotation
    const target = nhTracker.next()
    const nhCandidates = candidates.filter(u => u._borough === target.borough)
    if (nhCandidates.length > 0) {
      const user = pick(nhCandidates)
      user._nh = target.nh // Override to ensure coverage
      return user
    }
    // Fallback
    const user = pick(candidates)
    user._borough = target.borough
    user._nh = target.nh
    return user
  }

  // Create porch posts
  for (let i = 0; i < porchTarget; i++) {
    const user = selectUser()
    if (!user) break

    const ts = staggeredTimestamp()
    const postType = nextType()

    let post = generatePorchPost(user, ts, postType, usedTemplates)
    let attempts = 0
    while (post && usedTitles.has(post.title.toLowerCase()) && attempts < 3) {
      post = generatePorchPost(user, ts, postType, usedTemplates)
      attempts++
    }
    if (!post || usedTitles.has(post.title.toLowerCase())) continue
    usedTitles.add(post.title.toLowerCase())

    const modResult = moderateFields(post.title, post.body)
    if (modResult.blocked) { skippedModeration++; continue }

    const { error } = await db.from('porch_posts').insert(post)
    if (!error) {
      postsCreated++
      state.posts_today++
      state.posts_by_user[String(user.id)] = (state.posts_by_user[String(user.id)] || 0) + 1
      state.last_post_at = new Date().toISOString()
    }
  }

  // Create replies — context-aware based on post type
  if (replyTarget > 0) {
    const cutoff = new Date(Date.now() - 48 * 3600000).toISOString()
    const { data: recentPosts } = await db
      .from('porch_posts')
      .select('id, user_id, post_type')
      .gte('created_at', cutoff)
      .limit(200)

    if (recentPosts && recentPosts.length > 0) {
      for (let i = 0; i < replyTarget; i++) {
        const targetPost = pick(recentPosts)
        const replyUser = seedUsers.find(u => u.id !== targetPost.user_id) || pick(seedUsers)
        const replyBody = generateReply(replyUser, targetPost.post_type)

        const modResult = moderateFields(replyBody)
        if (modResult.blocked) { skippedModeration++; continue }

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
