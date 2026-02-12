import type { Metadata } from 'next'
import { Suspense } from 'react'
import { buildMetadata, faqSchema, speakableSchema } from '@/lib/seo'
import PorchClient from './PorchClient'
import PorchRedirect from '@/app/components/PorchRedirect'

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: 'The Porch — NYC Neighborhood Community Board | Ask, Share, Connect',
    description: 'The Porch is NYC\'s verified neighborhood feed. Ask neighbors questions, share recommendations, post lost pet alerts, list stoop sales, and connect with real people near you. Free for all verified NYC residents.',
    path: '/porch',
  })
}

export default function PorchPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thenycclassifieds.com'

  const forumLd = {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForum',
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

  const porchFaqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'What is The Porch on NYC Classifieds?', acceptedAnswer: { '@type': 'Answer', text: 'The Porch is a neighborhood community board for verified NYC residents. Post questions, recommendations, alerts, lost pets, stoop sales, events, and more. Think of it as Nextdoor but with selfie + GPS verification.' } },
      { '@type': 'Question', name: 'How do I join The Porch?', acceptedAnswer: { '@type': 'Answer', text: 'Sign up on NYC Classifieds (free), verify your address with a live selfie + GPS, and you can post on The Porch in your neighborhood immediately. Every user is confirmed to their actual address.' } },
      { '@type': 'Question', name: 'Is The Porch free to use?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The Porch is 100% free for all verified NYC residents. Post as much as you want. No fees, no premium tiers.' } },
    ],
  }
  const porchSpeakLd = speakableSchema({ url: '/porch' })

  return (
    <>
      <PorchRedirect />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(forumLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(porchFaqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(porchSpeakLd) }} />
      <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>}>
        <PorchClient />
      </Suspense>
    </>
  )
}
