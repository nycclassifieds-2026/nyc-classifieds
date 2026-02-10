import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { boroughs, boroughBySlug, findNeighborhood, neighborhoodSlug, porchPostTypes, porchPostTypeBySlug } from '@/lib/data'
import { buildMetadata, breadcrumbSchema, placeSchema } from '@/lib/seo'
import PorchClient from '../../../PorchClient'

export async function generateStaticParams() {
  const params: { borough: string; neighborhood: string; postType: string }[] = []
  for (const b of boroughs) {
    for (const n of b.neighborhoods) {
      for (const pt of porchPostTypes) {
        params.push({
          borough: b.slug,
          neighborhood: neighborhoodSlug(n),
          postType: pt.slug,
        })
      }
    }
  }
  return params
}

export async function generateMetadata({ params }: { params: Promise<{ borough: string; neighborhood: string; postType: string }> }): Promise<Metadata> {
  const { borough, neighborhood, postType } = await params
  const b = boroughBySlug[borough]
  if (!b) return { title: 'Not Found' }

  const nh = findNeighborhood(borough, neighborhood)
  if (!nh) return { title: 'Not Found' }

  const pt = porchPostTypeBySlug[postType]
  if (!pt) return { title: 'Not Found' }

  return buildMetadata({
    title: `${pt.name} in ${nh.name}, ${b.name} — The Porch`,
    description: `Browse ${pt.name.toLowerCase()} posts in ${nh.name}, ${b.name}. Join the neighborhood conversation on The Porch.`,
    path: `/porch/${borough}/${neighborhood}/${postType}`,
  })
}

export default async function PorchPostTypePage({ params }: { params: Promise<{ borough: string; neighborhood: string; postType: string }> }) {
  const { borough, neighborhood, postType } = await params
  const b = boroughBySlug[borough]
  if (!b) notFound()

  const nh = findNeighborhood(borough, neighborhood)
  if (!nh) notFound()

  const pt = porchPostTypeBySlug[postType]
  if (!pt) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nycclassifieds.com'

  const breadcrumbLd = breadcrumbSchema([
    { name: 'The Porch', url: '/porch' },
    { name: b.name, url: `/porch/${borough}` },
    { name: nh.name, url: `/porch/${borough}/${neighborhood}` },
    { name: pt.name, url: `/porch/${borough}/${neighborhood}/${postType}` },
  ])

  const forumLd = {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    name: `${pt.name} in ${nh.name}, ${b.name}`,
    description: `${pt.name} posts from the ${nh.name} neighborhood in ${b.name}.`,
    url: `${siteUrl}/porch/${borough}/${neighborhood}/${postType}`,
    author: {
      '@type': 'Organization',
      name: 'The NYC Classifieds',
      url: siteUrl,
    },
  }

  const placeLd = placeSchema({
    name: `${nh.name}, ${b.name}, New York City`,
    borough: b.name,
    description: `${pt.name} posts in ${nh.name}, ${b.name} on The Porch.`,
    url: `/porch/${borough}/${neighborhood}/${postType}`,
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(forumLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(placeLd) }} />
      <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>}>
        <PorchClient boroughSlug={borough} neighborhoodSlug={neighborhood} postTypeSlug={postType} />
      </Suspense>
    </>
  )
}
