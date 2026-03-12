'use client'

import BrowsePage from '@/app/components/BrowsePage'
import PageDescription from '@/app/components/PageDescription'
import { boroughBySlug, categoryBySlug, findNeighborhood, slugify } from '@/lib/data'
import { getLongTailH1 } from '@/lib/page-content'

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
      title={getLongTailH1({ categorySlug: cat.slug, subcategoryName: subName, subcategorySlug, neighborhood: nh.name, borough: b.name })}
      description={
        <PageDescription
          categorySlug={cat.slug}
          categoryName={cat.name}
          subcategorySlug={subcategorySlug}
          subcategoryName={subName}
          neighborhood={nh.name}
          neighborhoodHref={`/${b.slug}/${neighborhoodSlug}`}
          borough={b.name}
        />
      }
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
