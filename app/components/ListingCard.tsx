'use client'

import Link from 'next/link'

interface ListingCardProps {
  id: number
  title: string
  price: number | null
  images: string[]
  location: string | null
  category_slug: string
  created_at: string
  users: { name: string; verified: boolean }
}

export default function ListingCard({ id, title, price, images, location, category_slug, created_at, users }: ListingCardProps) {
  const timeAgo = getTimeAgo(created_at)

  return (
    <Link href={`/listings/${category_slug}/${id}`} style={{
      display: 'block',
      border: '1px solid #e2e8f0',
      borderRadius: '0.75rem',
      overflow: 'hidden',
      backgroundColor: '#fff',
      transition: 'box-shadow 0.15s',
    }}>
      <div style={{
        width: '100%',
        aspectRatio: '4/3',
        backgroundColor: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {images[0] ? (
          <img
            src={images[0]}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ color: '#94a3b8', fontSize: '2rem' }}>&#128247;</span>
        )}
      </div>
      <div style={{ padding: '0.75rem' }}>
        <div style={{ fontWeight: 700, fontSize: '1.125rem', color: '#0f172a', marginBottom: '0.25rem' }}>
          {price != null ? `$${(price / 100).toLocaleString()}` : 'Free'}
        </div>
        <div style={{
          fontSize: '0.875rem',
          color: '#334155',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginBottom: '0.5rem',
        }}>
          {title}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
          <span>{location || 'NYC'}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {users.verified && <span style={{ color: '#2563eb' }} title="Verified">&#10003;</span>}
            {timeAgo}
          </span>
        </div>
      </div>
    </Link>
  )
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}
