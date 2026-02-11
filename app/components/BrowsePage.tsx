'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ListingGrid, { getDisplayMode } from './ListingGrid'
import HomepageAd from './HomepageAd'
import { type Category, slugify } from '@/lib/data'

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

interface BrowsePageProps {
  title: string
  breadcrumbs: { label: string; href: string }[]
  category?: Category
  subcategorySlug?: string
  borough?: string
  neighborhood?: string
  subcategories?: string[]
  categorySlug?: string
}

// Categories where price sort doesn't make sense
const hidePriceSortCategories = new Set(['jobs', 'services', 'gigs', 'resumes', 'personals', 'barter'])

export default function BrowsePage({
  title,
  breadcrumbs,
  category,
  subcategorySlug,
  borough,
  neighborhood,
  subcategories,
  categorySlug,
}: BrowsePageProps) {
  const [listings, setListings] = useState<Listing[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('newest')
  const [activeSub, setActiveSub] = useState(subcategorySlug || '')
  const [page, setPage] = useState(1)

  const effectiveCategorySlug = categorySlug || category?.slug
  const subs = subcategories || category?.subs || []
  const displayMode = getDisplayMode(effectiveCategorySlug)
  const showPriceSort = !hidePriceSortCategories.has(effectiveCategorySlug || '')
  const useDropdown = subs.length > 10

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ sort, page: String(page) })
    if (effectiveCategorySlug) params.set('category', effectiveCategorySlug)
    if (activeSub) params.set('subcategory', activeSub)
    if (borough) params.set('borough', borough)
    if (neighborhood) params.set('neighborhood', neighborhood)

    fetch(`/api/listings?${params}`)
      .then(r => r.json())
      .then(data => {
        setListings(data.listings || [])
        setTotal(data.total || 0)
      })
      .catch(() => setListings([]))
      .finally(() => setLoading(false))
  }, [effectiveCategorySlug, activeSub, borough, neighborhood, sort, page])

  return (
    <main style={{ maxWidth: '1050px', margin: '0 auto', padding: '24px 24px 32px' }}>
      {/* Breadcrumbs */}
      <nav style={{ display: 'flex', gap: '6px', fontSize: '0.75rem', color: '#6b7280', marginBottom: '16px', flexWrap: 'wrap' }}>
        <Link href="/" style={{ color: '#1a56db', textDecoration: 'none' }}>Home</Link>
        {breadcrumbs.map((bc, i) => (
          <span key={i}>
            <span style={{ margin: '0 2px' }}>/</span>
            {i === breadcrumbs.length - 1 ? (
              <span style={{ color: '#111827', fontWeight: 500 }}>{bc.label}</span>
            ) : (
              <Link href={bc.href} style={{ color: '#1a56db', textDecoration: 'none' }}>{bc.label}</Link>
            )}
          </span>
        ))}
      </nav>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#111827' }}>{title}</h1>
          <p style={{ color: '#6b7280', fontSize: '0.8125rem', marginTop: '2px' }}>
            {total} listing{total !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/listings/new" style={{
          backgroundColor: '#1a56db',
          color: '#ffffff',
          padding: '8px 20px',
          borderRadius: '6px',
          fontSize: '0.8125rem',
          fontWeight: 600,
        }}>
          Post
        </Link>
      </div>

      {/* Subcategory filter + sort */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
        {subs.length > 0 && !subcategorySlug && (
          useDropdown ? (
            <select
              value={activeSub}
              onChange={e => { setActiveSub(e.target.value); setPage(1) }}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                fontSize: '0.8125rem',
                backgroundColor: '#fff',
                color: '#374151',
                outline: 'none',
              }}
            >
              <option value="">All subcategories</option>
              {subs.map(s => (
                <option key={s} value={slugify(s)}>{s}</option>
              ))}
            </select>
          ) : (
            <>
              <button
                onClick={() => { setActiveSub(''); setPage(1) }}
                style={{
                  ...chipStyle,
                  backgroundColor: !activeSub ? '#1a56db' : 'transparent',
                  color: !activeSub ? '#fff' : '#374151',
                  border: !activeSub ? '1px solid #1a56db' : '1px solid #e5e7eb',
                }}
              >
                All
              </button>
              {subs.map(s => {
                const sSlug = slugify(s)
                const active = activeSub === sSlug
                return (
                  <button
                    key={s}
                    onClick={() => { setActiveSub(active ? '' : sSlug); setPage(1) }}
                    style={{
                      ...chipStyle,
                      backgroundColor: active ? '#1a56db' : 'transparent',
                      color: active ? '#fff' : '#374151',
                      border: active ? '1px solid #1a56db' : '1px solid #e5e7eb',
                    }}
                  >
                    {s}
                  </button>
                )
              })}
            </>
          )
        )}
        <div style={{ marginLeft: 'auto' }}>
          <select
            value={sort}
            onChange={e => { setSort(e.target.value); setPage(1) }}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              fontSize: '0.8125rem',
              backgroundColor: '#fff',
              color: '#374151',
              outline: 'none',
            }}
          >
            <option value="newest">Newest</option>
            {showPriceSort && <option value="price-low">Price: Low → High</option>}
            {showPriceSort && <option value="price-high">Price: High → Low</option>}
          </select>
        </div>
      </div>

      {/* Ad */}
      <div style={{ marginBottom: '16px' }}>
        <HomepageAd />
      </div>

      {/* Listings */}
      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>Loading...</div>
      ) : listings.length === 0 ? (
        <div style={{
          padding: '48px 24px',
          textAlign: 'center',
          border: '1px dashed #e5e7eb',
          borderRadius: '8px',
        }}>
          <p style={{ color: '#6b7280', fontSize: '0.9375rem', marginBottom: '12px' }}>
            No listings yet in {title.toLowerCase()}.
          </p>
          <Link href="/listings/new" style={{
            color: '#1a56db',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}>
            Be the first to post →
          </Link>
        </div>
      ) : (
        <ListingGrid
          listings={listings}
          mode={displayMode}
          hideCategoryPill={!!effectiveCategorySlug}
        />
      )}

      {/* Pagination */}
      {total > 24 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            style={{ ...pageBtnStyle, opacity: page <= 1 ? 0.4 : 1 }}
          >
            ← Previous
          </button>
          <span style={{ padding: '8px 12px', color: '#6b7280', fontSize: '0.8125rem' }}>
            Page {page}
          </span>
          <button
            disabled={listings.length < 24}
            onClick={() => setPage(p => p + 1)}
            style={{ ...pageBtnStyle, opacity: listings.length < 24 ? 0.4 : 1 }}
          >
            Next →
          </button>
        </div>
      )}
    </main>
  )
}

const chipStyle: React.CSSProperties = {
  padding: '5px 12px',
  borderRadius: '20px',
  fontSize: '0.75rem',
  fontWeight: 500,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

const pageBtnStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
  backgroundColor: '#fff',
  cursor: 'pointer',
  fontSize: '0.8125rem',
  color: '#374151',
  fontWeight: 500,
}
