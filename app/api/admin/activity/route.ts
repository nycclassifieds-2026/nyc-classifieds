import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, 'moderator')
  if (auth instanceof NextResponse) return auth

  const db = getSupabaseAdmin()
  const since = new URL(request.url).searchParams.get('since') || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const [users, listings, porchPosts, signupFails, flags] = await Promise.all([
    // New signups
    db.from('users')
      .select('id, name, email, account_type, created_at')
      .gte('created_at', since)
      .not('email', 'like', '%@example.com')
      .order('created_at', { ascending: false })
      .limit(50),
    // New listings
    db.from('listings')
      .select('id, title, category_slug, created_at, user_id')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(50),
    // New porch posts
    db.from('porch_posts')
      .select('id, title, post_type, borough_slug, created_at, user_id')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(50),
    // Failed signups
    db.from('signup_events')
      .select('step, error, created_at, session_id')
      .eq('status', 'failed')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(50),
    // New flags
    db.from('flagged_content')
      .select('id, content_type, reason, created_at')
      .eq('status', 'pending')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  // Filter out seed user posts
  const { data: seedUsers } = await db.from('users').select('id').like('email', '%@example.com')
  const seedIds = new Set((seedUsers || []).map(u => u.id))

  const realListings = (listings.data || []).filter(l => !seedIds.has(l.user_id))
  const realPorch = (porchPosts.data || []).filter(p => !seedIds.has(p.user_id))

  // Build activity feed
  type Activity = { type: string; message: string; detail?: string; time: string }
  const items: Activity[] = []

  for (const u of users.data || []) {
    items.push({
      type: 'signup',
      message: `New ${u.account_type || 'personal'} signup: ${u.name || u.email}`,
      time: u.created_at,
    })
  }

  for (const l of realListings) {
    items.push({
      type: 'listing',
      message: `New listing: ${l.title}`,
      detail: l.category_slug,
      time: l.created_at,
    })
  }

  for (const p of realPorch) {
    items.push({
      type: 'post',
      message: `New porch post: ${p.title}`,
      detail: `${p.post_type} in ${p.borough_slug}`,
      time: p.created_at,
    })
  }

  for (const f of signupFails.data || []) {
    items.push({
      type: 'signup_fail',
      message: `Signup failed at ${f.step}`,
      detail: f.error || undefined,
      time: f.created_at,
    })
  }

  for (const f of flags.data || []) {
    items.push({
      type: 'flag',
      message: `New flag: ${f.content_type}`,
      detail: f.reason,
      time: f.created_at,
    })
  }

  // Sort by time descending
  items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

  return NextResponse.json({
    items: items.slice(0, 50),
    counts: {
      signups: (users.data || []).length,
      listings: realListings.length,
      posts: realPorch.length,
      signup_fails: (signupFails.data || []).length,
      flags: (flags.data || []).length,
    },
  })
}
