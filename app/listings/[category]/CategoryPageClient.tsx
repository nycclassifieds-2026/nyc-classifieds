'use client'

import BrowsePage from '@/app/components/BrowsePage'
import { categoryBySlug } from '@/lib/data'

export default function CategoryPageClient({ categorySlug }: { categorySlug: string }) {
  const cat = categoryBySlug[categorySlug]
  if (!cat) {
    return (
      <main style={{ maxWidth: '1050px', margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>Category not found</h1>
      </main>
    )
  }

  return (
    <BrowsePage
      title={`${cat.name} in New York City`}
      breadcrumbs={[{ label: cat.name, href: `/listings/${cat.slug}` }]}
      category={cat}
    />
  )
}
