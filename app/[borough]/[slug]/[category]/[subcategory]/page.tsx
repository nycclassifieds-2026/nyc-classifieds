import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { boroughs, boroughBySlug, categoryBySlug, findNeighborhood, neighborhoodSlug, categories, slugify } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'
import NeighborhoodSubcategoryClient from './NeighborhoodSubcategoryClient'

export const dynamicParams = true

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: { params: Promise<{ borough: string; slug: string; category: string; subcategory: string }> }): Promise<Metadata> {
  const { borough, slug, category, subcategory } = await params
  const b = boroughBySlug[borough]
  const nh = findNeighborhood(borough, slug)
  const cat = categoryBySlug[category]
  const subName = cat?.subs.find(s => slugify(s) === subcategory)
  if (!b || !nh || !cat || !subName) return { title: 'Not Found' }

  return buildMetadata({
    title: `${subName} in ${nh.name}, ${b.name} — Free ${subName} Listings`,
    description: `Find free ${subName.toLowerCase()} listings in ${nh.name}, ${b.name}, New York City. Browse ${subName.toLowerCase()} from geo-verified locals in your neighborhood. Post for free on NYC Classifieds.`,
    path: `/${borough}/${slug}/${category}/${subcategory}`,
  })
}

export default async function NeighborhoodSubcategoryPage({ params }: { params: Promise<{ borough: string; slug: string; category: string; subcategory: string }> }) {
  const { borough, slug, category, subcategory } = await params
  const b = boroughBySlug[borough]
  const nh = findNeighborhood(borough, slug)
  const cat = categoryBySlug[category]
  const subName = cat?.subs.find(s => slugify(s) === subcategory)
  if (!b || !nh || !cat || !subName) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thenycclassifieds.com'

  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: b.name, item: `${siteUrl}/${borough}` },
      { '@type': 'ListItem', position: 3, name: nh.name, item: `${siteUrl}/${borough}/${slug}` },
      { '@type': 'ListItem', position: 4, name: cat.name, item: `${siteUrl}/${borough}/${slug}/${category}` },
      { '@type': 'ListItem', position: 5, name: subName, item: `${siteUrl}/${borough}/${slug}/${category}/${subcategory}` },
    ],
  }

  const collectionLd = {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: `${subName} in ${nh.name}, ${b.name}`,
    description: `Free ${subName.toLowerCase()} listings in ${nh.name}, ${b.name}, New York City from verified locals.`,
    url: `${siteUrl}/${borough}/${slug}/${category}/${subcategory}`,
    about: {
      '@type': 'Place',
      name: `${nh.name}, ${b.name}`,
      address: { '@type': 'PostalAddress', addressLocality: b.name, addressRegion: 'NY', addressCountry: 'US' },
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>}>
        <NeighborhoodSubcategoryClient boroughSlug={borough} neighborhoodSlug={slug} categorySlug={category} subcategorySlug={subcategory} />
      </Suspense>
    </>
  )
}
