import type { Metadata } from 'next'
import { Suspense } from 'react'
import { categoryBySlug, slugify } from '@/lib/data'
import { buildMetadata, faqSchema, speakableSchema, SITE_URL } from '@/lib/seo'
import { subcategoryFaqs } from '@/lib/seo-faqs'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import SubcategoryPageClient from './SubcategoryPageClient'
import ListingDetailClient from './ListingDetailClient'

export const dynamicParams = true

export async function generateStaticParams() {
  return []
}

// ─── Server-side listing fetch ───

interface ListingRow {
  id: number
  title: string
  description: string | null
  price: number | null
  images: string[]
  location: string | null
  category_slug: string
  subcategory_slug: string | null
  status: string
  created_at: string
  user_id: number
  users: { id: number; name: string; verified: boolean; created_at: string }
}

async function fetchListing(id: string): Promise<ListingRow | null> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('listings')
    .select('*, users!inner(id, name, verified, created_at)')
    .eq('id', id)
    .neq('status', 'removed')
    .single()
  if (error || !data) return null
  return data as ListingRow
}

// ─── Metadata ───

export async function generateMetadata({ params }: { params: Promise<{ category: string; subcategory: string }> }): Promise<Metadata> {
  const { category, subcategory } = await params
  const cat = categoryBySlug[category]
  const subName = cat?.subs.find(s => slugify(s) === subcategory)

  // Subcategory browse page
  if (subName) {
    const catName = cat?.name || category
    return buildMetadata({
      title: `${subName} in NYC — ${catName} from Verified New Yorkers`,
      description: `${subName} listings in New York City. Posted by geo-verified locals across Manhattan, Brooklyn, Queens, Bronx & Staten Island. Browse or post ${subName.toLowerCase()} free.`,
      path: `/listings/${category}/${subcategory}`,
    })
  }

  // Listing detail page
  const listing = await fetchListing(subcategory)
  if (listing) {
    const catName = cat?.name || category
    const statusPrefix = listing.status === 'sold' ? '[SOLD] ' : listing.status === 'expired' ? '[EXPIRED] ' : ''
    const loc = listing.location || ''
    const meta = buildMetadata({
      title: `${statusPrefix}${listing.title} — ${catName}${loc ? ` in ${loc}` : ''}`,
      description: listing.description?.slice(0, 155) || `${listing.title} — free classified listing from a verified NYC resident.${loc ? ` Located in ${loc}.` : ''} Browse more on NYC Classifieds.`,
      path: `/listings/${category}/${subcategory}`,
    })
    // Add listing image as OG image
    if (listing.images.length > 0) {
      meta.openGraph = { ...meta.openGraph, images: [{ url: listing.images[0], alt: listing.title }] }
      meta.twitter = { ...meta.twitter, images: [listing.images[0]] }
    }
    return meta
  }

  return { title: `Listing #${subcategory}` }
}

// ─── Page ───

const PRODUCT_CATEGORIES = new Set(['for-sale', 'rentals', 'tickets', 'pets', 'barter', 'housing'])

export default async function SubcategoryOrDetailPage({ params }: { params: Promise<{ category: string; subcategory: string }> }) {
  const { category, subcategory } = await params
  const cat = categoryBySlug[category]
  const isSubcategory = cat?.subs.some(s => slugify(s) === subcategory)

  if (isSubcategory) {
    const subName = cat?.subs.find(s => slugify(s) === subcategory) || subcategory
    const siteUrl = SITE_URL

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${subName} in New York City`,
      description: `Free ${subName.toLowerCase()} listings in ${cat?.name.toLowerCase()} in New York City from verified locals.`,
      url: `${siteUrl}/listings/${category}/${subcategory}`,
      isPartOf: { '@type': 'WebSite', name: 'The NYC Classifieds' },
    }

    const breadcrumbLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: cat?.name, item: `${siteUrl}/listings/${category}` },
        { '@type': 'ListItem', position: 3, name: subName, item: `${siteUrl}/listings/${category}/${subcategory}` },
      ],
    }

    const scFaqLd = faqSchema(subcategoryFaqs(subName, cat?.name || category))
    const scSpeakLd = speakableSchema({ url: `/listings/${category}/${subcategory}` })

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(scFaqLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(scSpeakLd) }} />
        <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>}>
          <SubcategoryPageClient categorySlug={category} subcategorySlug={subcategory} />
        </Suspense>
      </>
    )
  }

  // ─── Listing detail ───
  const listing = await fetchListing(subcategory)
  const siteUrl = SITE_URL
  const catName = cat?.name || category
  const fullUrl = `${siteUrl}/listings/${category}/${subcategory}`

  // JSON-LD: Product schema for applicable categories
  const schemas: Record<string, unknown>[] = []

  if (listing) {
    if (PRODUCT_CATEGORIES.has(category)) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: listing.title,
        description: listing.description || undefined,
        url: fullUrl,
        ...(listing.images.length > 0 && { image: listing.images }),
        category: catName,
        offers: {
          '@type': 'Offer',
          price: listing.price ? (listing.price / 100).toFixed(2) : '0',
          priceCurrency: 'USD',
          availability: listing.status === 'sold'
            ? 'https://schema.org/SoldOut'
            : listing.status === 'expired'
              ? 'https://schema.org/Discontinued'
              : 'https://schema.org/InStock',
          seller: { '@type': 'Person', name: listing.users.name },
          ...(listing.location && {
            availableAtOrFrom: {
              '@type': 'Place',
              name: listing.location,
              address: {
                '@type': 'PostalAddress',
                addressLocality: listing.location,
                addressRegion: 'NY',
                addressCountry: 'US',
              },
            },
          }),
        },
      })
    } else {
      // Non-product categories (services, gigs, jobs, community, etc.)
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Offer',
        name: listing.title,
        description: listing.description || undefined,
        url: fullUrl,
        ...(listing.images.length > 0 && { image: listing.images }),
        ...(listing.price && {
          price: (listing.price / 100).toFixed(2),
          priceCurrency: 'USD',
        }),
        availability: listing.status === 'sold'
          ? 'https://schema.org/SoldOut'
          : listing.status === 'expired'
            ? 'https://schema.org/Discontinued'
            : 'https://schema.org/InStock',
        seller: { '@type': 'Person', name: listing.users.name },
        ...(listing.location && {
          areaServed: {
            '@type': 'Place',
            name: listing.location,
            address: { '@type': 'PostalAddress', addressLocality: listing.location, addressRegion: 'NY', addressCountry: 'US' },
          },
        }),
      })
    }

    // Breadcrumb always
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: catName, item: `${siteUrl}/listings/${category}` },
        { '@type': 'ListItem', position: 3, name: listing.title, item: fullUrl },
      ],
    })
  }

  return (
    <>
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>}>
        <ListingDetailClient id={subcategory} />
      </Suspense>
    </>
  )
}
