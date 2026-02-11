import { boroughs, categories } from '@/lib/data'
import { websiteSchema, organizationSchema, faqSchema, collectionPageSchema } from '@/lib/seo'
import Link from 'next/link'
import HomeSearch from './components/HomeSearch'
import BoroughNav from './components/BoroughNav'
import HomeCategoryGrid from './components/HomeCategoryGrid'
import HomepageAd from './components/HomepageAd'

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

      {/* Directory launch banner — red, blinking */}
      <Link href="/business" className="launch-banner" style={{
        display: 'block',
        backgroundColor: '#fef2f2',
        border: '1px solid #fca5a5',
        borderRadius: '8px',
        padding: '10px 16px',
        marginBottom: '12px',
        textDecoration: 'none',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.8125rem',
        color: '#7f1d1d',
        lineHeight: 1.5,
        textAlign: 'center',
      }}>
        <span className="launch-blink" style={{ color: '#dc2626', fontWeight: 700 }}>NEW</span>{' '}
        NYC Business Directory — just launched, for you. Get your business listed for free. Only works if you use it!{' '}
        <span style={{ color: '#dc2626', fontWeight: 600 }}>Check it out →</span>
      </Link>

      {/* Mobile ad — above search */}
      <div className="mobile-only-ad">
        <HomepageAd />
      </div>

      {/* Value prop */}
      <section style={{ padding: '16px 0 12px', fontFamily: "'DM Sans', sans-serif" }}>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#111827', margin: '0 0 2px', letterSpacing: '-0.01em' }}>
          Bringing back what worked — free classifieds & real community (The Porch)
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#4b5563', margin: '0 0 12px', lineHeight: 1.5 }}>
          The simplicity of old-school classifieds. The neighborhood feel of a real community board. Every user geo-verified at their NYC address.
        </p>
      </section>

      {/* Desktop: search left, ad right | Mobile: stacked */}
      <section className="homepage-top" style={{ padding: '0', marginBottom: '0' }}>
        <h2 className="sr-only">Free Classifieds in New York City — Housing, Jobs, Services, For Sale & More</h2>
        <div className="homepage-top-left">
          <div style={{ marginBottom: '12px' }}>
            <HomeSearch />
          </div>
          <BoroughNav />
        </div>
        <div className="desktop-only-ad homepage-top-right">
          <HomepageAd />
        </div>
      </section>

      {/* Feature pills — 2 columns under ad */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '6px 24px',
        fontSize: '0.8125rem',
        color: '#374151',
        fontFamily: "'DM Sans', sans-serif",
        padding: '10px 0 0',
      }}>
        <span><strong style={{ color: '#2563eb' }}>Geo-verified</strong> — Selfie + GPS at your address</span>
        <span><strong style={{ color: '#2563eb' }}>100% free</strong> — No fees, ever</span>
        <span><strong style={{ color: '#2563eb' }}>Hyperlocal</strong> — 126+ NYC neighborhoods</span>
        <span><strong style={{ color: '#2563eb' }}>The Porch</strong> — Alerts, lost pets, neighbor Q&A</span>
      </div>

      {/* Categories — localized when home is set */}
      <HomeCategoryGrid />
    </main>
  )
}
