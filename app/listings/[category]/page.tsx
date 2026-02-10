import type { Metadata } from 'next'
import { Suspense } from 'react'
import CategoryClient from './CategoryClient'

const categoryNames: Record<string, string> = {
  'for-sale': 'For Sale',
  'housing': 'Housing',
  'services': 'Services',
  'jobs': 'Jobs',
  'community': 'Community',
  'gigs': 'Gigs',
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params
  const name = categoryNames[category] || category
  return { title: `${name} — Browse Listings` }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  return (
    <Suspense fallback={<div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>}>
      <CategoryClient category={category} />
    </Suspense>
  )
}
