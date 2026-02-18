'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ListingGrid from '@/app/components/ListingGrid'
import PreLaunchGate from '@/app/components/PreLaunchGate'

interface Business {
  id: number
  name: string
  business_name: string
  business_slug: string
  business_category: string | null
  business_description: string | null
  website: string | null
  phone: string | null
  hours: Record<string, { open: string; close: string; closed: boolean }> | null
  service_area: string[]
  photo_gallery: string[]
  selfie_url: string | null
  business_photo: string | null
  verified: boolean
  created_at: string
}

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

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hr = h % 12 || 12
  return `${hr}:${String(m).padStart(2, '0')} ${ampm}`
}

export default function BusinessProfileClient({ slug }: { slug: string }) {
  const [business, setBusiness] = useState<Business | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/business/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.business) {
          setBusiness(data.business)
          setListings(data.listings || [])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
  }

  if (!business) {
    return (
      <main style={{ maxWidth: '1050px', margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>Business not found</h1>
        <Link href="/" style={{ color: '#2563eb', fontSize: '0.875rem', marginTop: '1rem', display: 'inline-block' }}>
          Back to home
        </Link>
      </main>
    )
  }

  const bizAvatar = business.business_photo || business.selfie_url
  const allPhotos = [
    ...(business.business_photo ? [business.business_photo] : []),
    ...business.photo_gallery,
  ]

  // Schema.org LocalBusiness JSON-LD
  const dayMap: Record<string, string> = {
    Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday',
    Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
  }

  const openingHours = business.hours
    ? Object.entries(business.hours)
        .filter(([, v]) => !v.closed)
        .map(([day, v]) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: dayMap[day],
          opens: v.open,
          closes: v.close,
        }))
    : undefined

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.business_name,
    ...(business.business_category && { additionalType: business.business_category }),
    ...(business.business_description && { description: business.business_description }),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'New York',
      addressRegion: 'NY',
      addressCountry: 'US',
    },
    ...(business.phone && { telephone: business.phone }),
    ...(business.website && { url: business.website.startsWith('http') ? business.website : `https://${business.website}` }),
    ...(openingHours && openingHours.length > 0 && { openingHoursSpecification: openingHours }),
    ...(bizAvatar && { image: bizAvatar }),
    ...(business.service_area.length > 0 && {
      areaServed: business.service_area.map(n => ({
        '@type': 'Place',
        name: `${n}, New York, NY`,
      })),
    }),
  }

  return (
    <PreLaunchGate>
    <main style={{ maxWidth: '1050px', margin: '0 auto', padding: '24px 24px 48px' }}>
      {/* Responsive grid for mobile */}
      <style>{`.biz-grid { display: grid; grid-template-columns: 1fr 320px; gap: 32px; } @media (max-width: 768px) { .biz-grid { grid-template-columns: 1fr !important; } }`}</style>
      {/* Schema.org LocalBusiness */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '20px' }}>
        <Link href="/" style={{ color: '#2563eb' }}>Home</Link>
        <span style={{ margin: '0 6px' }}>/</span>
        <span style={{ color: '#111827', fontWeight: 500 }}>{business.business_name}</span>
      </nav>

      {/* Hero */}
      <div style={{
        display: 'flex', gap: '24px', marginBottom: '32px',
        flexWrap: 'wrap',
      }}>
        {/* Profile photo */}
        <div style={{
          width: '120px', height: '120px', borderRadius: '12px', overflow: 'hidden',
          backgroundColor: '#f3f4f6', flexShrink: 0,
        }}>
          {bizAvatar ? (
            <img src={bizAvatar} alt={business.business_name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '2rem', fontWeight: 700 }}>
              {business.business_name[0]}
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827' }}>
              {business.business_name}
            </h1>
            {business.verified && (
              <span style={{
                backgroundColor: '#dcfce7', color: '#16a34a', padding: '2px 8px',
                borderRadius: '4px', fontSize: '0.6875rem', fontWeight: 600,
              }}>
                Verified
              </span>
            )}
          </div>

          {business.business_category && (
            <p style={{ color: '#6b7280', fontSize: '0.9375rem', marginBottom: '8px' }}>
              {business.business_category}
            </p>
          )}

          {/* Contact row */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            {business.phone && (
              <a href={`tel:${business.phone}`} style={{ color: '#2563eb', fontSize: '0.875rem', fontWeight: 500 }}>
                {business.phone}
              </a>
            )}
            {business.website && (
              <a href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                target="_blank" rel="noopener noreferrer"
                style={{ color: '#2563eb', fontSize: '0.875rem', fontWeight: 500 }}>
                Website
              </a>
            )}
            {/* Message via listing — users can message through any listing below */}
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px' }} className="biz-grid">

        {/* Left column */}
        <div>
          {/* About */}
          {business.business_description && (
            <section style={{ marginBottom: '28px' }}>
              <h2 style={sectionHeading}>About</h2>
              <p style={{ color: '#374151', fontSize: '0.9375rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {business.business_description}
              </p>
            </section>
          )}

          {/* Photo Gallery */}
          {allPhotos.length > 0 && (
            <section style={{ marginBottom: '28px' }}>
              <h2 style={sectionHeading}>Photos</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                {allPhotos.map((url, i) => (
                  <div key={i} onClick={() => setSelectedPhoto(url)} style={{
                    aspectRatio: '1', borderRadius: '8px', overflow: 'hidden',
                    cursor: 'pointer', backgroundColor: '#f3f4f6',
                  }}>
                    <img src={url} alt={`${business.business_name} photo ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Listings */}
          <section>
            <h2 style={sectionHeading}>
              Listings {listings.length > 0 && <span style={{ color: '#6b7280', fontWeight: 400 }}>({listings.length})</span>}
            </h2>
            {listings.length > 0 ? (
              <ListingGrid listings={listings.map(l => ({ ...l, users: { name: business.name, verified: business.verified } }))} />
            ) : (
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No active listings.</p>
            )}
          </section>
        </div>

        {/* Right sidebar */}
        <div>
          {/* Hours */}
          {business.hours && (
            <div style={{ ...cardStyle, marginBottom: '16px' }}>
              <h3 style={cardHeading}>Hours</h3>
              {DAYS.map(day => {
                const h = business.hours?.[day]
                if (!h) return null
                const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
                const isToday = day === today
                return (
                  <div key={day} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '4px 0', fontSize: '0.8125rem',
                    fontWeight: isToday ? 600 : 400,
                    color: isToday ? '#111827' : '#374151',
                  }}>
                    <span>{day}</span>
                    <span style={{ color: h.closed ? '#dc2626' : undefined }}>
                      {h.closed ? 'Closed' : `${formatTime(h.open)} – ${formatTime(h.close)}`}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Service Area */}
          {business.service_area.length > 0 && (
            <div style={{ ...cardStyle, marginBottom: '16px' }}>
              <h3 style={cardHeading}>Service Area</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {business.service_area.map(n => (
                  <span key={n} style={{
                    padding: '3px 10px', borderRadius: '1rem', fontSize: '0.75rem',
                    backgroundColor: '#f3f4f6', color: '#374151', fontWeight: 500,
                  }}>
                    {n}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact Card */}
          <div style={cardStyle}>
            <h3 style={cardHeading}>Contact</h3>
            <p style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '4px' }}>
              {business.name}
            </p>
            {business.phone && (
              <a href={`tel:${business.phone}`} style={{ display: 'block', color: '#2563eb', fontSize: '0.875rem', marginBottom: '4px' }}>
                {business.phone}
              </a>
            )}
            {business.website && (
              <a href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', color: '#2563eb', fontSize: '0.875rem', marginBottom: '8px' }}>
                {business.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            {/* Messaging requires listing context — users message through listings */}
          </div>

          {/* Member since */}
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '12px', textAlign: 'center' }}>
            Member since {new Date(business.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Photo lightbox */}
      {selectedPhoto && (
        <div onClick={() => setSelectedPhoto(null)} style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <img src={selectedPhoto} alt="Full size" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '8px' }} />
        </div>
      )}
    </main>
    </PreLaunchGate>
  )
}

const sectionHeading: React.CSSProperties = {
  fontSize: '1.125rem', fontWeight: 700, color: '#111827',
  marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb',
}

const cardStyle: React.CSSProperties = {
  padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff',
}

const cardHeading: React.CSSProperties = {
  fontSize: '0.875rem', fontWeight: 700, color: '#111827', marginBottom: '10px',
}
