import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { boroughs, boroughBySlug, categoryBySlug, findNeighborhood, neighborhoodSlug, categories, slugify } from '@/lib/data'
import { buildMetadata, faqSchema, speakableSchema } from '@/lib/seo'
import { neighborhoodCategoryFaqs } from '@/lib/seo-faqs'
import NeighborhoodCategoryClient from './NeighborhoodCategoryClient'

export const dynamicParams = true

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: { params: Promise<{ borough: string; slug: string; category: string }> }): Promise<Metadata> {
  const { borough, slug, category } = await params
  const b = boroughBySlug[borough]
  const nh = findNeighborhood(borough, slug)
  const cat = categoryBySlug[category]
  if (!b || !nh || !cat) return { title: 'Not Found' }

  const subSample = cat.subs.slice(0, 5).join(', ')
  return buildMetadata({
    title: `${cat.name} in ${nh.name}, ${b.name} — Verified Local Listings`,
    description: `${cat.name} in ${nh.name}, ${b.name} from your verified neighbors. ${subSample} & more. Every poster is confirmed to live or work in ${nh.name}. Free to post.`,
    path: `/${borough}/${slug}/${category}`,
  })
}

export default async function NeighborhoodCategoryPage({ params }: { params: Promise<{ borough: string; slug: string; category: string }> }) {
  const { borough, slug, category } = await params
  const b = boroughBySlug[borough]
  const nh = findNeighborhood(borough, slug)
  const cat = categoryBySlug[category]
  if (!b || !nh || !cat) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thenycclassifieds.com'

  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: b.name, item: `${siteUrl}/${borough}` },
      { '@type': 'ListItem', position: 3, name: nh.name, item: `${siteUrl}/${borough}/${slug}` },
      { '@type': 'ListItem', position: 4, name: cat.name, item: `${siteUrl}/${borough}/${slug}/${category}` },
    ],
  }

  const collectionLd = {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: `${cat.name} in ${nh.name}, ${b.name}`,
    description: `Free ${cat.name.toLowerCase()} listings in ${nh.name}, ${b.name}, NYC.`,
    url: `${siteUrl}/${borough}/${slug}/${category}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: cat.subs.map((sub, i) => ({
        '@type': 'ListItem', position: i + 1,
        name: `${sub} in ${nh.name}`,
        url: `${siteUrl}/${borough}/${slug}/${category}/${slugify(sub)}`,
      })),
    },
  }

  const ncFaqLd = faqSchema(neighborhoodCategoryFaqs(nh.name, b.name, cat.name))
  const ncSpeakLd = speakableSchema({ url: `/${borough}/${slug}/${category}` })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ncFaqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ncSpeakLd) }} />
      <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>}>
        <NeighborhoodCategoryClient boroughSlug={borough} neighborhoodSlug={slug} categorySlug={category} />
      </Suspense>
    </>
  )
}
