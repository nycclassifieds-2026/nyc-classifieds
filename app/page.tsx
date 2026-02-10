import Link from 'next/link'
import { homepageColumns, boroughs, categories, slugify } from '@/lib/data'
import { websiteSchema, organizationSchema, faqSchema, collectionPageSchema } from '@/lib/seo'

export default function Home() {
  const categoryItems = categories.map(c => ({ name: c.name, url: `/listings/${c.slug}` }))
  const boroughItems = boroughs.map(b => ({ name: `${b.name} Classifieds`, url: `/${b.slug}` }))

  const schemas = [
    websiteSchema(),
    organizationSchema(),
    collectionPageSchema({
      name: 'NYC Classifieds — All Categories',
      description: 'Browse all classifieds categories in New York City including housing, jobs, services, for sale, gigs, community, and more.',
      url: '/',
      items: [...categoryItems, ...boroughItems],
    }),
    faqSchema([
      { question: 'What is The NYC Classifieds?', answer: 'The NYC Classifieds is a free, local classifieds platform for New York City. Every user is geo-verified with a live photo at their address, ensuring all listings are from real New Yorkers.' },
      { question: 'Is it free to post on NYC Classifieds?', answer: 'Yes, posting on NYC Classifieds is completely free. You can list items for sale, housing, jobs, services, gigs, and more at no cost.' },
      { question: 'How does verification work?', answer: 'During signup you take a live selfie while at your NYC address. We verify your GPS location matches your registered address within 50 feet, proving you actually live or work there.' },
      { question: 'What boroughs does NYC Classifieds cover?', answer: 'NYC Classifieds covers all five NYC boroughs: Manhattan, Brooklyn, Queens, the Bronx, and Staten Island, with 126+ neighborhoods across the city.' },
      { question: 'Can businesses use NYC Classifieds?', answer: 'Yes. Businesses get a free profile page with their hours, website, phone number, service area, and photo gallery. Business profiles are required to post in the Services category.' },
      { question: 'What categories are available?', answer: 'NYC Classifieds has 12 categories: Housing, Jobs, For Sale, Services, Gigs, Community, Tickets & Events, Pets, Personals, Barter, Rentals & Lending, and Resumes.' },
    ]),
  ]

  return (
    <main style={{ maxWidth: '1050px', margin: '0 auto', padding: '12px 24px 32px' }}>
      {/* JSON-LD structured data */}
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      {/* Search + boroughs */}
      <section style={{ padding: '8px 0 0' }}>
        <h1 className="sr-only">Free Classifieds in New York City — Housing, Jobs, Services, For Sale & More</h1>
        <form action="/search" method="GET" role="search" aria-label="Search all NYC classifieds" style={{ display: 'flex', gap: '8px', maxWidth: '480px', marginBottom: '12px' }}>
          <input
            type="text"
            name="q"
            placeholder="Search all of NYC..."
            aria-label="Search classifieds in New York City"
            style={{
              flex: 1, padding: '10px 16px', borderRadius: '8px', border: '1px solid #1a56db',
              fontSize: '0.9375rem', fontFamily: "'DM Sans', sans-serif", outline: 'none',
              color: '#111827', backgroundColor: '#ffffff',
            }}
          />
          <button type="submit" style={{
            backgroundColor: 'transparent', color: '#1a56db', padding: '10px 16px',
            borderRadius: '6px', border: '1px solid #1a56db', fontSize: '0.875rem',
            fontWeight: 500, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
          }}>
            Search
          </button>
        </form>
        <nav aria-label="Browse by borough" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '4px' }}>
          {boroughs.map(b => (
            <Link key={b.slug} href={`/${b.slug}`} style={{
              color: '#1a56db', fontSize: '1rem', fontWeight: 500, textDecoration: 'none',
            }}>
              {b.name}
            </Link>
          ))}
        </nav>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
          Free. Real. Local. Verified NYC classifieds.
        </p>
      </section>

      {/* Categories — 5-col grid */}
      <section aria-label="Browse classifieds by category" style={{ padding: '20px 0 0' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
          Classifieds in New York City
        </h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0 20px',
          borderTop: '1px solid #e5e7eb', paddingTop: '12px',
        }}>
          {homepageColumns.map((col, ci) => (
            <div key={ci}>
              {col.map(cat => {
                const isCommunity = cat.slug === 'community'
                return (
                <div key={cat.slug} style={{ marginBottom: '6px' }}>
                  <Link href={isCommunity ? '/porch' : `/listings/${cat.slug}`} style={{
                    fontSize: '0.9375rem', fontWeight: 600, color: '#111827',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    lineHeight: 1.8, textDecoration: 'none',
                  }}>
                    <span style={{
                      display: 'inline-block', width: '7px', height: '7px', borderRadius: '2px',
                      backgroundColor: cat.color, flexShrink: 0,
                    }} />
                    {cat.name}
                  </Link>
                  {cat.tagline && (
                    isCommunity ? (
                      <Link href="/porch" style={{
                        display: 'block', fontSize: '0.75rem', fontWeight: 600,
                        color: cat.color, paddingLeft: '13px', lineHeight: 1.8,
                        textDecoration: 'none',
                      }}>
                        {cat.tagline}
                      </Link>
                    ) : (
                      <span style={{
                        display: 'block', fontSize: '0.75rem', fontWeight: 600,
                        color: cat.color, paddingLeft: '13px', lineHeight: 1.8,
                      }}>
                        {cat.tagline}
                      </span>
                    )
                  )}
                  {cat.subs.map(sub => (
                    <Link key={sub} href={isCommunity ? '/porch' : `/listings/${cat.slug}/${slugify(sub)}`} style={{
                      display: 'block', color: '#1a56db', fontSize: '0.8125rem',
                      textDecoration: 'none', paddingLeft: '13px', lineHeight: 1.55,
                    }}>
                      {sub}
                    </Link>
                  ))}
                </div>
                )
              })}
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
