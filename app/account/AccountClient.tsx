'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import VerifiedBadge from '@/app/components/VerifiedBadge'
import { porchPostTypeBySlug } from '@/lib/data'

interface User {
  id: number
  email: string
  name: string
  verified: boolean
  role: string
  account_type: string | null
  business_name: string | null
  business_slug: string | null
  business_category: string | null
  website: string | null
  phone: string | null
  business_description: string | null
  hours: Record<string, string> | null
  service_area: string[] | null
  selfie_url: string | null
  address: string | null
}

interface Listing {
  id: number
  title: string
  price: number | null
  images: string[]
  status: string
  category_slug: string
  created_at: string
}

interface PorchPost {
  id: number
  post_type: string
  title: string
  body: string
  borough_slug: string
  neighborhood_slug: string
  created_at: string
  reply_count: number
}

export default function AccountClient() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [porchPosts, setPorchPosts] = useState<PorchPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth')
      .then(r => r.json())
      .then(d => {
        if (!d.authenticated) {
          router.push('/login')
          return
        }
        setUser(d.user)
        // Fetch listings and porch posts in parallel
        return Promise.all([
          fetch(`/api/listings?user=${d.user.id}`).then(r => r.json()),
          fetch(`/api/porch?user=${d.user.id}`).then(r => r.json()),
        ]).then(([listingsData, porchData]) => {
          if (listingsData?.listings) setListings(listingsData.listings)
          if (porchData?.posts) setPorchPosts(porchData.posts)
        })
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false))
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    })
    router.push('/')
  }

  const handleDelete = async (listingId: number) => {
    if (!confirm('Remove this listing?')) return
    await fetch(`/api/listings/${listingId}`, { method: 'DELETE' })
    setListings(prev => prev.filter(l => l.id !== listingId))
  }

  const handleMarkSold = async (listingId: number) => {
    await fetch(`/api/listings/${listingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'sold' }),
    })
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, status: 'sold' } : l))
  }

  if (loading) return <main style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</main>
  if (!user) return null

  const neighborhood = user.address?.split(',')[0]?.trim() || null
  const isBusiness = user.account_type === 'business'

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Profile Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        marginBottom: '2rem',
        paddingBottom: '2rem',
        borderBottom: '1px solid #e2e8f0',
      }}>
        {/* Avatar */}
        {user.selfie_url ? (
          <img
            src={user.selfie_url}
            alt={user.name}
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
        ) : (
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#475569',
            flexShrink: 0,
          }}>
            {user.name?.[0]?.toUpperCase() || '?'}
          </div>
        )}

        <div style={{ flex: 1 }}>
          {/* Name + verified */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{user.name}</h1>
            {user.verified && <VerifiedBadge size="md" />}
          </div>

          {/* Neighborhood */}
          {neighborhood && (
            <div style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '0.25rem' }}>
              {neighborhood}
            </div>
          )}

          {/* Email */}
          <div style={{ color: '#64748b', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>{user.email}</div>

          {/* Account type badge */}
          <span style={{
            display: 'inline-block',
            fontSize: '0.7rem',
            fontWeight: 600,
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            backgroundColor: isBusiness ? '#eff6ff' : '#f0fdf4',
            color: isBusiness ? '#1d4ed8' : '#16a34a',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          }}>
            {isBusiness ? 'Business' : 'Personal'}
          </span>
        </div>

        <button onClick={handleLogout} style={{
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0',
          backgroundColor: '#fff',
          color: '#64748b',
          fontSize: '0.875rem',
          cursor: 'pointer',
          flexShrink: 0,
        }}>
          Log out
        </button>
      </div>

      {/* Business Info Section */}
      {isBusiness && user.business_name && (
        <div style={{
          marginBottom: '2rem',
          paddingBottom: '2rem',
          borderBottom: '1px solid #e2e8f0',
        }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>Business Info</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ color: '#64748b' }}>Name: </span>
              <span style={{ fontWeight: 600 }}>{user.business_name}</span>
            </div>
            {user.business_category && (
              <div>
                <span style={{ color: '#64748b' }}>Category: </span>
                <span>{user.business_category}</span>
              </div>
            )}
            {user.website && (
              <div>
                <span style={{ color: '#64748b' }}>Website: </span>
                <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>
                  {user.website}
                </a>
              </div>
            )}
            {user.phone && (
              <div>
                <span style={{ color: '#64748b' }}>Phone: </span>
                <span>{user.phone}</span>
              </div>
            )}
            {user.business_description && (
              <div>
                <span style={{ color: '#64748b' }}>About: </span>
                <span>{user.business_description}</span>
              </div>
            )}
            {user.hours && Object.keys(user.hours).length > 0 && (
              <div>
                <span style={{ color: '#64748b' }}>Hours: </span>
                <span>{Object.entries(user.hours).map(([day, hrs]) => `${day}: ${hrs}`).join(' · ')}</span>
              </div>
            )}
            {user.service_area && user.service_area.length > 0 && (
              <div>
                <span style={{ color: '#64748b' }}>Service Area: </span>
                <span>{user.service_area.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* My Listings */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>My Listings</h2>
        <Link href="/listings/new" style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#2563eb',
          color: '#fff',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 600,
        }}>
          Post New
        </Link>
      </div>

      {listings.length === 0 ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#94a3b8',
          border: '1px dashed #e2e8f0',
          borderRadius: '0.75rem',
          marginBottom: '2rem',
        }}>
          You haven&apos;t posted any listings yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          {listings.map(listing => (
            <div key={listing.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '0.5rem',
                backgroundColor: '#f1f5f9',
                flexShrink: 0,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {listing.images[0] ? (
                  <img src={listing.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#94a3b8' }}>&#128247;</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <Link href={`/listings/${listing.category_slug}/${listing.id}`} style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  {listing.title}
                </Link>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#16a34a' }}>
                    {listing.price != null ? `$${(listing.price / 100).toLocaleString()}` : 'Free'}
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '9999px',
                    backgroundColor: listing.status === 'active' ? '#f0fdf4' : listing.status === 'sold' ? '#fef3c7' : '#fee2e2',
                    color: listing.status === 'active' ? '#16a34a' : listing.status === 'sold' ? '#d97706' : '#dc2626',
                    fontWeight: 600,
                  }}>
                    {listing.status}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {listing.status === 'active' && (
                  <button onClick={() => handleMarkSold(listing.id)} style={smallBtnStyle}>
                    Mark sold
                  </button>
                )}
                <button onClick={() => handleDelete(listing.id)} style={{ ...smallBtnStyle, color: '#dc2626' }}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Porch Posts */}
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>My Porch Posts</h2>
      </div>

      {porchPosts.length === 0 ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#94a3b8',
          border: '1px dashed #e2e8f0',
          borderRadius: '0.75rem',
        }}>
          You haven&apos;t posted on the Porch yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {porchPosts.map(post => {
            const typeInfo = porchPostTypeBySlug[post.post_type]
            return (
              <Link key={post.id} href={`/porch/${post.id}`} style={{
                display: 'block',
                padding: '1rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                textDecoration: 'none',
                color: 'inherit',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  {typeInfo && (
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      padding: '0.125rem 0.5rem',
                      borderRadius: '9999px',
                      backgroundColor: `${typeInfo.color}15`,
                      color: typeInfo.color,
                    }}>
                      {typeInfo.icon} {typeInfo.name}
                    </span>
                  )}
                  {post.reply_count > 0 && (
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {post.reply_count} {post.reply_count === 1 ? 'reply' : 'replies'}
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{post.title}</div>
                <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>
                  {post.body.length > 120 ? post.body.slice(0, 120) + '...' : post.body}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}

const smallBtnStyle: React.CSSProperties = {
  padding: '0.375rem 0.75rem',
  borderRadius: '0.375rem',
  border: '1px solid #e2e8f0',
  backgroundColor: '#fff',
  fontSize: '0.75rem',
  cursor: 'pointer',
  color: '#475569',
}
