'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { boroughs, categories, neighborhoodSlug } from '@/lib/data'

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideNav = pathname?.startsWith('/admin')
  const [user, setUser] = useState<{ name?: string } | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetch('/api/auth', { credentials: 'same-origin' })
      .then(r => r.json())
      .then(d => {
        if (d.authenticated) {
          setUser(d.user)
          setUnreadCount(d.unreadMessages || 0)
        }
      })
      .catch(() => setUser(null))
  }, [pathname])

  return (
    <>
      {!hideNav && (
        <header style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          height: '56px',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '1050px',
            width: '100%',
            margin: '0 auto',
            padding: '0 24px',
          }}>
            {/* Logo */}
            <Link href="/" style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '1.5rem',
              letterSpacing: '-0.02em',
              flexShrink: 0,
              textDecoration: 'none',
            }}>
              <span style={{ color: '#1f2937', fontWeight: 400 }}>The </span>
              <span style={{ color: '#2563eb', fontWeight: 700 }}>NYC</span>
              <span style={{ color: '#1f2937', fontWeight: 400 }}> Classifieds</span>
            </Link>

            {/* Section tabs */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '32px' }}>
              <Link href="/" style={{
                padding: '6px 14px',
                fontSize: '0.8125rem',
                fontWeight: pathname === '/' || pathname?.startsWith('/listings') || pathname?.startsWith('/manhattan') || pathname?.startsWith('/brooklyn') || pathname?.startsWith('/queens') || pathname?.startsWith('/bronx') || pathname?.startsWith('/staten-island') ? 600 : 500,
                color: pathname === '/' || pathname?.startsWith('/listings') || pathname?.startsWith('/manhattan') || pathname?.startsWith('/brooklyn') || pathname?.startsWith('/queens') || pathname?.startsWith('/bronx') || pathname?.startsWith('/staten-island') ? '#111827' : '#6b7280',
                borderBottom: pathname === '/' || pathname?.startsWith('/listings') || pathname?.startsWith('/manhattan') || pathname?.startsWith('/brooklyn') || pathname?.startsWith('/queens') || pathname?.startsWith('/bronx') || pathname?.startsWith('/staten-island') ? '2px solid #1a56db' : '2px solid transparent',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                Classifieds
              </Link>
              <Link href="/porch" style={{
                padding: '6px 14px',
                fontSize: '0.8125rem',
                fontWeight: pathname?.startsWith('/porch') ? 600 : 500,
                color: pathname?.startsWith('/porch') ? '#111827' : '#6b7280',
                borderBottom: pathname?.startsWith('/porch') ? '2px solid #059669' : '2px solid transparent',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                The Porch
              </Link>
            </nav>

            <div style={{ flex: 1 }} />

            {/* Right nav: Post | Account */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
              {/* Post button — always visible */}
              <Link href="/listings/new" style={{
                backgroundColor: '#1a56db',
                color: '#ffffff',
                padding: '7px 18px',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                Post
              </Link>

              {/* Account */}
              {user ? (
                <Link href="/account" style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280',
                  fontSize: '13px',
                  fontWeight: 600,
                  position: 'relative',
                }}>
                  {user.name ? user.name[0].toUpperCase() : '?'}
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      backgroundColor: '#dc2626',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '14px',
                      height: '14px',
                      fontSize: '9px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              ) : (
                <Link href="/login" style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </Link>
              )}
            </nav>
          </div>
        </header>
      )}

      {children}

      {!hideNav && (
        <footer style={{
          backgroundColor: '#111827',
          marginTop: '48px',
        }}>
          <div style={{ maxWidth: '1050px', margin: '0 auto', padding: '48px 24px 24px' }}>
            {/* 5-column grid, manually balanced */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '0 20px',
            }}>
              {/* Col 1: Categories + Bronx + Staten Island */}
              <div>
                <div className="footer-heading">Categories</div>
                {categories.map(c => (
                  <Link key={c.slug} href={`/listings/${c.slug}`} className="footer-link">{c.name}</Link>
                ))}
                {boroughs.filter(b => b.slug === 'bronx' || b.slug === 'staten-island').map(b => (
                  <div key={b.slug}>
                    <div className="footer-heading" style={{ marginTop: '12px' }}>{b.name}</div>
                    {b.neighborhoods.map(n => (
                      <Link key={n} href={`/${b.slug}/${neighborhoodSlug(n)}`} className="footer-link">{n}</Link>
                    ))}
                  </div>
                ))}
              </div>

              {/* Col 2-4: Manhattan, Brooklyn, Queens */}
              {boroughs.filter(b => ['manhattan', 'brooklyn', 'queens'].includes(b.slug)).map(b => (
                <div key={b.slug}>
                  <div className="footer-heading">{b.name}</div>
                  {b.neighborhoods.map(n => (
                    <Link key={n} href={`/${b.slug}/${neighborhoodSlug(n)}`} className="footer-link">{n}</Link>
                  ))}
                </div>
              ))}

              {/* Col 5 (~31): Company + placeholder for balance */}
              <div>
                <div className="footer-heading">Company</div>
                {[
                  { label: 'About', href: '/about' },
                  { label: 'Safety Tips', href: '/safety' },
                  { label: 'How It Works', href: '/how-it-works' },
                  { label: 'Guidelines', href: '/guidelines' },
                  { label: 'FAQ', href: '/faq' },
                  { label: 'Contact', href: '/contact' },
                  { label: 'Terms', href: '/terms' },
                  { label: 'Privacy', href: '/privacy' },
                  { label: 'DMCA', href: '/dmca' },
                ].map(l => (
                  <Link key={l.href} href={l.href} className="footer-link">{l.label}</Link>
                ))}
              </div>
            </div>

            {/* Copyright bar */}
            <div style={{
              borderTop: '1px solid #1f2937',
              marginTop: '24px',
              paddingTop: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.875rem',
              }}>
                <span style={{ color: '#9ca3af' }}>The </span>
                <span style={{ color: '#6b7280', fontWeight: 700 }}>NYC</span>
                <span style={{ color: '#9ca3af' }}> Classifieds</span>
              </span>
              <span style={{ color: '#4b5563', fontSize: '0.6875rem' }}>
                Free. Real. Local. &copy; {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </footer>
      )}
    </>
  )
}
