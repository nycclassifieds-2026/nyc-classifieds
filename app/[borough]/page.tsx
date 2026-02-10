import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { boroughs, boroughBySlug, categories } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'
import BoroughPageClient from './BoroughPageClient'

export async function generateStaticParams() {
  return boroughs.map(b => ({ borough: b.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ borough: string }> }): Promise<Metadata> {
  const { borough } = await params
  const b = boroughBySlug[borough]
  if (!b) return { title: 'Not Found' }

  const nhSample = b.neighborhoods.slice(0, 6).join(', ')
  return buildMetadata({
    title: `${b.name} Classifieds — Free Listings in ${b.name}, NYC`,
    description: `Browse free classifieds in ${b.name}, New York City. Housing, jobs, services, for sale, and more across ${b.neighborhoods.length} neighborhoods including ${nhSample}. All users are geo-verified.`,
    path: `/${b.slug}`,
  })
}

export default async function BoroughPage({ params }: { params: Promise<{ borough: string }> }) {
  const { borough } = await params
  const b = boroughBySlug[borough]
  if (!b) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thenycclassifieds.com'

  const placeLd = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: `${b.name}, New York City`,
    description: `Free classifieds for ${b.name}, NYC. Browse ${b.neighborhoods.length} neighborhoods for housing, jobs, services, and more.`,
    url: `${siteUrl}/${b.slug}`,
    address: { '@type': 'PostalAddress', addressLocality: b.name, addressRegion: 'NY', addressCountry: 'US' },
    containedInPlace: { '@type': 'City', name: 'New York', sameAs: 'https://en.wikipedia.org/wiki/New_York_City' },
  }

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${b.name} Classifieds`,
    description: `All classifieds in ${b.name}, NYC`,
    url: `${siteUrl}/${b.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        ...categories.map((cat, i) => ({
          '@type': 'ListItem', position: i + 1,
          name: `${cat.name} in ${b.name}`,
          url: `${siteUrl}/${b.slug}/${cat.slug}`,
        })),
      ],
    },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: b.name, item: `${siteUrl}/${b.slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(placeLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>}>
        <BoroughPageClient boroughSlug={borough} />
      </Suspense>
    </>
  )
}
