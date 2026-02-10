import type { Metadata } from 'next'
import { Suspense } from 'react'
import { categories, categoryBySlug, slugify } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'
import SubcategoryPageClient from './SubcategoryPageClient'
import ListingDetailClient from './ListingDetailClient'

export const dynamicParams = true

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: { params: Promise<{ category: string; subcategory: string }> }): Promise<Metadata> {
  const { category, subcategory } = await params
  const cat = categoryBySlug[category]
  const subName = cat?.subs.find(s => slugify(s) === subcategory)

  if (subName) {
    const catName = cat?.name || category
    return buildMetadata({
      title: `${subName} in New York City — Free ${subName} Listings in ${catName}`,
      description: `Browse free ${subName.toLowerCase()} listings in ${catName.toLowerCase()} in New York City. Post for free. Find ${subName.toLowerCase()} near you from geo-verified NYC locals. Manhattan, Brooklyn, Queens, Bronx & Staten Island.`,
      path: `/listings/${category}/${subcategory}`,
    })
  }

  return { title: `Listing #${subcategory}` }
}

export default async function SubcategoryOrDetailPage({ params }: { params: Promise<{ category: string; subcategory: string }> }) {
  const { category, subcategory } = await params
  const cat = categoryBySlug[category]
  const isSubcategory = cat?.subs.some(s => slugify(s) === subcategory)

  if (isSubcategory) {
    const subName = cat?.subs.find(s => slugify(s) === subcategory) || subcategory
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thenycclassifieds.com'

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${subName} in New York City`,
      description: `Free ${subName.toLowerCase()} listings in ${cat?.name.toLowerCase()} in New York City from verified locals.`,
      url: `${siteUrl}/listings/${category}/${subcategory}`,
      isPartOf: { '@type': 'WebSite', name: 'The NYC Classifieds' },
    }

    const breadcrumbLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: cat?.name, item: `${siteUrl}/listings/${category}` },
        { '@type': 'ListItem', position: 3, name: subName, item: `${siteUrl}/listings/${category}/${subcategory}` },
      ],
    }

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
        <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>}>
          <SubcategoryPageClient categorySlug={category} subcategorySlug={subcategory} />
        </Suspense>
      </>
    )
  }

  return (
    <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>}>
      <ListingDetailClient id={subcategory} />
    </Suspense>
  )
}
