'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ListingGrid from '@/app/components/ListingGrid'

const categoryMeta: Record<string, { name: string; subcategories: string[] }> = {
  'for-sale': { name: 'For Sale', subcategories: ['Electronics', 'Furniture', 'Clothing', 'Vehicles', 'Sports & Outdoors', 'Books & Media', 'Toys & Games', 'Other'] },
  'housing': { name: 'Housing', subcategories: ['Apartments', 'Rooms', 'Sublets', 'Real Estate', 'Parking', 'Storage'] },
  'services': { name: 'Services', subcategories: ['Home Repair', 'Cleaning', 'Tutoring', 'Beauty', 'Legal', 'Financial', 'Tech', 'Other'] },
  'jobs': { name: 'Jobs', subcategories: ['Full-time', 'Part-time', 'Freelance', 'Internships'] },
  'community': { name: 'Community', subcategories: ['Events', 'Groups', 'Lost & Found', 'Volunteers', 'Announcements'] },
  'gigs': { name: 'Gigs', subcategories: ['Quick Tasks', 'Events', 'Moving', 'Delivery', 'Other'] },
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

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

export default function CategoryClient({ category }: { category: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest')
  const [subcategory, setSubcategory] = useState(searchParams.get('subcategory') || '')
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'))

  const meta = categoryMeta[category]

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ category, sort, page: String(page) })
    if (subcategory) params.set('subcategory', subcategory)

    fetch(`/api/listings?${params}`)
      .then(r => r.json())
      .then(data => {
        setListings(data.listings || [])
        setTotal(data.total || 0)
      })
      .catch(() => setListings([]))
      .finally(() => setLoading(false))
  }, [category, sort, subcategory, page])

  if (!meta) {
    return (
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Category not found</h1>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{meta.name}</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{total} listing{total !== 1 ? 's' : ''}</p>
        </div>
        <a href="/listings/new" style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#2563eb',
          color: '#fff',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 600,
        }}>
          Post Listing
        </a>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <select
          value={subcategory}
          onChange={e => { setSubcategory(e.target.value); setPage(1) }}
          style={selectStyle}
        >
          <option value="">All subcategories</option>
          {meta.subcategories.map(s => (
            <option key={s} value={slugify(s)}>{s}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={e => { setSort(e.target.value); setPage(1) }}
          style={selectStyle}
        >
          <option value="newest">Newest first</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
      ) : (
        <ListingGrid listings={listings} />
      )}

      {/* Pagination */}
      {total > 24 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            style={pageBtnStyle}
          >
            Previous
          </button>
          <span style={{ padding: '0.5rem 1rem', color: '#64748b', fontSize: '0.875rem' }}>
            Page {page}
          </span>
          <button
            disabled={listings.length < 24}
            onClick={() => setPage(p => p + 1)}
            style={pageBtnStyle}
          >
            Next
          </button>
        </div>
      )}
    </main>
  )
}

const selectStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderRadius: '0.5rem',
  border: '1px solid #e2e8f0',
  fontSize: '0.875rem',
  backgroundColor: '#fff',
  outline: 'none',
}

const pageBtnStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  borderRadius: '0.5rem',
  border: '1px solid #e2e8f0',
  backgroundColor: '#fff',
  cursor: 'pointer',
  fontSize: '0.875rem',
}
