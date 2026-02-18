'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BusinessProfileClient from './BusinessProfileClient'

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function BusinessProfilePage({ params }: { params: Promise<{ params: string[] }> }) {
  const { params: segments } = use(params)

  // /business/[category]/[slug] — new canonical URL
  if (segments.length === 2) {
    return <BusinessProfileClient slug={segments[1]} category={segments[0]} />
  }

  // /business/[slug] — old URL, redirect client-side
  if (segments.length === 1) {
    return <OldUrlRedirect slug={segments[0]} />
  }

  // Invalid URL
  return (
    <main style={{ maxWidth: '1050px', margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>Page not found</h1>
      <a href="/business" style={{ color: '#2563eb', fontSize: '0.875rem', marginTop: '1rem', display: 'inline-block' }}>
        Browse Business Directory
      </a>
    </main>
  )
}

function OldUrlRedirect({ slug }: { slug: string }) {
  const router = useRouter()

  useEffect(() => {
    fetch(`/api/business/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.business) {
          const catSlug = data.business.business_category ? slugify(data.business.business_category) : 'other'
          router.replace(`/business/${catSlug}/${data.business.business_slug}`)
        } else {
          router.replace('/business')
        }
      })
      .catch(() => router.replace('/business'))
  }, [slug, router])

  return <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>Redirecting...</div>
}
