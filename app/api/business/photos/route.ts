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

  const ext = photo.name.split('.').pop() || 'jpg'
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
