'use client'

import { useState, useEffect } from 'react'
import ListingGrid from '@/app/components/ListingGrid'

interface Listing {
  id: number
  title: string
  price: number | null
  images: string[]
  location: string | null
  category_slug: string
  created_at: string
  users: { name: string; verified: boolean }
}

export default function HomeListings() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/listings?page=1')
      .then(r => r.json())
      .then(d => setListings(d.listings || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
  }

  if (listings.length === 0) {
    return (
      <div style={{
        padding: '3rem',
        textAlign: 'center',
        color: '#94a3b8',
        border: '1px dashed #e2e8f0',
        borderRadius: '0.75rem',
      }}>
        No listings yet. Be the first to post!
      </div>
    )
  }

  return <ListingGrid listings={listings} />
}
