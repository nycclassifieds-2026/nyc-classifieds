'use client'

import BrowsePage from '@/app/components/BrowsePage'
import { categoryBySlug, slugify } from '@/lib/data'

export default function SubcategoryPageClient({ categorySlug, subcategorySlug }: { categorySlug: string; subcategorySlug: string }) {
  const cat = categoryBySlug[categorySlug]
  const subName = cat?.subs.find(s => slugify(s) === subcategorySlug)

  if (!cat || !subName) {
    return (
      <main style={{ maxWidth: '1050px', margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>Not found</h1>
      </main>
    )
  }

  return (
    <BrowsePage
      title={`${subName} in New York City`}
      breadcrumbs={[
        { label: cat.name, href: `/listings/${cat.slug}` },
        { label: subName, href: `/listings/${cat.slug}/${subcategorySlug}` },
      ]}
      category={cat}
      subcategorySlug={subcategorySlug}
    />
  )
}
