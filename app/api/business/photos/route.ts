import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

const COOKIE_NAME = 'nyc_classifieds_user'

export async function POST(request: NextRequest) {
  const userId = request.cookies.get(COOKIE_NAME)?.value
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const db = getSupabaseAdmin()

  const { data: user } = await db
    .from('users')
    .select('account_type, photo_gallery')
    .eq('id', userId)
    .single()

  if (!user || user.account_type !== 'business') {
    return NextResponse.json({ error: 'Business account required' }, { status: 403 })
  }

  const formData = await request.formData()
  const photo = formData.get('photo') as File | null

  if (!photo) {
    return NextResponse.json({ error: 'Photo required' }, { status: 400 })
  }

  // Validate file type and size
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!ALLOWED_TYPES.includes(photo.type)) {
    return NextResponse.json({ error: 'Only JPEG, PNG, WebP, and GIF images are allowed' }, { status: 400 })
  }
  if (photo.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Photo must be under 10MB' }, { status: 400 })
  }

  // Limit gallery to 20 photos
  if ((user.photo_gallery || []).length >= 20) {
    return NextResponse.json({ error: 'Maximum 20 photos allowed' }, { status: 400 })
  }

  const SAFE_EXTS: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }
  const ext = SAFE_EXTS[photo.type] || 'jpg'
  const filename = `biz_${userId}_${Date.now()}.${ext}`
  const buffer = Buffer.from(await photo.arrayBuffer())

  const { error: uploadError } = await db.storage
    .from('listings')
    .upload(`business/${filename}`, buffer, {
      contentType: photo.type,
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }

  const { data: urlData } = db.storage.from('listings').getPublicUrl(`business/${filename}`)

  const gallery = [...(user.photo_gallery || []), urlData.publicUrl]

  await db.from('users').update({ photo_gallery: gallery }).eq('id', userId)

  return NextResponse.json({ url: urlData.publicUrl, gallery })
}

export async function DELETE(request: NextRequest) {
  const userId = request.cookies.get(COOKIE_NAME)?.value
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const db = getSupabaseAdmin()
  const { url } = await request.json()

  const { data: user } = await db
    .from('users')
    .select('photo_gallery')
    .eq('id', userId)
    .single()

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const gallery = (user.photo_gallery || []).filter((p: string) => p !== url)
  await db.from('users').update({ photo_gallery: gallery }).eq('id', userId)

  return NextResponse.json({ gallery })
}
