import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const jar = await cookies()
  const token = jar.get('nyc_auth')?.value
  if (!token) {
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

  const db = getSupabaseAdmin()
  const userId = parseInt(token)

  const field = type === 'business' ? 'business_photo' : 'selfie_url'
  const { error } = await db
    .from('users')
    .update({ [field]: url })
    .eq('id', userId)

  if (error) {
    return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
