import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { slugify } from '@/lib/data'

export default async function OldBusinessProfileRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const db = getSupabaseAdmin()

  const { data: business } = await db
    .from('users')
    .select('business_slug, business_category')
    .eq('business_slug', slug)
    .eq('account_type', 'business')
    .single()

  if (!business) {
    redirect('/business')
  }

  const catSlug = business.business_category ? slugify(business.business_category) : 'other'
  redirect(`/business/${catSlug}/${business.business_slug}`)
}
