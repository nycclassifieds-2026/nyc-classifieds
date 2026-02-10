import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { otpEmail } from '@/lib/email-templates'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { Resend } from 'resend'
import crypto from 'crypto'

let _resend: Resend | null = null
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY || '')
  return _resend
}
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
    .select('id, email, name, verified')
    .eq('id', userId)
    .single()

  if (!user) {
    const res = NextResponse.json({ authenticated: false })
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
    user: { id: user.id, email: user.email, name: user.name, verified: user.verified },
    unreadMessages: count || 0,
  })
}

// POST — signup/login/verify/set-pin
export async function POST(request: NextRequest) {
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

    // Mark old codes as used
    await db
      .from('user_verification_codes')
      .update({ used: true })
      .eq('email', email)
      .eq('used', false)

    // Insert new code
    await db.from('user_verification_codes').insert({
      email,
      code,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    })

    // Send email
    const template = otpEmail(code)
    await getResend().emails.send({
      from: 'NYC Classifieds <noreply@nycclassifieds.com>',
      to: email,
      subject: template.subject,
      html: template.html,
    })

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
      .select('id, pin, verified')
      .eq('email', email)
      .single()

    if (!user) {
      const { data: newUser } = await db
        .from('users')
        .insert({ email })
        .select('id, pin, verified')
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

    // New user — needs to set PIN
    return NextResponse.json({
      verified: true,
      hasPin: false,
      userId: user.id,
    })
  }

  if (action === 'set-pin') {
    const { userId, pin } = body
    if (!userId || !pin || !/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: 'Valid 4-digit PIN required' }, { status: 400 })
    }

    const db = getSupabaseAdmin()
    await db.from('users').update({ pin: hashPin(pin) }).eq('id', userId)

    const res = NextResponse.json({ pinSet: true })
    res.cookies.set(COOKIE_NAME, String(userId), {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })
    return res
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

  if (action === 'set-address') {
    const userId = request.cookies.get(COOKIE_NAME)?.value
    const { address, lat, lng } = body
    if (!userId || !address || lat == null || lng == null) {
      return NextResponse.json({ error: 'Address with coordinates required' }, { status: 400 })
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
      .select('id, pin, name, verified')
      .eq('email', email)
      .single()

    if (!user || !user.pin || user.pin !== hashPin(pin)) {
      return NextResponse.json({ error: 'Invalid email or PIN' }, { status: 401 })
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
}
