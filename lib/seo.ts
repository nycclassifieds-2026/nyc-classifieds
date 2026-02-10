import type { Metadata } from 'next'

const SITE_NAME = 'The NYC Classifieds'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nycclassifieds.com'
const SITE_DESC = 'Free local classifieds for New York City. Buy, sell, find housing, jobs, and services from real, geo-verified New Yorkers.'

// ─── Metadata builder ───

interface SeoOptions {
  title: string
  description: string
  path: string
  type?: 'website' | 'article'
  noIndex?: boolean
}

export function buildMetadata({ title, description, path, type = 'website', noIndex }: SeoOptions): Metadata {
  const url = `${SITE_URL}${path}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    ...(noIndex && { robots: { index: false, follow: false } }),
  }
}

// ─── JSON-LD Schemas ───

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESC,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESC,
    areaServed: {
      '@type': 'City',
      name: 'New York',
      sameAs: 'https://en.wikipedia.org/wiki/New_York_City',
    },
  }
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      ...items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: item.name,
        item: `${SITE_URL}${item.url}`,
      })),
    ],
  }
}

export function collectionPageSchema(opts: {
  name: string
  description: string
  url: string
  items?: { name: string; url: string }[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}${opts.url}`,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    ...(opts.items && opts.items.length > 0 && {
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: opts.items.length,
        itemListElement: opts.items.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          url: `${SITE_URL}${item.url}`,
        })),
      },
    }),
  }
}

export function placeSchema(opts: {
  name: string
  borough?: string
  description: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}${opts.url}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: opts.borough || 'New York',
      addressRegion: 'NY',
      addressCountry: 'US',
    },
    containedInPlace: {
      '@type': 'City',
      name: 'New York',
      sameAs: 'https://en.wikipedia.org/wiki/New_York_City',
    },
  }
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function discussionForumSchema(opts: {
  name: string
  description: string
  url: string
  borough?: string
  neighborhood?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    headline: opts.name,
    description: opts.description,
    url: `${SITE_URL}${opts.url}`,
    author: { '@type': 'Organization', name: SITE_NAME },
    ...(opts.neighborhood && {
      spatialCoverage: {
        '@type': 'Place',
        name: `${opts.neighborhood}${opts.borough ? `, ${opts.borough}` : ''}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: opts.borough || 'New York',
          addressRegion: 'NY',
          addressCountry: 'US',
        },
      },
    }),
  }
}

// ─── Helpers ───

export function jsonLdScript(schema: Record<string, unknown> | Record<string, unknown>[]) {
  const schemas = Array.isArray(schema) ? schema : [schema]
  return schemas.map(s => JSON.stringify(s))
}

export { SITE_NAME, SITE_URL }
