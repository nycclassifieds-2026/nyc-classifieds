'use client'

import BrowsePage from '@/app/components/BrowsePage'
import { boroughBySlug, categoryBySlug } from '@/lib/data'

export default function BoroughCategoryClient({ boroughSlug, categorySlug }: { boroughSlug: string; categorySlug: string }) {
  const b = boroughBySlug[boroughSlug]
  const cat = categoryBySlug[categorySlug]
  if (!b || !cat) return null

  return (
    <BrowsePage
      title={`${cat.name} in ${b.name}`}
      breadcrumbs={[
        { label: b.name, href: `/${b.slug}` },
        { label: cat.name, href: `/${b.slug}/${cat.slug}` },
      ]}
      category={cat}
      borough={b.name}
    />
  )
}
