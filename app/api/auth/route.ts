import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { otpEmail, welcomeEmail, businessProfileLiveEmail } from '@/lib/email-templates'
import { sendEmail } from '@/lib/email'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import crypto from 'crypto'
const COOKIE_NAME = 'nyc_classifieds_user'
const isProd = process.env.NODE_ENV === 'production'

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin + (process.env.SUPABASE_SERVICE_KEY || '')).digest('hex')
}

// GET — check auth status
export async function GET(request: NextRequest) {
  const userId = request.cookies.get(COOKIE_NAME)?.value
  if (!userId) {
    return NextResponse.json({ authenticated: false })
  }

  const db = getSupabaseAdmin()
  const { data: user } = await db
    .from('users')
    .select('id, email, name, verified, role, banned, account_type, business_name, business_slug, business_category, website, phone, business_description, hours, service_area, photo_gallery, selfie_url')
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

  // Count unread messages
  const { count } = await db
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .eq('read', false)

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id, email: user.email, name: user.name, verified: user.verified, role: user.role,
      account_type: user.account_type, business_name: user.business_name, business_slug: user.business_slug,
      business_category: user.business_category, website: user.website, phone: user.phone,
      business_description: user.business_description, hours: user.hours, service_area: user.service_area,
      photo_gallery: user.photo_gallery, selfie_url: user.selfie_url,
    },
    unreadMessages: count || 0,
  })
}

// POST — signup/login/verify/set-pin
export async function POST(request: NextRequest) {
  try {
  const ip = getClientIp(request.headers)
  const body = await request.json()
  const { action } = body

  if (action === 'send-otp') {
    if (!rateLimit(`otp:${ip}`, 5, 300_000)) {
      return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
    }

    const email = body.email?.trim().toLowerCase()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
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

    // Create or get user
    let { data: user } = await db
      .from('users')
      .select('id, pin, verified, banned')
      .eq('email', email)
      .single()

    if (user?.banned) {
      return NextResponse.json({ error: 'Account is banned' }, { status: 403 })
    }

    if (!user) {
      const { data: newUser } = await db
        .from('users')
        .insert({ email })
        .select('id, pin, verified, banned')
        .single()
      user = newUser
    }

    if (!user) {
      return NextResponse.json({ error: 'Account creation failed' }, { status: 500 })
    }

    // If user already has PIN → they're logging in via OTP
    if (user.pin) {
      const res = NextResponse.json({
        verified: true,
        hasPin: true,
        isVerified: user.verified,
        userId: user.id,
      })
      res.cookies.set(COOKIE_NAME, String(user.id), {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      })
      return res
    }

    // New user — needs to set PIN. Set cookie now so subsequent steps work.
    const res = NextResponse.json({
      verified: true,
      hasPin: false,
      userId: user.id,
    })
    res.cookies.set(COOKIE_NAME, String(user.id), {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })
    return res
  }

  if (action === 'set-pin') {
    // C2 fix: Use cookie for auth instead of body userId
    const userId = request.cookies.get(COOKIE_NAME)?.value
    const { pin } = body
    if (!userId || !pin || !/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: 'Valid 4-digit PIN required' }, { status: 400 })
    }

    const db = getSupabaseAdmin()
    await db.from('users').update({ pin: hashPin(pin) }).eq('id', userId)

    return NextResponse.json({ pinSet: true })
  }

  if (action === 'set-name') {
    const userId = request.cookies.get(COOKIE_NAME)?.value
    const name = body.name?.trim()
    if (!userId || !name) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 })
    }

    const db = getSupabaseAdmin()
    await db.from('users').update({ name }).eq('id', userId)
    return NextResponse.json({ nameSet: true })
  }

  if (action === 'set-account-type') {
    const userId = request.cookies.get(COOKIE_NAME)?.value
    const accountType = body.account_type
    if (!userId || !['personal', 'business'].includes(accountType)) {
      return NextResponse.json({ error: 'Valid account type required' }, { status: 400 })
    }

    const db = getSupabaseAdmin()
    await db.from('users').update({ account_type: accountType }).eq('id', userId)

    return NextResponse.json({ accountTypeSet: true })
  }

  if (action === 'set-business') {
    const userId = request.cookies.get(COOKIE_NAME)?.value
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
      sendEmail(bizUser.email, businessProfileLiveEmail(bizUser.name || 'there', business_name.trim(), slug)).catch(() => {})
    }

    return NextResponse.json({ businessSet: true, slug })
  }

  if (action === 'set-address') {
    const userId = request.cookies.get(COOKIE_NAME)?.value
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
    if (!rateLimit(`login:${ip}`, 10, 300_000)) {
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
      .select('id, pin, name, verified, banned')
      .eq('email', email)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or PIN' }, { status: 401 })
    }

    if (!user.pin) {
      return NextResponse.json({ error: 'Account setup incomplete. Use the verification code option to log in and set your PIN.' }, { status: 401 })
    }

    if (user.pin !== hashPin(pin)) {
      return NextResponse.json({ error: 'Invalid email or PIN' }, { status: 401 })
    }

    if (user.banned) {
      return NextResponse.json({ error: 'Account is banned' }, { status: 403 })
    }

    const res = NextResponse.json({
      authenticated: true,
      user: { id: user.id, name: user.name, verified: user.verified },
    })
    res.cookies.set(COOKIE_NAME, String(user.id), {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
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
    console.error('Auth POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
