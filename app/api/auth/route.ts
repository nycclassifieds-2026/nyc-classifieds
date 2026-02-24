import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { otpEmail, welcomeEmail, businessProfileLiveEmail, adminLoginAlertEmail } from '@/lib/email-templates'
import { sendEmail } from '@/lib/email'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { signEmailToken, hashPin, verifyPin, signSession, verifySession } from '@/lib/auth-utils'
import { logEvent } from '@/lib/events'
import { notifyError } from '@/lib/errors'
const COOKIE_NAME = 'nyc_classifieds_user'
const isProd = process.env.NODE_ENV === 'production'


// GET — check auth status
export async function GET(request: NextRequest) {
  const userId = verifySession(request.cookies.get(COOKIE_NAME)?.value)
  if (!userId) {
    return NextResponse.json({ authenticated: false })
  }

  const db = getSupabaseAdmin()
  const { data: user } = await db
    .from('users')
    .select('id, email, name, verified, role, banned, account_type, business_name, business_slug, business_category, website, phone, business_description, hours, service_area, photo_gallery, selfie_url, business_photo, business_address, social_links, address')
    .eq('id', userId)
    .single()

  if (!user) {
    const res = NextResponse.json({ authenticated: false })
    res.cookies.delete(COOKIE_NAME)
    return res
  }

  if (user.banned) {
    const res = NextResponse.json({ authenticated: false, error: 'Account is banned' })
    res.cookies.delete(COOKIE_NAME)
    return res
  }

  // Count unread messages + notifications
  const [{ count: msgCount }, { count: notifCount }] = await Promise.all([
    db.from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('read', false),
    db.from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false),
  ])

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id, email: user.email, name: user.name, verified: user.verified, role: user.role,
      account_type: user.account_type, business_name: user.business_name, business_slug: user.business_slug,
      business_category: user.business_category, website: user.website, phone: user.phone,
      business_description: user.business_description, hours: user.hours, service_area: user.service_area,
      photo_gallery: user.photo_gallery, selfie_url: user.selfie_url, business_photo: user.business_photo, address: user.address,
    },
    unreadMessages: msgCount || 0,
    unreadNotifications: notifCount || 0,
  })
}

// POST — signup/login/verify/set-pin
export async function POST(request: NextRequest) {
  try {
  const ip = getClientIp(request.headers)
  const body = await request.json()
  const { action } = body

  if (action === 'send-otp') {
    if (!await rateLimit(`otp:${ip}`, 5, 300_000)) {
      return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
    }

    const email = body.email?.trim().toLowerCase()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    // Per-email OTP rate limit
    if (!await rateLimit(`otp-email:${email}`, 3, 600_000)) {
      return NextResponse.json({ error: 'Too many codes sent to this email. Try again later.' }, { status: 429 })
    }

    const code = String(Math.floor(100000 + Math.random() * 900000))
    const db = getSupabaseAdmin()

    // Insert new code (old codes stay valid until they expire naturally)
    await db.from('user_verification_codes').insert({
      email,
      code,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    })

    // Send email via shared helper
    await sendEmail(email, otpEmail(code))

    logEvent('otp_requested', { email })

    return NextResponse.json({ sent: true })
  }

  if (action === 'verify-otp') {
    const email = body.email?.trim().toLowerCase()
    const code = body.code?.trim()

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code required' }, { status: 400 })
    }

    const db = getSupabaseAdmin()
    const { data: record } = await db
      .from('user_verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!record) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
    }

    // Mark used
    await db.from('user_verification_codes').update({ used: true }).eq('id', record.id)

    // Check if user already exists
    const { data: user } = await db
      .from('users')
      .select('id, pin, verified, banned, role, name')
      .eq('email', email)
      .single()

    if (user?.banned) {
      return NextResponse.json({ error: 'Account is banned' }, { status: 403 })
    }

    // Existing user with PIN → log them in
    if (user?.pin) {
      logEvent('otp_verified', { email, existing_user: true }, { userId: user.id })

      // Alert admins when admin/mod logs in via OTP
      if (user.role === 'admin' || user.role === 'moderator') {
        ;(async () => {
          try {
            const db2 = getSupabaseAdmin()
            const { data: admins } = await db2.from('users').select('email').eq('role', 'admin').eq('banned', false).not('email', 'like', '%@example.com')
            if (admins) {
              const template = adminLoginAlertEmail(user.name || email, email, new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }))
              for (const a of admins) {
                if (a.email) sendEmail(a.email, template).catch(() => {})
              }
            }
          } catch {}
        })()
      }

      const res = NextResponse.json({
        verified: true,
        hasPin: true,
        isVerified: user.verified,
        userId: user.id,
      })
      res.cookies.set(COOKIE_NAME, signSession(String(user.id)), {
        httpOnly: true,
        secure: isProd,
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      })
      return res
    }

    // New or incomplete user → return email token, don't create user yet
    // Everything gets created at once in /api/auth/complete-signup
    logEvent('otp_verified', { email, existing_user: false })

    return NextResponse.json({
      verified: true,
      hasPin: false,
      emailToken: signEmailToken(email),
    })
  }

  if (action === 'set-pin') {
    // C2 fix: Use cookie for auth instead of body userId
    const userId = verifySession(request.cookies.get(COOKIE_NAME)?.value)
    const { pin } = body
    if (!userId || !pin || !/^\d{4,10}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN must be 4–10 digits' }, { status: 400 })
    }

    const db = getSupabaseAdmin()
    await db.from('users').update({ pin: hashPin(pin) }).eq('id', userId)

    return NextResponse.json({ pinSet: true })
  }

  if (action === 'set-name') {
    const userId = verifySession(request.cookies.get(COOKIE_NAME)?.value)
    const name = body.name?.trim()
    if (!userId || !name) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 })
    }

    const db = getSupabaseAdmin()
    await db.from('users').update({ name }).eq('id', userId)
    return NextResponse.json({ nameSet: true })
  }

  if (action === 'set-account-type') {
    const userId = verifySession(request.cookies.get(COOKIE_NAME)?.value)
    const accountType = body.account_type
    if (!userId || !['personal', 'business'].includes(accountType)) {
      return NextResponse.json({ error: 'Valid account type required' }, { status: 400 })
    }

    const db = getSupabaseAdmin()
    await db.from('users').update({ account_type: accountType }).eq('id', userId)

    return NextResponse.json({ accountTypeSet: true })
  }

  if (action === 'set-business') {
    const userId = verifySession(request.cookies.get(COOKIE_NAME)?.value)
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { business_name, business_category, website, phone, business_description, hours, service_area } = body
    if (!business_name?.trim()) {
      return NextResponse.json({ error: 'Business name required' }, { status: 400 })
    }

    const db = getSupabaseAdmin()

    // Get user's neighborhood for slug
    const { data: usr } = await db.from('users').select('address').eq('id', userId).single()
    const neighborhood = usr?.address?.split(',')[0]?.trim() || ''

    // Generate unique slug: joes-plumbing-east-village
    const baseSlug = `${business_name.trim()}-${neighborhood}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check for collisions
    let slug = baseSlug
    let counter = 0
    while (true) {
      const { data: existing } = await db
        .from('users')
        .select('id')
        .eq('business_slug', slug)
        .neq('id', userId)
        .single()
      if (!existing) break
      counter++
      slug = `${baseSlug}-${counter}`
    }

    await db.from('users').update({
      business_name: business_name.trim(),
      business_slug: slug,
      business_category: business_category?.trim() || null,
      website: website?.trim() || null,
      phone: phone?.trim() || null,
      business_description: business_description?.trim() || null,
      hours: hours || null,
      service_area: service_area || [],
    }).eq('id', userId)
    // Send business profile live email (async)
    const { data: bizUser } = await db.from('users').select('email, name').eq('id', userId).single()
    if (bizUser?.email && !bizUser.email.endsWith('@example.com')) {
      sendEmail(bizUser.email, businessProfileLiveEmail(bizUser.name || 'there', business_name.trim(), slug, business_category?.trim() || null)).catch(() => {})
    }

    return NextResponse.json({ businessSet: true, slug })
  }

  if (action === 'set-address') {
    const userId = verifySession(request.cookies.get(COOKIE_NAME)?.value)
    const { address, lat, lng } = body
    if (!userId || !address || lat == null || lng == null) {
      return NextResponse.json({ error: 'Address with coordinates required' }, { status: 400 })
    }

    // Validate coordinates are within NYC metro area
    if (lat < 40.4 || lat > 41.0 || lng < -74.3 || lng > -73.6) {
      return NextResponse.json({ error: 'Address must be in the New York City area' }, { status: 400 })
    }

    const db = getSupabaseAdmin()
    await db.from('users').update({ address, lat, lng }).eq('id', userId)
    return NextResponse.json({ addressSet: true })
  }

  if (action === 'login') {
    if (!await rateLimit(`login:${ip}`, 10, 300_000)) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
    }

    const email = body.email?.trim().toLowerCase()
    const pin = body.pin
    if (!email || !pin) {
      return NextResponse.json({ error: 'Email and PIN required' }, { status: 400 })
    }

    const db = getSupabaseAdmin()
    const { data: user } = await db
      .from('users')
      .select('id, pin, name, verified, banned, role')
      .eq('email', email)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or PIN' }, { status: 401 })
    }

    if (!user.pin) {
      return NextResponse.json({ error: 'Invalid email or PIN' }, { status: 401 })
    }

    if (!verifyPin(pin, user.pin)) {
      return NextResponse.json({ error: 'Invalid email or PIN' }, { status: 401 })
    }

    if (user.banned) {
      return NextResponse.json({ error: 'Account is banned' }, { status: 403 })
    }

    logEvent('login', { email, name: user.name }, {
      userId: user.id,
      notify: true,
      notifyTitle: 'User login',
      notifyBody: `${user.name || email} logged in`,
    })

    // Alert admins when admin/mod logs in via PIN
    if (user.role === 'admin' || user.role === 'moderator') {
      ;(async () => {
        try {
          const { data: admins } = await db.from('users').select('email').eq('role', 'admin').eq('banned', false).not('email', 'like', '%@example.com')
          if (admins) {
            const template = adminLoginAlertEmail(user.name || email, email, new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }))
            for (const a of admins) {
              if (a.email) sendEmail(a.email, template).catch(() => {})
            }
          }
        } catch {}
      })()
    }

    const res = NextResponse.json({
      authenticated: true,
      user: { id: user.id, name: user.name, verified: user.verified },
    })
    res.cookies.set(COOKIE_NAME, signSession(String(user.id)), {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })
    return res
  }

  if (action === 'logout') {
    const res = NextResponse.json({ loggedOut: true })
    res.cookies.delete(COOKIE_NAME)
    return res
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    notifyError('Auth system', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
