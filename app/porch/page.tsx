import type { Metadata } from 'next'
import { Suspense } from 'react'
import { buildMetadata } from '@/lib/seo'
import PorchClient from './PorchClient'
import PorchRedirect from '@/app/components/PorchRedirect'

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: 'The Porch — NYC Neighborhood Feed | Free Local Discussions',
    description: 'Join your neighborhood conversation on The Porch. Ask questions, share recommendations, post alerts, lost & found, events, stoop sales, and more. Free for verified NYC residents.',
    path: '/porch',
  })
}

export default function PorchPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thenycclassifieds.com'

  const forumLd = {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    name: 'The Porch — NYC Neighborhood Feed',
    description: 'Neighborhood-based discussion feed for New York City residents. Recommendations, questions, alerts, lost & found, events, and more.',
    url: `${siteUrl}/porch`,
    author: {
      '@type': 'Organization',
      name: 'The NYC Classifieds',
      url: siteUrl,
    },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'The Porch', item: `${siteUrl}/porch` },
    ],
  }

  return (
    <>
      <PorchRedirect />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(forumLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>}>
        <PorchClient />
      </Suspense>
    </>
  )
}
