'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { BlogPost } from '@/lib/blog-posts'

export default function BlogIndexClient({
  posts,
  categories,
}: {
  posts: BlogPost[]
  categories: string[]
}) {
  const [active, setActive] = useState('All Posts')

  const filtered = active === 'All Posts'
    ? posts
    : posts.filter(p => p.category === active)

  return (
    <main style={{ maxWidth: '1050px', margin: '0 auto', padding: '40px 20px 64px', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '24px' }}>
        <Link href="/" style={{ color: '#2563eb' }}>Home</Link>
        <span style={{ margin: '0 6px' }}>&rsaquo;</span>
        <span style={{ color: '#111827' }}>Blog</span>
      </nav>

      {/* Header */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
        The NYC Classifieds Blog
      </h1>
      <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '40px' }}>
        Building NYC&apos;s free classifieds & community platform. One update at a time.
      </p>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '32px' }} />

      {/* Two column: sidebar + content */}
      <div style={{ display: 'flex', gap: '48px' }}>
        {/* Sidebar — categories */}
        <aside style={{ width: '180px', flexShrink: 0 }}>
          <div style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#6b7280',
            marginBottom: '12px',
          }}>
            Categories
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                style={{
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  padding: '6px 0',
                  fontSize: '0.9375rem',
                  fontFamily: "'DM Sans', sans-serif",
                  color: active === cat ? '#2563eb' : '#374151',
                  fontWeight: active === cat ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                {cat}
              </button>
            ))}
          </nav>
        </aside>

        {/* Posts */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {filtered.length === 0 && (
            <p style={{ color: '#6b7280', padding: '20px 0' }}>No posts in this category yet.</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
            {filtered.map(post => (
              <article key={post.slug} style={{ paddingBottom: '36px', borderBottom: '1px solid #f3f4f6' }}>
                {/* Category badge + date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <span style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#2563eb',
                    border: '1px solid #dbeafe',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    backgroundColor: '#eff6ff',
                  }}>
                    {post.category}
                  </span>
                  <span style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>
                    {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>

                {/* Title */}
                <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111827', marginBottom: '8px', lineHeight: 1.3 }}>
                    {post.title}
                  </h2>
                </Link>

                {/* Excerpt */}
                <p style={{ color: '#4b5563', lineHeight: 1.7, marginBottom: '12px', fontSize: '0.9375rem' }}>
                  {post.excerpt}
                </p>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {post.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #f3f4f6',
                      borderRadius: '4px',
                      padding: '2px 8px',
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          {/* Footer message */}
          <div style={{
            marginTop: '48px',
            padding: '24px',
            border: '2px dashed #e5e7eb',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '0.9375rem',
          }}>
            More updates coming soon. We&apos;re just getting started.
          </div>
        </div>
      </div>
    </main>
  )
}
