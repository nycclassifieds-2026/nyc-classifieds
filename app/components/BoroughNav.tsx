'use client'

import { useState } from 'react'
import Link from 'next/link'
import { boroughs, neighborhoodSlug } from '@/lib/data'

export default function BoroughNav() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div>
      <nav aria-label="Browse by borough" className="home-borough-nav" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '4px' }}>
        {boroughs.map(b => (
          <button
            key={b.slug}
            onClick={() => setExpanded(expanded === b.slug ? null : b.slug)}
            style={{
              color: expanded === b.slug ? '#111827' : '#1a56db',
              fontSize: '1rem',
              fontWeight: expanded === b.slug ? 700 : 500,
              textDecoration: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {b.name}
          </button>
        ))}
      </nav>

      {expanded && (() => {
        const borough = boroughs.find(b => b.slug === expanded)
        if (!borough) return null
        return (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px 12px',
            padding: '8px 0 4px',
          }}>
            <Link
              href={`/${borough.slug}`}
              style={{
                fontSize: '0.8125rem',
                color: '#1a56db',
                fontWeight: 600,
                textDecoration: 'none',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              All {borough.name}
            </Link>
            {borough.neighborhoods.map(n => (
              <Link
                key={n}
                href={`/${borough.slug}/${neighborhoodSlug(n)}`}
                style={{
                  fontSize: '0.8125rem',
                  color: '#1a56db',
                  textDecoration: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {n}
              </Link>
            ))}
          </div>
        )
      })()}
    </div>
  )
}
