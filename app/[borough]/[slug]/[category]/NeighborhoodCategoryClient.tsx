'use client'

import BrowsePage from '@/app/components/BrowsePage'
import { boroughBySlug, categoryBySlug, findNeighborhood } from '@/lib/data'

export default function NeighborhoodCategoryClient({ boroughSlug, neighborhoodSlug, categorySlug }: { boroughSlug: string; neighborhoodSlug: string; categorySlug: string }) {
  const b = boroughBySlug[boroughSlug]
  const nh = findNeighborhood(boroughSlug, neighborhoodSlug)
  const cat = categoryBySlug[categorySlug]
  if (!b || !nh || !cat) return null

  return (
    <BrowsePage
      title={`${cat.name} in ${nh.name}, ${b.name}`}
      breadcrumbs={[
        { label: b.name, href: `/${b.slug}` },
        { label: nh.name, href: `/${b.slug}/${neighborhoodSlug}` },
        { label: cat.name, href: `/${b.slug}/${neighborhoodSlug}/${cat.slug}` },
      ]}
      category={cat}
      borough={b.name}
      neighborhood={nh.name}
    />
  )
}
