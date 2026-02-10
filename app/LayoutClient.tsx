'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
          borderBottom: '1px solid #e2e8f0',
          padding: '0.75rem 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '1200px',
            margin: '0 auto',
          }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb' }}>NYC</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 300, color: '#0f172a' }}>Classifieds</span>
            </Link>

            <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link href="/search" style={{ color: '#475569', fontSize: '0.875rem', fontWeight: 500 }}>
                Search
              </Link>

              {user ? (
                <>
                  <Link href="/listings/new" style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}>
                    Post Listing
                  </Link>
                  <Link href="/messages" style={{ color: '#475569', fontSize: '0.875rem', fontWeight: 500, position: 'relative' }}>
                    Messages
                    {unreadCount > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-10px',
                        backgroundColor: '#ef4444',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                      }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link href="/account" style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}>
                    {user.name ? user.name[0].toUpperCase() : '?'}
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" style={{ color: '#475569', fontSize: '0.875rem', fontWeight: 500 }}>
                    Log in
                  </Link>
                  <Link href="/signup" style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}>
                    Sign up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
      )}

      {children}

      {!hideNav && (
        <footer style={{
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          padding: '2rem 1.5rem',
          marginTop: '4rem',
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
              &copy; {new Date().getFullYear()} NYC Classifieds
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
              <Link href="/about">About</Link>
              <Link href="/safety">Safety Tips</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/privacy">Privacy</Link>
            </div>
          </div>
        </footer>
      )}
    </>
  )
}
