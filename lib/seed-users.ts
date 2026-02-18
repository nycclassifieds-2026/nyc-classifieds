/**
 * Daily seed user creation — generates 5-15 new @example.com users per day.
 * Varied demographics, DiceBear avatars, consistent neighborhoods.
 * Mix of personal + business accounts.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import {
  pick, rb, BOROUGHS, BOROUGH_WEIGHTS, NAMES, DEMO_WEIGHTS,
} from './seed-templates'
import { businessCategories } from './data'

// ─── DiceBear avatar styles ───

const AVATAR_STYLES = [
  'avataaars', 'personas', 'adventurer', 'big-ears',
  'lorelei', 'notionists', 'open-peeps', 'thumbs',
  'bottts', 'fun-emoji', 'micah', 'miniavs',
]

function makeAvatar(name: string, id: number): string {
  const style = pick(AVATAR_STYLES)
  const seed = encodeURIComponent(name + '-' + id + '-' + Date.now())
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&size=200`
}

// ─── Generate a unique seed email ───

function generateEmail(first: string, last: string): string {
  const num = rb(100, 9999)
  return `${first.toLowerCase()}.${last.toLowerCase()}${num}@example.com`
}

// ─── Create daily seed users ───

export async function createDailySeedUsers(db: SupabaseClient): Promise<number> {
  const target = rb(5, 15)
  let created = 0

  for (let i = 0; i < target; i++) {
    const demo = pick(DEMO_WEIGHTS)
    const namePool = NAMES[demo]
    if (!namePool) continue

    const first = pick(namePool.first)
    const last = pick(namePool.last)
    const name = `${first} ${last}`
    const email = generateEmail(first, last)

    const borough = pick(BOROUGH_WEIGHTS)
    const nh = pick(BOROUGHS[borough].nhs)
    const b = BOROUGHS[borough]

    // Jitter coordinates
    const lat = b.lat + (Math.random() - 0.5) * 0.02
    const lng = b.lng + (Math.random() - 0.5) * 0.02

    // ~15% business accounts
    const isBusiness = Math.random() < 0.15
    const accountType = isBusiness ? 'business' : 'personal'

    const userData: Record<string, unknown> = {
      email,
      name,
      pin: '$2b$10$placeholder', // hashed placeholder — seed users auth via email
      address: `${rb(1, 999)} ${pick(['1st Ave', '2nd Ave', 'Broadway', 'Main St', 'Park Ave'])}, New York, NY`,
      lat,
      lng,
      selfie_url: makeAvatar(name, rb(1, 100000)),
      selfie_geolat: lat,
      selfie_geolon: lng,
      verified: true,
      account_type: accountType,
    }

    if (isBusiness) {
      const bizName = `${last}'s ${pick(['Shop', 'Studio', 'Services', 'Co', 'Solutions', 'Place', 'Kitchen', 'Works'])}`
      userData.business_name = bizName
      userData.business_slug = `${bizName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${nh}`
      userData.business_category = pick(businessCategories)
      userData.business_description = `Local ${(userData.business_category as string).toLowerCase()} serving ${nh.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} and surrounding neighborhoods.`
    }

    const { error } = await db.from('users').insert(userData)
    if (!error) created++
  }

  return created
}
