import type { Metadata } from 'next'
import { Suspense } from 'react'
import BusinessProfileClient from './BusinessProfileClient'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  return {
    title: `${name} | NYC Classifieds`,
    description: `${name} — verified NYC business on NYC Classifieds. View services, hours, photos, and contact info.`,
  }
}

export default async function BusinessProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>}>
      <BusinessProfileClient slug={slug} />
    </Suspense>
  )
}
