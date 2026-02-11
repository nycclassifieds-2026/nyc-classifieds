import type { Metadata } from 'next'
import { Suspense } from 'react'
import BusinessProfileClient from './BusinessProfileClient'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  return {
    title: `${name} | NYC Classifieds`,
    description: `${name} — verified NYC business on NYC Classifieds. View services, hours, photos, and contact info.`,
  }
}

function localBusinessSchema(slug: string) {
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    description: `${name} — verified NYC business on NYC Classifieds. View services, hours, photos, and contact info.`,
    url: `https://thenycclassifieds.com/business/${slug}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'New York',
      addressRegion: 'NY',
      addressCountry: 'US',
    },
  }
}

export default async function BusinessProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const schema = localBusinessSchema(slug)
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>}>
        <BusinessProfileClient slug={slug} />
      </Suspense>
    </>
  )
}
