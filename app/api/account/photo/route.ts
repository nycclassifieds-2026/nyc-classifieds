import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { verifySession } from '@/lib/auth-utils'
import { logEvent } from '@/lib/events'
import { cookies } from 'next/headers'

const SUPABASE_HOST = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null

export async function POST(request: NextRequest) {
  const jar = await cookies()
  const userId = verifySession(jar.get('nyc_classifieds_user')?.value)
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await request.json()
  const { url, type } = body

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'Photo URL required' }, { status: 400 })
  }

  if (!['personal', 'business'].includes(type)) {
    return NextResponse.json({ error: 'Type must be personal or business' }, { status: 400 })
  }

  // Validate URL hostname matches Supabase storage domain
  try {
    const urlHost = new URL(url).hostname
    if (SUPABASE_HOST && urlHost !== SUPABASE_HOST) {
      return NextResponse.json({ error: 'Invalid photo URL domain' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  const field = type === 'business' ? 'business_photo' : 'selfie_url'
  const { error } = await db
    .from('users')
    .update({ [field]: url })
    .eq('id', parseInt(userId))

  if (error) {
    return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 })
  }

  logEvent('photo_updated', { type, user_id: parseInt(userId) }, {
    userId: parseInt(userId),
    notify: true,
    notifyTitle: 'Photo updated',
    notifyBody: `User #${userId} updated ${type} photo`,
  })

  return NextResponse.json({ ok: true })
}
