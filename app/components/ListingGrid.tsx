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
  users: { name: string; verified: boolean }
}

interface Props {
  listings: Listing[]
}

export default function ListingGrid({ listings }: Props) {
  if (listings.length === 0) {
    return (
      <div style={{
        padding: '3rem',
        textAlign: 'center',
        color: '#94a3b8',
        border: '1px dashed #e2e8f0',
        borderRadius: '0.75rem',
      }}>
        No listings found
      </div>
    )
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '1rem',
    }}>
      {listings.map(listing => (
        <ListingCard key={listing.id} {...listing} />
      ))}
    </div>
  )
}
