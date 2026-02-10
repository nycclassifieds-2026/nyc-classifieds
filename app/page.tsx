import Link from 'next/link'
import HomeListings from './HomeListings'

const categories = [
  { name: 'For Sale', slug: 'for-sale', icon: '🏷️', description: 'Electronics, furniture, clothing & more' },
  { name: 'Housing', slug: 'housing', icon: '🏠', description: 'Apartments, rooms, sublets & real estate' },
  { name: 'Services', slug: 'services', icon: '🔧', description: 'Home repair, tutoring, beauty & more' },
  { name: 'Jobs', slug: 'jobs', icon: '💼', description: 'Full-time, part-time & freelance' },
  { name: 'Community', slug: 'community', icon: '🤝', description: 'Events, groups, lost & found' },
  { name: 'Gigs', slug: 'gigs', icon: '⚡', description: 'Quick tasks, events & temporary work' },
]

export default function Home() {
  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '3rem 0 2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
          NYC Classifieds
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#475569', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Buy, sell, and connect with verified New Yorkers. Every user is identity and location verified.
        </p>

        {/* Search bar */}
        <form action="/search" method="GET" style={{
          display: 'flex',
          maxWidth: '600px',
          margin: '0 auto',
          gap: '0.5rem',
        }}>
          <input
            type="text"
            name="q"
            placeholder="Search listings..."
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0',
              fontSize: '1rem',
              outline: 'none',
            }}
          />
          <button type="submit" style={{
            backgroundColor: '#2563eb',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            Search
          </button>
        </form>
      </section>

      {/* Categories */}
      <section style={{ padding: '2rem 0' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#0f172a' }}>
          Browse Categories
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem',
        }}>
          {categories.map(cat => (
            <Link key={cat.slug} href={`/listings/${cat.slug}`} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1.25rem',
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0',
              backgroundColor: '#fff',
              transition: 'box-shadow 0.15s, border-color 0.15s',
            }}>
              <span style={{ fontSize: '2rem' }}>{cat.icon}</span>
              <div>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{cat.name}</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{cat.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent listings */}
      <section style={{ padding: '2rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
            Recent Listings
          </h2>
          <Link href="/search" style={{ color: '#2563eb', fontSize: '0.875rem', fontWeight: 500 }}>
            View all
          </Link>
        </div>
        <HomeListings />
      </section>
    </main>
  )
}
