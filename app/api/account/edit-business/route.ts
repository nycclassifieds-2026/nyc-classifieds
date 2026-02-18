import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

const COOKIE_NAME = 'nyc_classifieds_user'

export async function POST(request: NextRequest) {
  const userId = request.cookies.get(COOKIE_NAME)?.value
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const db = getSupabaseAdmin()

  // Verify user has a business profile
  const { data: user } = await db
    .from('users')
    .select('id, account_type')
    .eq('id', parseInt(userId))
    .single()

  if (!user || user.account_type !== 'business') {
    return NextResponse.json({ error: 'No business profile' }, { status: 400 })
  }

  const body = await request.json()
  const {
    business_name, business_category, business_description,
    website, phone, business_address, hours, service_area,
    photo_gallery, social_links,
  } = body

  const updates: Record<string, unknown> = {}

  if (business_name !== undefined) {
    if (!business_name?.trim()) {
      return NextResponse.json({ error: 'Business name cannot be empty' }, { status: 400 })
    }
    updates.business_name = business_name.trim()
  }
  if (business_category !== undefined) updates.business_category = business_category?.trim() || null
  if (business_description !== undefined) updates.business_description = business_description?.trim() || null
  if (website !== undefined) updates.website = website?.trim() || null
  if (phone !== undefined) updates.phone = phone?.trim() || null
  if (business_address !== undefined) updates.business_address = business_address?.trim() || null
  if (hours !== undefined) updates.hours = hours
  if (service_area !== undefined && Array.isArray(service_area)) updates.service_area = service_area
  if (photo_gallery !== undefined && Array.isArray(photo_gallery)) {
    if (photo_gallery.length > 8) return NextResponse.json({ error: 'Maximum 8 photos allowed' }, { status: 400 })
    updates.photo_gallery = photo_gallery
  }
  if (social_links !== undefined) updates.social_links = social_links

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const { error } = await db
    .from('users')
    .update(updates)
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
