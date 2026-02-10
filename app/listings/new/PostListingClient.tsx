'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ImageUploader from '@/app/components/ImageUploader'
import { categories, slugify } from '@/lib/data'

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
  const [accountType, setAccountType] = useState<string>('personal')

  useEffect(() => {
    fetch('/api/auth')
      .then(r => r.json())
      .then(d => {
        if (!d.authenticated || !d.user?.verified) {
          setAuthed(false)
        } else {
          setAuthed(true)
          setAccountType(d.user.account_type || 'personal')
        }
      })
      .catch(() => setAuthed(false))
  }, [])

  const selectedCategory = categories.find(c => c.slug === categorySlug)
  const isServicesBlocked = categorySlug === 'services' && accountType !== 'business'

  const handleSubmit = async () => {
    setError('')
    if (!title.trim()) { setError('Title required'); return }
    if (!categorySlug) { setError('Category required'); return }
    if (isServicesBlocked) { setError('Business profile required to post services'); return }

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
          display: 'inline-block', padding: '0.75rem 1.5rem',
          backgroundColor: '#2563eb', color: '#fff', borderRadius: '0.5rem', fontWeight: 600,
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
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
          placeholder="What are you listing?" maxLength={200} style={inputStyle} />
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={labelStyle}>Category *</label>
        <select value={categorySlug}
          onChange={e => { setCategorySlug(e.target.value); setSubcategorySlug('') }}
          style={inputStyle}>
          <option value="">Select category</option>
          {categories.map(c => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Services business profile notice */}
      {isServicesBlocked && (
        <div style={{
          padding: '16px', borderRadius: '8px', border: '1px solid #fbbf24',
          backgroundColor: '#fffbeb', marginBottom: '1.25rem',
        }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#92400e', marginBottom: '6px' }}>
            Business profile required
          </p>
          <p style={{ fontSize: '0.8125rem', color: '#78350f', marginBottom: '10px' }}>
            To offer services, you need a business profile. It&apos;s free — you don&apos;t need to be a registered business. Just create a profile so customers can find you, see your hours, and read about what you offer.
          </p>
          <Link href="/signup" style={{
            display: 'inline-block', padding: '6px 14px', borderRadius: '6px',
            backgroundColor: '#2563eb', color: '#fff', fontSize: '0.8125rem', fontWeight: 600,
          }}>
            Create Business Profile
          </Link>
        </div>
      )}

      {selectedCategory && !isServicesBlocked && (
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>Subcategory</label>
          <select value={subcategorySlug} onChange={e => setSubcategorySlug(e.target.value)} style={inputStyle}>
            <option value="">All</option>
            {selectedCategory.subs.map(s => (
              <option key={s} value={slugify(s)}>{s}</option>
            ))}
          </select>
        </div>
      )}

      {!isServicesBlocked && (
        <>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Price ($)</label>
            <input type="number" min="0" step="0.01" value={priceStr}
              onChange={e => setPriceStr(e.target.value)}
              placeholder="Leave empty for free / negotiable" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Describe your listing..." rows={5}
              style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Location</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Upper West Side, Williamsburg" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Photos</label>
            <ImageUploader images={images} onChange={setImages} />
          </div>

          {error && <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}

          <button onClick={handleSubmit} disabled={loading} style={{
            width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: 'none',
            backgroundColor: '#2563eb', color: '#fff', fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
          }}>
            {loading ? 'Posting...' : 'Post Listing'}
          </button>
        </>
      )}
    </main>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.875rem', fontWeight: 600,
  color: '#334155', marginBottom: '0.375rem',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem',
  border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none',
}
