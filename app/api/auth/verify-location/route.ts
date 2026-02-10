import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { haversineDistance } from '@/lib/geocode'

const COOKIE_NAME = 'nyc_classifieds_user'
const MAX_DISTANCE_MILES = 0.01

export async function POST(request: NextRequest) {
  const userId = request.cookies.get(COOKIE_NAME)?.value
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

  // Calculate distance between address and selfie geolocation
  const distance = haversineDistance(user.lat, user.lng, geoLat, geoLon)

  if (distance > MAX_DISTANCE_MILES) {
    return NextResponse.json({
      error: `Location mismatch. You appear to be ${(distance * 5280).toFixed(0)} feet from your registered address. You must be at your address to verify.`,
      distance,
    }, { status: 400 })
  }

  // Upload selfie to Supabase Storage
  const ext = selfie.name.split('.').pop() || 'jpg'
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

  return NextResponse.json({ verified: true, distance: distance.toFixed(2) })
}
