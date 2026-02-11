import type { Metadata } from 'next'
import { Suspense } from 'react'
import { buildMetadata } from '@/lib/seo'
import PorchPostClient from './PorchPostClient'

export async function generateMetadata({ params }: { params: Promise<{ id: string; slug: string }> }): Promise<Metadata> {
  const { id, slug } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thenycclassifieds.com'

  // Attempt to fetch post data for metadata
  try {
    const res = await fetch(`${siteUrl}/api/porch?post_id=${id}`, { next: { revalidate: 60 } })
    if (res.ok) {
      const data = await res.json()
      const post = data.posts?.[0] || data.post
      if (post) {
        const titleText = post.title || slug.replace(/-/g, ' ')
        const neighborhood = post.neighborhood_slug?.replace(/-/g, ' ') || ''
        const borough = post.borough_slug?.replace(/-/g, ' ') || ''
        const location = neighborhood && borough ? ` in ${neighborhood}, ${borough}` : ''
        return buildMetadata({
          title: `${titleText}${location} — The Porch | NYC Classifieds`,
          description: post.body?.slice(0, 160) || `Community discussion${location} on The Porch.`,
          path: `/porch/post/${id}/${slug}`,
        })
      }
    }
  } catch {
    // Fall through to default metadata
  }

  const readableSlug = slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
  return buildMetadata({
    title: `${readableSlug} — The Porch | NYC Classifieds`,
    description: `Community discussion on The Porch. Join the conversation with your NYC neighbors.`,
    path: `/porch/post/${id}/${slug}`,
  })
}

export default async function PorchPostPage({ params }: { params: Promise<{ id: string; slug: string }> }) {
  const { id, slug } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thenycclassifieds.com'

  const readableSlug = slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())

  const forumLd = {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    headline: readableSlug,
    text: readableSlug,
    url: `${siteUrl}/porch/post/${id}/${slug}`,
    datePublished: new Date().toISOString(),
    author: { '@type': 'Person', name: 'NYC Resident' },
    isPartOf: {
      '@type': 'DiscussionForum',
      name: 'The Porch — NYC Neighborhood Feed',
      url: `${siteUrl}/porch`,
    },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'The Porch', item: `${siteUrl}/porch` },
      { '@type': 'ListItem', position: 3, name: readableSlug, item: `${siteUrl}/porch/post/${id}/${slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(forumLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>}>
        <PorchPostClient postId={id} />
      </Suspense>
    </>
  )
}
