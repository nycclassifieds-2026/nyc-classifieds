import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { verifyEmailToken, hashPin } from '@/lib/auth-utils'
import { haversineDistance } from '@/lib/geocode'
import { sendEmail } from '@/lib/email'
import { verificationSuccessEmail, welcomeEmail, adminNewSignupEmail } from '@/lib/email-templates'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const COOKIE_NAME = 'nyc_classifieds_user'
const isProd = process.env.NODE_ENV === 'production'
const MAX_DISTANCE_MILES = 0.1
const ADMIN_EMAILS = ['jefftuckernyc@gmail.com']

/**
 * Complete signup — creates user, uploads selfie, verifies location.
 * Nothing is stored until this endpoint succeeds.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  if (!rateLimit(`signup:${ip}`, 5, 300_000)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
  }

  const formData = await request.formData()

  // ── Auth ──
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const emailToken = formData.get('emailToken') as string
  if (!email || !emailToken || !verifyEmailToken(email, emailToken)) {
    return NextResponse.json({ error: 'Email verification expired. Please start over.' }, { status: 401 })
  }

  // ── User data ──
  const name = (formData.get('name') as string)?.trim()
  const pin = formData.get('pin') as string
  const accountType = (formData.get('accountType') as string) || 'personal'
  const address = (formData.get('address') as string)?.trim()
  const addressLat = parseFloat(formData.get('addressLat') as string)
  const addressLng = parseFloat(formData.get('addressLng') as string)

  if (!name || !pin || !address || isNaN(addressLat) || isNaN(addressLng)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (!/^\d{4,10}$/.test(pin)) {
    return NextResponse.json({ error: 'PIN must be 4-10 digits' }, { status: 400 })
  }
  if (addressLat < 40.4 || addressLat > 41.0 || addressLng < -74.3 || addressLng > -73.6) {
    return NextResponse.json({ error: 'Address must be in New York City' }, { status: 400 })
  }

  // ── Selfie + geo ──
  const selfie = formData.get('selfie') as File | null
  const geoLat = parseFloat(formData.get('geoLat') as string)
  const geoLon = parseFloat(formData.get('geoLon') as string)

  if (!selfie || isNaN(geoLat) || isNaN(geoLon)) {
    return NextResponse.json({ error: 'Selfie and location required' }, { status: 400 })
  }

  // ── Verify distance ──
  const distance = haversineDistance(addressLat, addressLng, geoLat, geoLon)
  if (distance > MAX_DISTANCE_MILES) {
    return NextResponse.json({
      error: `Location mismatch. You appear to be ${(distance * 5280).toFixed(0)} feet from your address. You must be at your address to verify.`,
      distance,
    }, { status: 400 })
  }

  // ── Business data (optional) ──
  const businessName = (formData.get('businessName') as string)?.trim() || null
  const businessCategory = (formData.get('businessCategory') as string)?.trim() || null
  const website = (formData.get('website') as string)?.trim() || null
  const phone = (formData.get('phone') as string)?.trim() || null
  const businessDesc = (formData.get('businessDesc') as string)?.trim() || null
  const hoursRaw = formData.get('hours') as string | null
  const serviceAreaRaw = formData.get('serviceArea') as string | null
  const hours = hoursRaw ? JSON.parse(hoursRaw) : null
  const serviceArea = serviceAreaRaw ? JSON.parse(serviceAreaRaw) : []

  const db = getSupabaseAdmin()

  // ── Check for existing complete account ──
  const { data: existing } = await db.from('users').select('id, pin, verified').eq('email', email).single()
  if (existing?.pin && existing?.verified) {
    return NextResponse.json({ error: 'Account already exists. Please log in.' }, { status: 409 })
  }

  // ── Create or update user (upsert handles retry after failed attempt) ──
  const userData: Record<string, unknown> = {
    email,
    name,
    pin: hashPin(pin),
    address,
    lat: addressLat,
    lng: addressLng,
    selfie_geolat: geoLat,
    selfie_geolon: geoLon,
    verified: true,
    role: ADMIN_EMAILS.includes(email) ? 'admin' : 'user',
    updated_at: new Date().toISOString(),
  }

  // Add business fields if business account
  if (accountType === 'business' && businessName) {
    userData.account_type = 'business'
    userData.business_name = businessName
    userData.business_category = businessCategory
    userData.website = website
    userData.phone = phone
    userData.business_description = businessDesc
    userData.hours = hours
    userData.service_area = serviceArea
  } else {
    userData.account_type = 'personal'
  }

  let userId: number
  if (existing) {
    // Update incomplete account
    await db.from('users').update(userData).eq('id', existing.id)
    userId = existing.id
  } else {
    const { data: newUser, error: insertErr } = await db
      .from('users')
      .insert(userData)
      .select('id')
      .single()
    if (insertErr || !newUser) {
      return NextResponse.json({ error: 'Account creation failed' }, { status: 500 })
    }
    userId = newUser.id
  }

  // ── Upload selfie ──
  const ext = selfie.name?.split('.').pop() || 'jpg'
  const filename = `${userId}_${Date.now()}.${ext}`
  const buffer = Buffer.from(await selfie.arrayBuffer())

  const { error: uploadError } = await db.storage
    .from('selfies')
    .upload(filename, buffer, { contentType: selfie.type, upsert: true })

  if (uploadError) {
    // Rollback: delete the user we just created
    if (!existing) await db.from('users').delete().eq('id', userId)
    return NextResponse.json({ error: 'Photo upload failed. Please try again.' }, { status: 500 })
  }

  const { data: urlData } = db.storage.from('selfies').getPublicUrl(filename)
  await db.from('users').update({ selfie_url: urlData.publicUrl }).eq('id', userId)

  // ── Business slug ──
  if (accountType === 'business' && businessName) {
    const neighborhood = address.split(',')[0]?.trim() || ''
    const baseSlug = `${businessName}-${neighborhood}`
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    let slug = baseSlug
    let counter = 0
    while (true) {
      const { data: dup } = await db.from('users').select('id').eq('business_slug', slug).neq('id', userId).single()
      if (!dup) break
      counter++
      slug = `${baseSlug}-${counter}`
    }
    await db.from('users').update({ business_slug: slug }).eq('id', userId)
  }

  // ── Audit log ──
  await db.from('audit_log').insert({
    actor: String(userId),
    action: 'complete_signup',
    entity: 'user',
    entity_id: userId,
    details: { distance: distance.toFixed(3), lat: geoLat, lon: geoLon, accountType },
  })

  // ── Set cookie ──
  const res = NextResponse.json({ verified: true, userId })
  res.cookies.set(COOKIE_NAME, String(userId), {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  })

  // ── Send emails (async, don't block response) ──
  const nh = address.split(',')[0]?.trim() || ''
  Promise.all([
    sendEmail(email, verificationSuccessEmail(name, nh)),
    sendEmail(email, welcomeEmail(name, nh)),
  ]).catch(err => console.error('Signup email error:', err))

  // Notify admins
  Promise.resolve(db.from('users').select('email').in('role', ['admin']).eq('banned', false)).then(({ data: admins }) => {
    if (admins) {
      for (const admin of admins) {
        if (admin.email && !admin.email.endsWith('@example.com')) {
          sendEmail(admin.email, adminNewSignupEmail(name, email, nh, accountType)).catch(() => {})
        }
      }
    }
  }).catch(() => {})

  return res
}
