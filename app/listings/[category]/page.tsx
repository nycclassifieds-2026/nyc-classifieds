import type { Metadata } from 'next'
import { Suspense } from 'react'
import { categories, categoryBySlug, slugify } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'
import CategoryPageClient from './CategoryPageClient'

export async function generateStaticParams() {
  return categories.map(c => ({ category: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params
  const cat = categoryBySlug[category]
  if (!cat) return { title: 'Not Found' }

  const subList = cat.subs.slice(0, 8).join(', ')
  return buildMetadata({
    title: `${cat.name} in New York City — Free ${cat.name} Listings`,
    description: `Browse free ${cat.name.toLowerCase()} listings in New York City. ${subList}, and more. Post for free. All users are geo-verified real New Yorkers.`,
    path: `/listings/${cat.slug}`,
  })
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const cat = categoryBySlug[category]

  // JSON-LD for category page
  const subItems = cat?.subs.map(s => ({
    name: `${s} in NYC`,
    url: `/listings/${category}/${slugify(s)}`,
  })) || []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${cat?.name || category} in New York City`,
    description: `Browse free ${(cat?.name || category).toLowerCase()} listings across all five NYC boroughs.`,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nycclassifieds.com'}/listings/${category}`,
    isPartOf: { '@type': 'WebSite', name: 'The NYC Classifieds' },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: subItems.length,
      itemListElement: subItems.map((item, i) => ({
        '@type': 'ListItem', position: i + 1, name: item.name,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nycclassifieds.com'}${item.url}`,
      })),
    },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: process.env.NEXT_PUBLIC_SITE_URL || 'https://nycclassifieds.com' },
      { '@type': 'ListItem', position: 2, name: cat?.name || category, item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nycclassifieds.com'}/listings/${category}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>}>
        <CategoryPageClient categorySlug={category} />
      </Suspense>
    </>
  )
}
