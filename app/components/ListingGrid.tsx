'use client'

import ListingCard from './ListingCard'

interface Listing {
  id: number
  title: string
  price: number | null
  images: string[]
  location: string | null
  category_slug: string
  created_at: string
  users: { name: string; verified: boolean; selfie_url?: string | null }
}

interface Props {
  listings: Listing[]
}

export default function ListingGrid({ listings }: Props) {
  if (listings.length === 0) {
    return (
      <div style={{
        padding: 'var(--sp-12)',
        textAlign: 'center',
        color: 'var(--gray-400)',
        border: '1px dashed var(--gray-200)',
        borderRadius: '8px',
        fontSize: '0.875rem',
      }}>
        No listings found
      </div>
    )
  }

  return (
    <div className="listing-grid" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: 'var(--sp-4)',
    }}>
      {listings.map(listing => (
        <ListingCard key={listing.id} {...listing} />
      ))}
    </div>
  )
}
