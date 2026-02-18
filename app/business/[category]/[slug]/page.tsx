import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { slugify } from '@/lib/data'
import { redirect } from 'next/navigation'
import BusinessProfileClient from './BusinessProfileClient'
import { cache } from 'react'

const getBusiness = cache(async (slug: string) => {
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('users')
    .select('id, business_name, business_slug, business_category, business_description, business_photo, selfie_url, business_address, phone, website, verified')
    .eq('business_slug', slug)
    .eq('account_type', 'business')
    .single()
  return data
})

export async function generateMetadata({ params }: { params: Promise<{ category: string; slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const biz = await getBusiness(slug)

  if (!biz) {
    return { title: 'Business Not Found | NYC Classifieds' }
  }

  const description = biz.business_description
    ? biz.business_description.slice(0, 155)
    : `${biz.business_name} — verified NYC business on NYC Classifieds. View services, hours, photos, and contact info.`

  const catSlug = biz.business_category ? slugify(biz.business_category) : 'other'

  return {
    title: `${biz.business_name} | ${biz.business_category || 'Business'} | NYC Classifieds`,
    description,
    openGraph: {
      title: biz.business_name,
      description,
      url: `https://thenycclassifieds.com/business/${catSlug}/${biz.business_slug}`,
      ...(biz.business_photo || biz.selfie_url
        ? { images: [{ url: biz.business_photo || biz.selfie_url! }] }
        : {}),
    },
  }
}

export default async function BusinessProfilePage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params
  const biz = await getBusiness(slug)

  if (!biz) {
    return (
      <main style={{ maxWidth: '1050px', margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>Business not found</h1>
        <a href="/" style={{ color: '#2563eb', fontSize: '0.875rem', marginTop: '1rem', display: 'inline-block' }}>
          Back to home
        </a>
      </main>
    )
  }

  // Redirect if category slug doesn't match
  const correctCatSlug = biz.business_category ? slugify(biz.business_category) : 'other'
  if (category !== correctCatSlug) {
    redirect(`/business/${correctCatSlug}/${slug}`)
  }

  // Lightweight JSON-LD — reviews/hours come from client-side API call
  const bizAvatar = biz.business_photo || biz.selfie_url

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: biz.business_name,
    ...(biz.business_category && { additionalType: biz.business_category }),
    ...(biz.business_description && { description: biz.business_description }),
    url: `https://thenycclassifieds.com/business/${correctCatSlug}/${biz.business_slug}`,
    address: {
      '@type': 'PostalAddress',
      ...(biz.business_address && { streetAddress: biz.business_address }),
      addressLocality: 'New York',
      addressRegion: 'NY',
      addressCountry: 'US',
    },
    ...(biz.phone && { telephone: biz.phone }),
    ...(biz.website && { url: biz.website.startsWith('http') ? biz.website : `https://${biz.website}` }),
    ...(bizAvatar && { image: bizAvatar }),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://thenycclassifieds.com' },
      { '@type': 'ListItem', position: 2, name: 'Business Directory', item: 'https://thenycclassifieds.com/business' },
      { '@type': 'ListItem', position: 3, name: biz.business_category || 'Business', item: `https://thenycclassifieds.com/business?category=${encodeURIComponent(biz.business_category || '')}` },
      { '@type': 'ListItem', position: 4, name: biz.business_name },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>}>
        <BusinessProfileClient slug={slug} category={category} />
      </Suspense>
    </>
  )
}
