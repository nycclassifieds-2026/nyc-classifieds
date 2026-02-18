'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function RedirectClient({ slug }: { slug: string }) {
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
