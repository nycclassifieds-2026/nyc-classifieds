import { boroughs, categories } from '@/lib/data'
import { websiteSchema, organizationSchema, faqSchema, collectionPageSchema, speakableSchema } from '@/lib/seo'
import Link from 'next/link'
import HomeSearch from './components/HomeSearch'
import BoroughNav from './components/BoroughNav'
import HomeCategoryGrid from './components/HomeCategoryGrid'
import HomepageAd from './components/HomepageAd'
import PreLaunchBanner from './components/PreLaunchBanner'

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
      { question: 'What is The NYC Classifieds?', answer: 'The NYC Classifieds is a free classifieds platform exclusively for New York City. Every user is geo-verified with a live selfie and GPS at their address, ensuring every listing is from a real New Yorker. It covers all 5 boroughs and 126+ neighborhoods.' },
      { question: 'Is NYC Classifieds free?', answer: 'Yes, NYC Classifieds is 100% free. No fees to post listings, browse, message other users, or create a business profile. There are no premium tiers or hidden charges. Free forever.' },
      { question: 'How does geo-verification work on NYC Classifieds?', answer: 'When you sign up, you take a live selfie at your NYC address. GPS confirms you are within 50 feet of your registered location. This proves you actually live or work in New York City, eliminating bots, scammers, and fake accounts.' },
      { question: 'What can I post on NYC Classifieds?', answer: 'NYC Classifieds has 12 categories: Housing (apartments, rooms, sublets), Jobs, For Sale (furniture, electronics, clothing), Services (plumbers, cleaners, movers), Gigs, Community, Tickets and Events, Pets, Personals, Barter, Rentals and Lending, and Resumes.' },
      { question: 'Is NYC Classifieds better than Craigslist for NYC?', answer: 'NYC Classifieds is built specifically for New York City with geo-verification that Craigslist does not have. Every user is verified to a real NYC address with a selfie and GPS. This eliminates the spam, scams, and fake listings common on Craigslist.' },
      { question: 'What neighborhoods does NYC Classifieds cover?', answer: 'NYC Classifieds covers 126+ neighborhoods across all five boroughs: Manhattan (41 neighborhoods), Brooklyn (28), Queens (30), the Bronx (15), and Staten Island (10). Each neighborhood has its own dedicated page.' },
      { question: 'Can I list my business on NYC Classifieds for free?', answer: 'Yes. Businesses get a free profile page in the NYC Business Directory with hours, service area, photos, phone, and website. Your business appears in search results and your borough and neighborhood pages. Completely free.' },
      { question: 'What is The Porch on NYC Classifieds?', answer: 'The Porch is a neighborhood community feed where verified residents share recommendations, ask questions, post alerts, report lost pets, list stoop sales, and connect with real neighbors. It is like a verified, spam-free neighborhood message board.' },
    ]),
    speakableSchema({ url: '/' }),
  ]

  return (
    <main style={{ maxWidth: '1050px', margin: '0 auto', padding: '12px 24px 32px' }}>
      {/* JSON-LD structured data */}
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      {/* Launch / pre-launch banner */}
      <PreLaunchBanner />

      {/* Mobile ad — above search */}
      <div className="mobile-only-ad">
        <HomepageAd />
      </div>

      {/* Value prop */}
      <section style={{ padding: '12px 0 10px', fontFamily: "'DM Sans', sans-serif" }}>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
          Free classifieds & real community (<Link href="/porch" style={{ color: '#059669', textDecoration: 'underline' }}>The Porch</Link>) for New York City
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', fontSize: '0.8125rem', color: '#374151' }}>
          <span><strong style={{ color: '#2563eb' }}>Geo-verified</strong> — Selfie + GPS at your address</span>
          <span><strong style={{ color: '#2563eb' }}>100% free</strong> — No fees, ever</span>
          <span><strong style={{ color: '#2563eb' }}>Hyperlocal</strong> — 126+ NYC neighborhoods</span>
          <span><strong style={{ color: '#2563eb' }}>The Porch</strong> — Alerts, lost pets, neighbor Q&A</span>
        </div>
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

      {/* Categories — localized when home is set */}
      <HomeCategoryGrid />
    </main>
  )
}
