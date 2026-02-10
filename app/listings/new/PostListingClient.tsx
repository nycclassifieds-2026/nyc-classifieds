'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ImageUploader from '@/app/components/ImageUploader'

const categories = [
  { slug: 'for-sale', name: 'For Sale', subcategories: ['Electronics', 'Furniture', 'Clothing', 'Vehicles', 'Sports & Outdoors', 'Books & Media', 'Toys & Games', 'Other'] },
  { slug: 'housing', name: 'Housing', subcategories: ['Apartments', 'Rooms', 'Sublets', 'Real Estate', 'Parking', 'Storage'] },
  { slug: 'services', name: 'Services', subcategories: ['Home Repair', 'Cleaning', 'Tutoring', 'Beauty', 'Legal', 'Financial', 'Tech', 'Other'] },
  { slug: 'jobs', name: 'Jobs', subcategories: ['Full-time', 'Part-time', 'Freelance', 'Internships'] },
  { slug: 'community', name: 'Community', subcategories: ['Events', 'Groups', 'Lost & Found', 'Volunteers', 'Announcements'] },
  { slug: 'gigs', name: 'Gigs', subcategories: ['Quick Tasks', 'Events', 'Moving', 'Delivery', 'Other'] },
]

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export default function PostListingClient() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priceStr, setPriceStr] = useState('')
  const [categorySlug, setCategorySlug] = useState('')
  const [subcategorySlug, setSubcategorySlug] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/auth')
      .then(r => r.json())
      .then(d => {
        if (!d.authenticated || !d.user?.verified) {
          setAuthed(false)
        } else {
          setAuthed(true)
        }
      })
      .catch(() => setAuthed(false))
  }, [])

  const selectedCategory = categories.find(c => c.slug === categorySlug)

  const handleSubmit = async () => {
    setError('')
    if (!title.trim()) { setError('Title required'); return }
    if (!categorySlug) { setError('Category required'); return }

    setLoading(true)
    try {
      const price = priceStr ? Math.round(parseFloat(priceStr) * 100) : null
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          price,
          category_slug: categorySlug,
          subcategory_slug: subcategorySlug || null,
          images,
          location: location || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/listings/${categorySlug}/${data.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to post listing')
    } finally {
      setLoading(false)
    }
  }

  if (authed === null) return <main style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</main>
  if (authed === false) {
    return (
      <main style={{ maxWidth: '480px', margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Verification Required</h1>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>You need a verified account to post listings.</p>
        <a href="/signup" style={{
          display: 'inline-block',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#2563eb',
          color: '#fff',
          borderRadius: '0.5rem',
          fontWeight: 600,
        }}>
          Sign Up & Verify
        </a>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Post a Listing</h1>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={labelStyle}>Title *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What are you listing?"
          maxLength={200}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={labelStyle}>Category *</label>
        <select
          value={categorySlug}
          onChange={e => { setCategorySlug(e.target.value); setSubcategorySlug('') }}
          style={inputStyle}
        >
          <option value="">Select category</option>
          {categories.map(c => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      {selectedCategory && (
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>Subcategory</label>
          <select
            value={subcategorySlug}
            onChange={e => setSubcategorySlug(e.target.value)}
            style={inputStyle}
          >
            <option value="">All</option>
            {selectedCategory.subcategories.map(s => (
              <option key={s} value={slugify(s)}>{s}</option>
            ))}
          </select>
        </div>
      )}

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={labelStyle}>Price ($)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={priceStr}
          onChange={e => setPriceStr(e.target.value)}
          placeholder="Leave empty for free / negotiable"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={labelStyle}>Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe your listing..."
          rows={5}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={labelStyle}>Location</label>
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="e.g. Upper West Side, Williamsburg"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>Photos</label>
        <ImageUploader images={images} onChange={setImages} />
      </div>

      {error && <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}

      <button onClick={handleSubmit} disabled={loading} style={{
        width: '100%',
        padding: '0.75rem',
        borderRadius: '0.5rem',
        border: 'none',
        backgroundColor: '#2563eb',
        color: '#fff',
        fontSize: '1rem',
        fontWeight: 600,
        cursor: 'pointer',
      }}>
        {loading ? 'Posting...' : 'Post Listing'}
      </button>
    </main>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 600,
  color: '#334155',
  marginBottom: '0.375rem',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '0.5rem',
  border: '1px solid #e2e8f0',
  fontSize: '1rem',
  outline: 'none',
}
