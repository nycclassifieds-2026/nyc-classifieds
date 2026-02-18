import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const db = getSupabaseAdmin()

  // Verify auth
  const jar = await cookies()
  const token = jar.get('nyc_classifieds_user')?.value
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: session } = await db
    .from('users')
    .select('id, account_type, verified')
    .eq('id', parseInt(token))
    .single()

  if (!session) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (!session.verified) {
    return NextResponse.json({ error: 'Must be verified first' }, { status: 403 })
  }

  if (session.account_type === 'business') {
    return NextResponse.json({ error: 'You already have a business profile' }, { status: 400 })
  }

  // Parse body
  const body = await request.json()
  const { business_name, business_category, business_description, website, phone, hours, service_area, business_address } = body

  if (!business_name || !business_name.trim()) {
    return NextResponse.json({ error: 'Business name is required' }, { status: 400 })
  }

  if (!business_category || !business_category.trim()) {
    return NextResponse.json({ error: 'Business category is required' }, { status: 400 })
  }

  // Generate slug
  let baseSlug = business_name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  let slug = baseSlug
  let counter = 0

  // Check for slug collision
  while (true) {
    const { data: existing } = await db
      .from('users')
      .select('id')
      .eq('business_slug', slug)
      .single()

    if (!existing) break
    counter++
    slug = `${baseSlug}-${counter}`
  }

  // Update user
  const updates: Record<string, unknown> = {
    account_type: 'business',
    business_name: business_name.trim(),
    business_slug: slug,
    business_category: business_category.trim(),
  }

  if (business_description) updates.business_description = business_description.trim()
  if (website) updates.website = website.trim()
  if (phone) updates.phone = phone.trim()
  if (hours) updates.hours = hours
  if (service_area && Array.isArray(service_area)) updates.service_area = service_area
  if (business_address) updates.business_address = business_address.trim()

  const { error } = await db
    .from('users')
    .update(updates)
    .eq('id', session.id)

  if (error) {
    console.error('Upgrade to business error:', error)
    return NextResponse.json({ error: 'Failed to upgrade' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, business_slug: slug })
}
