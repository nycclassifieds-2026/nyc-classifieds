'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import VerifiedBadge from '@/app/components/VerifiedBadge'
import { porchPostTypeBySlug, slugify, businessCategories } from '@/lib/data'

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
  business_photo: string | null
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
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [bizPhotoUploading, setBizPhotoUploading] = useState(false)
  const [bizPhotoFile, setBizPhotoFile] = useState<File | null>(null)
  const [bizPhotoPreview, setBizPhotoPreview] = useState<string | null>(null)
  const [upgradeForm, setUpgradeForm] = useState({
    business_name: '',
    business_category: '',
    business_description: '',
    website: '',
    phone: '',
  })

  useEffect(() => {
    fetch('/api/auth')
      .then(r => r.json())
      .then(d => {
        if (!d.authenticated) {
          router.push('/login')
          return
        }
        setUser(d.user)
        setUnreadCount(d.unreadMessages || 0)
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

  const handleUpgrade = async () => {
    if (!upgradeForm.business_name.trim() || !upgradeForm.business_category) return
    setUpgrading(true)
    try {
      const res = await fetch('/api/account/upgrade-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(upgradeForm),
      })
      const data = await res.json()
      if (data.ok) {
        // Upload business photo if one was selected
        if (bizPhotoFile) {
          try {
            const formData = new FormData()
            formData.append('file', bizPhotoFile)
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
            const uploadData = await uploadRes.json()
            if (uploadRes.ok) {
              await fetch('/api/account/photo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: uploadData.url, type: 'business' }),
              })
            }
          } catch { /* photo upload is best-effort */ }
        }
        // Refresh user data
        const authRes = await fetch('/api/auth')
        const authData = await authRes.json()
        if (authData.authenticated) setUser(authData.user)
        setShowUpgrade(false)
        setBizPhotoFile(null)
        setBizPhotoPreview(null)
      } else {
        alert(data.error || 'Failed to upgrade')
      }
    } catch {
      alert('Failed to upgrade')
    } finally {
      setUpgrading(false)
    }
  }

  const handleBusinessPhotoUpload = async (file: File) => {
    setBizPhotoUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) throw new Error(uploadData.error)

      const saveRes = await fetch('/api/account/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: uploadData.url, type: 'business' }),
      })
      const saveData = await saveRes.json()
      if (!saveRes.ok) throw new Error(saveData.error)

      setUser(prev => prev ? { ...prev, business_photo: uploadData.url } : prev)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setBizPhotoUploading(false)
    }
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
        {/* Avatar — locked to verification selfie */}
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

          {/* Account type badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              display: 'inline-block',
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}>
              Personal
            </span>
            {isBusiness && (
              <span style={{
                display: 'inline-block',
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}>
                + Business
              </span>
            )}
            {!isBusiness && (
              <button
                onClick={() => setShowUpgrade(true)}
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  border: '1px solid #2563eb',
                  backgroundColor: '#fff',
                  color: '#2563eb',
                  cursor: 'pointer',
                }}
              >
                + Add Business Profile
              </button>
            )}
          </div>
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

      {/* My Messages */}
      <Link href="/messages" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem',
        marginBottom: '2rem',
        border: '1px solid #e2e8f0',
        borderRadius: '0.75rem',
        textDecoration: 'none',
        color: 'inherit',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>My Messages</span>
        </div>
        {unreadCount > 0 ? (
          <span style={{
            backgroundColor: '#dc2626',
            color: '#fff',
            borderRadius: '9999px',
            padding: '0.125rem 0.5rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            minWidth: '20px',
            textAlign: 'center',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        )}
      </Link>

      {/* Business Info Section */}
      {isBusiness && user.business_name && (
        <div style={{
          marginBottom: '2rem',
          paddingBottom: '2rem',
          borderBottom: '1px solid #e2e8f0',
        }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>Business Profile</h2>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
            {/* Business photo */}
            <label style={{ cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleBusinessPhotoUpload(file)
                  e.target.value = ''
                }}
              />
              {user.business_photo ? (
                <img
                  src={user.business_photo}
                  alt={user.business_name || 'Business'}
                  style={{
                    width: '56px', height: '56px', borderRadius: '0.5rem',
                    objectFit: 'cover', opacity: bizPhotoUploading ? 0.5 : 1,
                  }}
                />
              ) : (
                <div style={{
                  width: '56px', height: '56px', borderRadius: '0.5rem',
                  backgroundColor: '#eff6ff', border: '1px dashed #93c5fd',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: '2px',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span style={{ fontSize: '0.5rem', color: '#2563eb', fontWeight: 600 }}>Add logo</span>
                </div>
              )}
            </label>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{user.business_name}</div>
              {user.business_category && (
                <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>{user.business_category}</div>
              )}
            </div>
          </div>
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
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <Link href={`/listings/${listing.category_slug}/${listing.id}`} style={smallLinkStyle}>
                    View
                  </Link>
                  <Link href={`/listings/edit/${listing.id}`} style={smallLinkStyle}>
                    Edit
                  </Link>
                  <button onClick={() => {
                    const url = `${window.location.origin}/listings/${listing.category_slug}/${listing.id}`
                    if (navigator.share) {
                      navigator.share({ title: listing.title, url })
                    } else {
                      navigator.clipboard.writeText(url)
                      alert('Link copied!')
                    }
                  }} style={smallLinkStyle}>
                    Share
                  </button>
                  {listing.status === 'active' && (
                    <button onClick={() => handleMarkSold(listing.id)} style={smallLinkStyle}>
                      Mark sold
                    </button>
                  )}
                  <button onClick={() => handleDelete(listing.id)} style={{ ...smallLinkStyle, color: '#dc2626' }}>
                    Remove
                  </button>
                </div>
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
              <Link key={post.id} href={`/porch/post/${post.id}/${slugify(post.title)}`} style={{
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

      {/* Upgrade to Business Modal */}
      {showUpgrade && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }} onClick={() => setShowUpgrade(false)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#fff', borderRadius: '1rem', padding: '2rem',
              maxWidth: '480px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Add Business Profile</h2>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1.5rem' }}>
              Add a business profile to your account. Your personal profile stays as your main identity — you&apos;ll choose which to post as. Since you&apos;re already verified, this is instant.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Business Photo Upload */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ cursor: 'pointer', flexShrink: 0 }}>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setBizPhotoFile(file)
                        setBizPhotoPreview(URL.createObjectURL(file))
                      }
                      e.target.value = ''
                    }}
                  />
                  {bizPhotoPreview ? (
                    <img
                      src={bizPhotoPreview}
                      alt="Business photo"
                      style={{
                        width: '64px', height: '64px', borderRadius: '0.75rem',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '64px', height: '64px', borderRadius: '0.75rem',
                      backgroundColor: '#eff6ff', border: '2px dashed #93c5fd',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexDirection: 'column', gap: '2px',
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </div>
                  )}
                </label>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>Business Photo</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Logo, storefront, or headshot</div>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Business Name *</label>
                <input
                  value={upgradeForm.business_name}
                  onChange={e => setUpgradeForm(f => ({ ...f, business_name: e.target.value }))}
                  placeholder="e.g. Maria's Cleaning Service"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Category *</label>
                <select
                  value={upgradeForm.business_category}
                  onChange={e => setUpgradeForm(f => ({ ...f, business_category: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="">Select a category</option>
                  {businessCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={upgradeForm.business_description}
                  onChange={e => setUpgradeForm(f => ({ ...f, business_description: e.target.value }))}
                  placeholder="Tell NYC about your business"
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={labelStyle}>Website</label>
                <input
                  value={upgradeForm.website}
                  onChange={e => setUpgradeForm(f => ({ ...f, website: e.target.value }))}
                  placeholder="https://yourbusiness.com"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Phone</label>
                <input
                  value={upgradeForm.phone}
                  onChange={e => setUpgradeForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="(212) 555-1234"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  onClick={() => setShowUpgrade(false)}
                  style={{
                    flex: 1, padding: '0.75rem', borderRadius: '0.5rem',
                    border: '1px solid #e2e8f0', backgroundColor: '#fff',
                    color: '#475569', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading || !upgradeForm.business_name.trim() || !upgradeForm.business_category}
                  style={{
                    flex: 1, padding: '0.75rem', borderRadius: '0.5rem',
                    border: 'none', backgroundColor: '#2563eb', color: '#fff',
                    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                    opacity: (upgrading || !upgradeForm.business_name.trim() || !upgradeForm.business_category) ? 0.5 : 1,
                  }}
                >
                  {upgrading ? 'Adding...' : 'Add Business Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: '#334155',
  marginBottom: '0.375rem',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem 0.75rem',
  borderRadius: '0.5rem',
  border: '1px solid #e2e8f0',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
}

const smallLinkStyle: React.CSSProperties = {
  padding: '0.25rem 0.625rem',
  borderRadius: '0.375rem',
  border: '1px solid #e2e8f0',
  backgroundColor: '#fff',
  fontSize: '0.75rem',
  cursor: 'pointer',
  color: '#2563eb',
  fontWeight: 500,
  textDecoration: 'none',
  display: 'inline-block',
}
