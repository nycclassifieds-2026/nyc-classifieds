'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { BlogPost } from '@/lib/blog-posts'
import ListenButton from '@/app/components/ListenButton'

export default function BlogPostClient({
  post,
  readTime,
  categories,
  relatedPosts,
  allPosts,
}: {
  post: BlogPost
  readTime: number
  categories: string[]
  relatedPosts: BlogPost[]
  allPosts: BlogPost[]
}) {
  const [copied, setCopied] = useState(false)
  const [activeCategory, setActiveCategory] = useState(post.category)

  const filteredSidebar = activeCategory === 'All Posts'
    ? allPosts.filter(p => p.slug !== post.slug)
    : allPosts.filter(p => p.slug !== post.slug && p.category === activeCategory)

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareX = () => {
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`,
      '_blank'
    )
  }

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: post.title, url: window.location.href })
    } else {
      copyLink()
    }
  }

  // Parse content into paragraphs
  const paragraphs = post.content.split('\n\n')

  return (
    <main style={{ maxWidth: '1050px', margin: '0 auto', padding: '40px 20px 64px', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '24px' }}>
        <Link href="/" style={{ color: '#2563eb' }}>Home</Link>
        <span style={{ margin: '0 6px' }}>&rsaquo;</span>
        <Link href="/blog" style={{ color: '#2563eb' }}>Blog</Link>
        <span style={{ margin: '0 6px' }}>&rsaquo;</span>
        <span style={{ color: '#111827' }}>{post.category}</span>
      </nav>

      {/* Category badge + date + read time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
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
        <span style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>&middot;</span>
        <span style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>{readTime} min read</span>
      </div>

      {/* Title */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: '#111827', marginBottom: '12px', lineHeight: 1.25, maxWidth: '720px' }}>
        {post.title}
      </h1>

      {/* Excerpt */}
      <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '20px', lineHeight: 1.6, maxWidth: '720px' }}>
        {post.excerpt}
      </p>

      {/* Author + action buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        marginBottom: '32px',
      }}>
        {/* Author */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}>
            NYC
          </div>
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
            {post.author}
          </span>
        </div>

        {/* Listen */}
        <ListenButton text={post.content} />

        {/* Copy Link */}
        <button onClick={copyLink} style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          padding: '6px 14px', borderRadius: '20px', border: '1px solid #e5e7eb',
          backgroundColor: '#fff', color: '#374151', fontSize: '0.8125rem', fontWeight: 500,
          fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
        }}>
          {copied ? 'Copied!' : 'Copy Link'}
        </button>

        {/* Share on X */}
        <button onClick={shareX} style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          padding: '6px 14px', borderRadius: '20px', border: '1px solid #e5e7eb',
          backgroundColor: '#fff', color: '#374151', fontSize: '0.8125rem', fontWeight: 500,
          fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
        }}>
          Share on X
        </button>

        {/* Share */}
        <button onClick={share} style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          padding: '6px 14px', borderRadius: '20px', border: '1px solid #e5e7eb',
          backgroundColor: '#fff', color: '#374151', fontSize: '0.8125rem', fontWeight: 500,
          fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
        }}>
          Share
        </button>
      </div>

      <div style={{ borderTop: '3px solid #2563eb', marginBottom: '32px', maxWidth: '720px' }} />

      {/* Two column: sidebar + article */}
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
                onClick={() => setActiveCategory(cat)}
                style={{
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  padding: '6px 0',
                  fontSize: '0.9375rem',
                  fontFamily: "'DM Sans', sans-serif",
                  color: activeCategory === cat ? '#2563eb' : '#374151',
                  fontWeight: activeCategory === cat ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                {cat}
              </button>
            ))}
          </nav>

          {/* Related posts from selected category */}
          {filteredSidebar.length > 0 && (
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
              {filteredSidebar.slice(0, 4).map(p => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    color: '#4b5563',
                    padding: '6px 0',
                    lineHeight: 1.4,
                  }}
                >
                  {p.title}
                </Link>
              ))}
            </div>
          )}
        </aside>

        {/* Article body */}
        <article style={{ flex: 1, minWidth: 0, maxWidth: '640px' }}>
          <div style={{ color: '#374151', lineHeight: 1.8, fontSize: '1.0625rem' }}>
            {paragraphs.map((para, i) => {
              if (para.startsWith('## ')) {
                return (
                  <h2 key={i} style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginTop: '28px', marginBottom: '12px' }}>
                    {para.slice(3)}
                  </h2>
                )
              }

              if (/^\d+\.\s/.test(para.split('\n')[0])) {
                const items = para.split('\n').filter(l => l.trim())
                return (
                  <ol key={i} style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                    {items.map((item, j) => (
                      <li key={j} style={{ marginBottom: '6px' }} dangerouslySetInnerHTML={{
                        __html: item.replace(/^\d+\.\s/, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                      }} />
                    ))}
                  </ol>
                )
              }

              if (para.startsWith('- ')) {
                const items = para.split('\n').filter(l => l.trim())
                return (
                  <ul key={i} style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                    {items.map((item, j) => (
                      <li key={j} style={{ marginBottom: '6px' }} dangerouslySetInnerHTML={{
                        __html: item.replace(/^- /, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                      }} />
                    ))}
                  </ul>
                )
              }

              return (
                <p key={i} style={{ marginBottom: '16px' }} dangerouslySetInnerHTML={{
                  __html: para.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                }} />
              )
            })}
          </div>

          {/* Tags */}
          <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #f3f4f6', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
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

          {/* Related posts */}
          {relatedPosts.length > 0 && (
            <nav style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>More from the blog</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {relatedPosts.map(p => (
                  <Link key={p.slug} href={`/blog/${p.slug}`} style={{ color: '#2563eb', fontSize: '0.9375rem' }}>
                    {p.title}
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </article>
      </div>
    </main>
  )
}
