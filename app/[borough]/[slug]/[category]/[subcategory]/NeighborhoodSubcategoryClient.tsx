'use client'

import BrowsePage from '@/app/components/BrowsePage'
import { boroughBySlug, categoryBySlug, findNeighborhood, slugify } from '@/lib/data'

export default function NeighborhoodSubcategoryClient({
  boroughSlug, neighborhoodSlug, categorySlug, subcategorySlug
}: {
  boroughSlug: string; neighborhoodSlug: string; categorySlug: string; subcategorySlug: string
}) {
  const b = boroughBySlug[boroughSlug]
  const nh = findNeighborhood(boroughSlug, neighborhoodSlug)
  const cat = categoryBySlug[categorySlug]
  const subName = cat?.subs.find(s => slugify(s) === subcategorySlug)
  if (!b || !nh || !cat || !subName) return null

  return (
    <BrowsePage
      title={`${subName} in ${nh.name}, ${b.name}`}
      breadcrumbs={[
        { label: b.name, href: `/${b.slug}` },
        { label: nh.name, href: `/${b.slug}/${neighborhoodSlug}` },
        { label: cat.name, href: `/${b.slug}/${neighborhoodSlug}/${cat.slug}` },
        { label: subName, href: `/${b.slug}/${neighborhoodSlug}/${cat.slug}/${subcategorySlug}` },
      ]}
      category={cat}
      subcategorySlug={subcategorySlug}
      borough={b.name}
      neighborhood={nh.name}
    />
  )
}
