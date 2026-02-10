'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import VerifiedBadge from '@/app/components/VerifiedBadge'

interface User {
  id: number
  email: string
  name: string
  verified: boolean
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

export default function AccountClient() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
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
        return fetch(`/api/listings?user=${d.user.id}`)
      })
      .then(r => r?.json())
      .then(d => {
        if (d?.listings) setListings(d.listings)
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

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Profile */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        paddingBottom: '2rem',
        borderBottom: '1px solid #e2e8f0',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#475569',
        }}>
          {user.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user.name}</h1>
            {user.verified && <VerifiedBadge size="md" />}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.875rem' }}>{user.email}</div>
        </div>
        <button onClick={handleLogout} style={{
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0',
          backgroundColor: '#fff',
          color: '#64748b',
          fontSize: '0.875rem',
          cursor: 'pointer',
        }}>
          Log out
        </button>
      </div>

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
        }}>
          You haven&apos;t posted any listings yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
