import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { verifySession } from '@/lib/auth-utils'
import { haversineDistance } from '@/lib/geocode'
import { sendEmail } from '@/lib/email'
import { notifyError } from '@/lib/errors'
import { verificationSuccessEmail, welcomeEmail, adminNewSignupEmail } from '@/lib/email-templates'

const COOKIE_NAME = 'nyc_classifieds_user'
const MAX_DISTANCE_MILES = 0.1

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
}

export async function POST(request: NextRequest) {
  const userId = verifySession(request.cookies.get(COOKIE_NAME)?.value)
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const db = getSupabaseAdmin()

  // Get user's registered address coordinates
  const { data: user } = await db
    .from('users')
    .select('lat, lng, address')
    .eq('id', userId)
    .single()

  if (!user || user.lat == null || user.lng == null) {
    return NextResponse.json({ error: 'Set your address first' }, { status: 400 })
  }

  const formData = await request.formData()
  const selfie = formData.get('selfie') as File | null
  const geoLat = parseFloat(formData.get('lat') as string)
  const geoLon = parseFloat(formData.get('lon') as string)

  if (!selfie || isNaN(geoLat) || isNaN(geoLon)) {
    return NextResponse.json({ error: 'Selfie and geolocation required' }, { status: 400 })
  }

  // Validate selfie MIME type
  if (!ALLOWED_MIME_TYPES.includes(selfie.type)) {
    return NextResponse.json({ error: 'Invalid image format. Use JPEG, PNG, or WebP.' }, { status: 400 })
  }

  // Calculate distance between address and selfie geolocation
  const distance = haversineDistance(user.lat, user.lng, geoLat, geoLon)

  if (distance > MAX_DISTANCE_MILES) {
    return NextResponse.json({
      error: `Location mismatch. You appear to be ${(distance * 5280).toFixed(0)} feet from your registered address. You must be at your address to verify.`,
      distance,
    }, { status: 400 })
  }

  // Upload selfie to Supabase Storage — derive extension from MIME type
  const ext = MIME_TO_EXT[selfie.type] || 'jpg'
  const filename = `${userId}_${Date.now()}.${ext}`
  const buffer = Buffer.from(await selfie.arrayBuffer())

  const { error: uploadError } = await db.storage
    .from('selfies')
    .upload(filename, buffer, {
      contentType: selfie.type,
      upsert: true,
    })

  if (uploadError) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }

  const { data: urlData } = db.storage.from('selfies').getPublicUrl(filename)

  // Mark user as verified
  await db.from('users').update({
    selfie_url: urlData.publicUrl,
    selfie_geolat: geoLat,
    selfie_geolon: geoLon,
    verified: true,
    updated_at: new Date().toISOString(),
  }).eq('id', userId)

  // Audit log
  await db.from('audit_log').insert({
    actor: userId,
    action: 'verify_location',
    entity: 'user',
    entity_id: parseInt(userId),
    details: { distance: distance.toFixed(3), lat: geoLat, lon: geoLon },
  })

  // Send verification + welcome emails before returning
  try {
    const { data: u } = await db.from('users').select('email, name, address, account_type').eq('id', userId).single()
    if (u?.email && !u.email.endsWith('@example.com')) {
      const nh = u.address?.split(',')[0]?.trim() || ''
      const [verRes, welRes] = await Promise.all([
        sendEmail(u.email, verificationSuccessEmail(u.name || 'there', nh)),
        sendEmail(u.email, welcomeEmail(u.name || 'there', nh)),
      ])
      if (verRes.error) notifyError('Location verification', new Error(`Verification email failed: ${verRes.error}`))
      if (welRes.error) notifyError('Location verification', new Error(`Welcome email failed: ${welRes.error}`))

      // Notify admins of new real user signup (async)
      ;(async () => {
        try {
          const { data: admins } = await db.from('users').select('email').in('role', ['admin']).eq('banned', false)
          if (admins) {
            for (const admin of admins) {
              if (admin.email && !admin.email.endsWith('@example.com')) {
                await sendEmail(admin.email, adminNewSignupEmail(
                  u.name || 'Unknown',
                  u.email,
                  nh,
                  u.account_type || 'personal',
                ))
              }
            }
          }
        } catch {}
      })()
    }
  } catch (err) {
    notifyError('Location verification', err)
  }

  return NextResponse.json({ verified: true, distance: distance.toFixed(2) })
}
