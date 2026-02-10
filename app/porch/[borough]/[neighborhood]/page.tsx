import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { boroughs, boroughBySlug, findNeighborhood, neighborhoodSlug } from '@/lib/data'
import { buildMetadata, breadcrumbSchema, placeSchema } from '@/lib/seo'
import PorchClient from '../../PorchClient'

export const dynamicParams = true

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: { params: Promise<{ borough: string; neighborhood: string }> }): Promise<Metadata> {
  const { borough, neighborhood } = await params
  const b = boroughBySlug[borough]
  if (!b) return { title: 'Not Found' }

  const nh = findNeighborhood(borough, neighborhood)
  if (!nh) return { title: 'Not Found' }

  return buildMetadata({
    title: `The Porch in ${nh.name}, ${b.name} — Local Community Feed`,
    description: `Join the ${nh.name} neighborhood conversation. Ask questions, share recommendations, post alerts, lost & found, events, stoop sales, and more. Free for verified ${nh.name} residents.`,
    path: `/porch/${borough}/${neighborhood}`,
  })
}

export default async function PorchNeighborhoodPage({ params }: { params: Promise<{ borough: string; neighborhood: string }> }) {
  const { borough, neighborhood } = await params
  const b = boroughBySlug[borough]
  if (!b) notFound()

  const nh = findNeighborhood(borough, neighborhood)
  if (!nh) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thenycclassifieds.com'

  const breadcrumbLd = breadcrumbSchema([
    { name: 'The Porch', url: '/porch' },
    { name: b.name, url: `/porch/${borough}` },
    { name: nh.name, url: `/porch/${borough}/${neighborhood}` },
  ])

  const forumLd = {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    name: `The Porch in ${nh.name}, ${b.name}`,
    description: `Neighborhood discussion feed for ${nh.name}, ${b.name}. Recommendations, questions, alerts, events, and more.`,
    url: `${siteUrl}/porch/${borough}/${neighborhood}`,
    author: {
      '@type': 'Organization',
      name: 'The NYC Classifieds',
      url: siteUrl,
    },
  }

  const placeLd = placeSchema({
    name: `${nh.name}, ${b.name}, New York City`,
    borough: b.name,
    description: `Community discussion feed for ${nh.name}, ${b.name}. Join the neighborhood conversation.`,
    url: `/porch/${borough}/${neighborhood}`,
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(forumLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(placeLd) }} />
      <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>}>
        <PorchClient boroughSlug={borough} neighborhoodSlug={neighborhood} />
      </Suspense>
    </>
  )
}
