import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { boroughs, boroughBySlug, categoryBySlug, findNeighborhood, neighborhoodSlug, categories } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'
import BoroughCategoryClient from './BoroughCategoryClient'
import NeighborhoodPageClient from './NeighborhoodPageClient'

export async function generateStaticParams() {
  const params: { borough: string; slug: string }[] = []
  for (const b of boroughs) {
    for (const cat of categories) {
      params.push({ borough: b.slug, slug: cat.slug })
    }
    for (const n of b.neighborhoods) {
      params.push({ borough: b.slug, slug: neighborhoodSlug(n) })
    }
  }
  return params
}

export async function generateMetadata({ params }: { params: Promise<{ borough: string; slug: string }> }): Promise<Metadata> {
  const { borough, slug } = await params
  const b = boroughBySlug[borough]
  if (!b) return { title: 'Not Found' }

  const cat = categoryBySlug[slug]
  if (cat) {
    const subSample = cat.subs.slice(0, 5).join(', ')
    return buildMetadata({
      title: `${cat.name} in ${b.name}, NYC — Free ${cat.name} Listings`,
      description: `Browse free ${cat.name.toLowerCase()} listings in ${b.name}, New York City. ${subSample}, and more. Geo-verified NYC locals only. Post for free.`,
      path: `/${borough}/${slug}`,
    })
  }

  const nh = findNeighborhood(borough, slug)
  if (nh) {
    return buildMetadata({
      title: `${nh.name}, ${b.name} Classifieds — Free Listings in ${nh.name}`,
      description: `Browse free classifieds in ${nh.name}, ${b.name}. Housing, jobs, services, for sale, gigs, and community listings. All users are geo-verified to ${nh.name}.`,
      path: `/${borough}/${slug}`,
    })
  }

  return { title: 'Not Found' }
}

export default async function BoroughSlugPage({ params }: { params: Promise<{ borough: string; slug: string }> }) {
  const { borough, slug } = await params
  const b = boroughBySlug[borough]
  if (!b) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nycclassifieds.com'

  const cat = categoryBySlug[slug]
  if (cat) {
    const breadcrumbLd = {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: b.name, item: `${siteUrl}/${borough}` },
        { '@type': 'ListItem', position: 3, name: cat.name, item: `${siteUrl}/${borough}/${slug}` },
      ],
    }
    const collectionLd = {
      '@context': 'https://schema.org', '@type': 'CollectionPage',
      name: `${cat.name} in ${b.name}`,
      description: `Free ${cat.name.toLowerCase()} listings in ${b.name}, NYC.`,
      url: `${siteUrl}/${borough}/${slug}`,
    }
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
        <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>}>
          <BoroughCategoryClient boroughSlug={borough} categorySlug={slug} />
        </Suspense>
      </>
    )
  }

  const nh = findNeighborhood(borough, slug)
  if (nh) {
    const placeLd = {
      '@context': 'https://schema.org', '@type': 'Place',
      name: `${nh.name}, ${b.name}, New York City`,
      description: `Free classifieds in ${nh.name}, ${b.name}. Housing, jobs, services, and more from verified locals.`,
      url: `${siteUrl}/${borough}/${slug}`,
      address: { '@type': 'PostalAddress', addressLocality: b.name, addressRegion: 'NY', addressCountry: 'US' },
      containedInPlace: { '@type': 'AdministrativeArea', name: b.name },
    }
    const breadcrumbLd = {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: b.name, item: `${siteUrl}/${borough}` },
        { '@type': 'ListItem', position: 3, name: nh.name, item: `${siteUrl}/${borough}/${slug}` },
      ],
    }
    const collectionLd = {
      '@context': 'https://schema.org', '@type': 'CollectionPage',
      name: `Classifieds in ${nh.name}, ${b.name}`,
      url: `${siteUrl}/${borough}/${slug}`,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: categories.map((c, i) => ({
          '@type': 'ListItem', position: i + 1,
          name: `${c.name} in ${nh.name}`,
          url: `${siteUrl}/${borough}/${slug}/${c.slug}`,
        })),
      },
    }
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(placeLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
        <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>}>
          <NeighborhoodPageClient boroughSlug={borough} neighborhoodSlug={slug} />
        </Suspense>
      </>
    )
  }

  notFound()
}
