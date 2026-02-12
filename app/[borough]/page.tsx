import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { boroughs, boroughBySlug, categories } from '@/lib/data'
import { buildMetadata, faqSchema, speakableSchema } from '@/lib/seo'
import { boroughFaqs } from '@/lib/seo-faqs'
import BoroughPageClient from './BoroughPageClient'

export async function generateStaticParams() {
  return boroughs.map(b => ({ borough: b.slug }))
}

const boroughMeta: Record<string, { title: string; desc: string }> = {
  'manhattan': {
    title: 'Manhattan Classifieds — Apartments, Jobs & Services in 41 Neighborhoods',
    desc: 'Free classifieds in Manhattan. Find apartments, jobs, services & more from the Upper East Side to Tribeca. Every poster is verified with a selfie + GPS at their Manhattan address.',
  },
  'brooklyn': {
    title: 'Brooklyn Classifieds — Buy, Sell & Hire Local in 28 Neighborhoods',
    desc: 'Free classifieds in Brooklyn. Apartments, jobs, services, for sale & gigs from Williamsburg to Bay Ridge. Every poster is geo-verified to their Brooklyn address.',
  },
  'queens': {
    title: 'Queens Classifieds — Local Listings Across 30 Neighborhoods',
    desc: 'Free classifieds in Queens. Apartments, jobs, services & more from Astoria to Flushing. Every poster is verified with a selfie + GPS at their Queens address.',
  },
  'bronx': {
    title: 'Bronx Classifieds — Apartments, Jobs & Services in 15 Neighborhoods',
    desc: 'Free classifieds in the Bronx. Find apartments, jobs, services & more from Fordham to Riverdale. Every poster is geo-verified to their Bronx address.',
  },
  'staten-island': {
    title: 'Staten Island Classifieds — Local Listings Across 10 Neighborhoods',
    desc: 'Free classifieds in Staten Island. Apartments, jobs, services & more from Tottenville to St. George. Every poster is geo-verified to their Staten Island address.',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ borough: string }> }): Promise<Metadata> {
  const { borough } = await params
  const b = boroughBySlug[borough]
  if (!b) return { title: 'Not Found' }

  const custom = boroughMeta[b.slug]
  const nhSample = b.neighborhoods.slice(0, 6).join(', ')
  return buildMetadata({
    title: custom?.title || `${b.name} Classifieds — Free Listings Across ${b.neighborhoods.length} Neighborhoods`,
    description: custom?.desc || `Free classifieds in ${b.name}, NYC. Apartments, jobs, services & more across ${b.neighborhoods.length} neighborhoods including ${nhSample}. Geo-verified posters only.`,
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

  const nhSample = b.neighborhoods.slice(0, 8).join(', ')
  const faqLd = faqSchema(boroughFaqs(b.name, b.neighborhoods.length, nhSample))
  const speakableLd = speakableSchema({ url: `/${b.slug}` })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(placeLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableLd) }} />
      <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>}>
        <BoroughPageClient boroughSlug={borough} />
      </Suspense>
    </>
  )
}
