import { boroughs, categories, neighborhoodSlug, slugify } from '@/lib/data'
import { websiteSchema, organizationSchema, faqSchema, collectionPageSchema, speakableSchema } from '@/lib/seo'
import Link from 'next/link'
import HomeSearch from './components/HomeSearch'
import BoroughNav from './components/BoroughNav'
import HomeCategoryGrid from './components/HomeCategoryGrid'
import HomepageAd from './components/HomepageAd'
import PreLaunchBanner from './components/PreLaunchBanner'

const faqs = [
  { question: 'What is The NYC Classifieds?', answer: 'The NYC Classifieds is a free local classifieds platform exclusively for New York City. Every user is geo-verified with a live selfie and GPS at their address, ensuring every listing is from a real New Yorker. It covers all 5 boroughs and 126+ neighborhoods.' },
  { question: 'Are NYC Classifieds really free?', answer: 'Yes, NYC Classifieds is 100% free. Free classifieds for every category — housing, jobs, for sale, services, gigs, and more. No fees to post listings, browse, or message other users. No premium tiers or hidden charges. Free forever.' },
  { question: 'How does geo-verification work on NYC Classifieds?', answer: 'When you sign up, you take a live selfie at your NYC address. GPS confirms you are within 50 feet of your registered location. This proves you actually live or work in New York City, eliminating bots, scammers, and fake accounts from local classifieds.' },
  { question: 'What can I post on free NYC classifieds?', answer: 'NYC Classifieds has 12 categories: Housing (apartments, rooms, sublets), Jobs, For Sale (furniture, electronics, clothing), Services (plumbers, cleaners, movers), Gigs, Community, Tickets and Events, Pets, Personals, Barter, Rentals and Lending, and Resumes. All free to post.' },
  { question: 'Is NYC Classifieds better than Craigslist for NYC?', answer: 'NYC Classifieds is built specifically for New York City with geo-verification that Craigslist does not have. Every user is verified to a real NYC address with a selfie and GPS. This eliminates the spam, scams, and fake listings common on other classifieds sites.' },
  { question: 'What neighborhoods does NYC Classifieds cover?', answer: 'NYC Classifieds covers 126+ neighborhoods across all five boroughs: Manhattan (41 neighborhoods including the Upper East Side, Upper West Side, Harlem, East Village, Chelsea, SoHo, Tribeca, and Greenwich Village), Brooklyn (30 neighborhoods including Williamsburg, Park Slope, Bushwick, DUMBO, and Brooklyn Heights), Queens (30 neighborhoods including Astoria, Flushing, Long Island City, and Jackson Heights), the Bronx (15 neighborhoods including Riverdale, Fordham, and Mott Haven), and Staten Island (10 neighborhoods including St. George and Tottenville). Each neighborhood has its own classifieds page and community board.' },
  { question: 'Can I list my business on NYC Classifieds for free?', answer: 'Yes. Businesses get a free profile page in the NYC Business Directory with hours, service area, photos, phone, and website. Your business appears in local classifieds search results and your borough and neighborhood pages. Completely free.' },
  { question: 'What is The Porch on NYC Classifieds?', answer: 'The Porch is a neighborhood community feed where verified residents share recommendations, ask questions, post alerts, report lost pets, list stoop sales, and connect with real neighbors. It is like a verified, spam-free local classifieds community board.' },
  { question: 'How do I find an apartment on NYC Classifieds?', answer: 'Go to the Housing category and browse Apartments, Rooms & Shared, Sublets, and more. You can filter by borough and neighborhood — for example, apartments in Manhattan or rooms in Brooklyn. Every listing is posted by a geo-verified NYC resident, so you know the person is real.' },
  { question: 'How do I find a job on NYC Classifieds?', answer: 'Browse the Jobs category which includes 41 subcategories — Software Engineering, Healthcare, Restaurant & Hospitality, Construction, Creative & Media, and more. Filter by borough to find jobs near you. You can also post your resume in the Resumes category for free.' },
  { question: 'How do I hire a service provider on NYC Classifieds?', answer: 'The Services category has 44 subcategories including Cleaning, Plumbing, Handyman, Moving & Hauling, Electrical, Painting, and more. Every service provider is geo-verified to their NYC address. You can also check the Business Directory for established local businesses.' },
  { question: 'Can I sell things on NYC Classifieds?', answer: 'Yes. The For Sale category has 32 subcategories including Furniture, Electronics, Clothing & Accessories, Bikes, Free Stuff, and more. Posting is completely free with no listing fees. You can also barter goods and skills in the Barter category.' },
]

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
    faqSchema(faqs),
    speakableSchema({ url: '/' }),
  ]

  const sectionHeading = { fontSize: '1.15rem', fontWeight: 700, color: '#111827', margin: '0 0 10px', letterSpacing: '-0.01em' } as const
  const sectionBody = { fontSize: '0.875rem', color: '#374151', lineHeight: 1.7 } as const
  const sectionWrap = { borderTop: '1px solid #e5e7eb', padding: '24px 0 0', marginTop: '24px' } as const
  const linkStyle = { color: '#1a56db', textDecoration: 'none', fontWeight: 500 } as const

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
          Free Local Classifieds for New York City — Housing, Jobs, Services & More
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', fontSize: '0.8125rem', color: '#374151' }}>
          <span><strong style={{ color: '#2563eb' }}>Geo-verified</strong> — Selfie + GPS at your address</span>
          <span><strong style={{ color: '#2563eb' }}>100% free</strong> — No fees, ever</span>
          <span><strong style={{ color: '#2563eb' }}>126+ neighborhoods</strong> — All 5 NYC boroughs</span>
          <span><strong style={{ color: '#2563eb' }}><Link href="/porch" style={{ color: '#059669', textDecoration: 'underline' }}>The Porch</Link></strong> — Neighbor Q&A, alerts, lost pets</span>
        </div>
      </section>

      {/* Desktop: search left, ad right | Mobile: stacked */}
      <section className="homepage-top" style={{ padding: '0', marginBottom: '0' }}>
        <h2 className="sr-only">Where to Find Free Classifieds in NYC — Apartments, Jobs, Services, For Sale, Gigs & Community</h2>
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

      {/* ═══════════════════════════════════════════════════════════════
          SERVER-RENDERED CONTENT FOR SEO
          Everything below is static HTML that Google can crawl immediately.
          ═══════════════════════════════════════════════════════════════ */}

      {/* ─── About Section ─── */}
      <section style={sectionWrap}>
        <h2 style={sectionHeading}>What Is The NYC Classifieds?</h2>
        <p style={sectionBody}>
          The NYC Classifieds is a free classifieds platform built exclusively for New York City. We connect real,
          geo-verified New Yorkers who want to buy, sell, find <Link href="/listings/housing" style={linkStyle}>housing</Link>,
          get hired through <Link href="/listings/jobs" style={linkStyle}>NYC job listings</Link>,
          offer <Link href="/listings/services" style={linkStyle}>services</Link>, and build community —
          neighborhood by neighborhood, across all five boroughs. Unlike Craigslist, Facebook Marketplace, or OfferUp,
          every user on NYC Classifieds is verified with a live selfie and GPS at their registered NYC address. No bots.
          No scams. No out-of-state spam.
        </p>
        <p style={{ ...sectionBody, marginTop: '8px' }}>
          Posting is <strong>100% free</strong> — no listing fees, no premium tiers, no paywalls. Whether you are looking
          for a <Link href="/listings/housing/apartments" style={linkStyle}>no-fee apartment in Manhattan</Link>,
          {' '}<Link href="/listings/housing/rooms-and-shared" style={linkStyle}>rooms and shared housing in Brooklyn</Link>, a
          {' '}<Link href="/listings/jobs/software-engineering" style={linkStyle}>software engineering job</Link>, a
          {' '}<Link href="/listings/jobs/restaurant-and-hospitality" style={linkStyle}>restaurant job in NYC</Link>, a
          {' '}<Link href="/listings/services/plumbing" style={linkStyle}>plumber near you</Link>,
          {' '}<Link href="/listings/services/cleaning" style={linkStyle}>cleaning services</Link>, or just want to
          sell your couch on <Link href="/listings/for-sale/furniture" style={linkStyle}>NYC furniture classifieds</Link> or
          find <Link href="/listings/for-sale/free-stuff" style={linkStyle}>free stuff in NYC</Link>,
          we have you covered. Browse classifieds in <Link href="/manhattan" style={linkStyle}>Manhattan</Link>,
          {' '}<Link href="/brooklyn" style={linkStyle}>Brooklyn</Link>,
          {' '}<Link href="/queens" style={linkStyle}>Queens</Link>,
          {' '}<Link href="/bronx" style={linkStyle}>the Bronx</Link>, and
          {' '}<Link href="/staten-island" style={linkStyle}>Staten Island</Link>.
        </p>
      </section>

      {/* ─── How Geo-Verification Works ─── */}
      <section style={sectionWrap}>
        <h2 style={sectionHeading}>How Geo-Verification Works</h2>
        <p style={sectionBody}>
          Every user takes a live selfie at their NYC address during sign-up. GPS confirms they are within 50 feet
          of their registered location. This 30-second process proves you are a real person who actually lives or
          works in New York City — eliminating the bots, scammers, and fake accounts that plague other classifieds sites.
          Your selfie is used for verification only and is not stored long-term. Your exact location is never shared —
          only your borough and neighborhood are visible to other users.
        </p>
      </section>

      {/* ─── Browse by Category (every subcategory linked) ─── */}
      <section style={sectionWrap}>
        <h2 style={sectionHeading}>Browse Free NYC Classifieds by Category</h2>
        <p style={{ ...sectionBody, marginBottom: '12px' }}>
          NYC Classifieds has 12 categories covering everything New Yorkers need — from apartments and jobs to
          services, for sale items, gigs, community events, and more. Every listing is from a geo-verified NYC resident.
        </p>
        {categories.map(cat => {
          const isCommunity = cat.slug === 'community'
          const catHref = isCommunity ? '/porch' : `/listings/${cat.slug}`
          return (
            <div key={cat.slug} style={{ marginBottom: '14px' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>
                <Link href={catHref} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: '#111827',
                }}>
                  <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '2px', backgroundColor: cat.color, flexShrink: 0 }} />
                  {cat.name}
                </Link>
                {' '}
                <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 400 }}>
                  ({cat.subs.length} subcategories)
                </span>
              </h3>
              <div style={{ paddingLeft: '13px', display: 'flex', flexWrap: 'wrap', gap: '0 8px' }}>
                {cat.subs.map(sub => (
                  <Link key={sub} href={isCommunity ? '/porch' : `/listings/${cat.slug}/${slugify(sub)}`} style={{
                    fontSize: '0.75rem', color: '#1a56db', textDecoration: 'none', lineHeight: 1.7,
                  }}>
                    {sub}
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </section>

      {/* ─── Browse by Borough & Neighborhood (every neighborhood linked) ─── */}
      <section style={sectionWrap}>
        <h2 style={sectionHeading}>NYC Classifieds by Borough & Neighborhood</h2>
        <p style={{ ...sectionBody, marginBottom: '12px' }}>
          Every neighborhood in New York City has its own classifieds page. Browse listings and community posts from
          your block, your borough, or the entire city. 126+ neighborhoods across all 5 boroughs.
        </p>
        {boroughs.map(b => (
          <div key={b.slug} style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
              <Link href={`/${b.slug}`} style={{ ...linkStyle, color: '#111827' }}>
                {b.name} Classifieds
              </Link>
              {' '}
              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 400 }}>
                ({b.neighborhoods.length} neighborhoods)
              </span>
            </h3>
            {/* Category links for this borough */}
            <div style={{ paddingLeft: '4px', display: 'flex', flexWrap: 'wrap', gap: '0 8px', marginBottom: '4px' }}>
              {categories.filter(c => c.slug !== 'community').map(cat => (
                <Link key={cat.slug} href={`/${b.slug}/${cat.slug}`} style={{
                  fontSize: '0.6875rem', color: cat.color, textDecoration: 'none', lineHeight: 1.7, fontWeight: 500,
                }}>
                  {cat.name}
                </Link>
              ))}
              <Link href={`/porch/${b.slug}`} style={{
                fontSize: '0.6875rem', color: '#059669', textDecoration: 'none', lineHeight: 1.7, fontWeight: 500,
              }}>
                The Porch
              </Link>
            </div>
            {/* Neighborhood links */}
            <div style={{ paddingLeft: '4px', display: 'flex', flexWrap: 'wrap', gap: '0 10px' }}>
              {b.neighborhoods.map(n => (
                <Link key={n} href={`/${b.slug}/${neighborhoodSlug(n)}`} style={{
                  fontSize: '0.75rem', color: '#1a56db', textDecoration: 'none', lineHeight: 1.7,
                }}>
                  {n}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ─── The Porch ─── */}
      <section style={sectionWrap}>
        <h2 style={sectionHeading}>The Porch — NYC Neighborhood Community Board</h2>
        <p style={sectionBody}>
          Classifieds are only half the story. <Link href="/porch" style={linkStyle}>The Porch</Link> is our
          neighborhood community feed where verified NYC residents share recommendations, post alerts about
          package thefts or water main breaks, organize block parties and events, report lost pets, list stoop
          sales, and welcome newcomers. Think of it as the digital version of sitting on your front stoop and
          chatting with the people who actually live around you — except every person is verified.
        </p>
        <div style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', fontSize: '0.8125rem', marginBottom: '8px' }}>
            <Link href="/porch" style={{ ...linkStyle, fontWeight: 600 }}>All NYC</Link>
            {boroughs.map(b => (
              <Link key={b.slug} href={`/porch/${b.slug}`} style={linkStyle}>{b.name}</Link>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '4px 0 0' }}>
            Post types: Recommendations, Questions, Alerts, Lost & Found, Events, Stoop Sales, Garage Sales,
            Volunteer, Carpool, Pet Sightings, Welcome, Groups, Seasonal, Shoutouts
          </p>
        </div>
      </section>

      {/* ─── NYC Business Directory ─── */}
      <section style={sectionWrap}>
        <h2 style={sectionHeading}>Free NYC Business Directory</h2>
        <p style={sectionBody}>
          List your business for free in the <Link href="/business" style={linkStyle}>NYC Business Directory</Link>.
          Every business gets a free profile page with hours, service area, photos, phone number, and website.
          Your business appears in local search results and in your borough and neighborhood pages. Whether
          you are a plumber in Brooklyn, a hair salon in Queens, a dog walker in Manhattan, or a restaurant in
          the Bronx — the directory is completely free, forever.
        </p>
      </section>

      {/* ─── Popular Searches ─── */}
      <section style={sectionWrap}>
        <h2 style={sectionHeading}>Popular NYC Classifieds Searches</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 0' }}>
          {[
            { label: 'Apartments in Manhattan', href: '/manhattan/housing' },
            { label: 'Rooms & Shared Brooklyn', href: '/listings/housing/rooms-and-shared' },
            { label: 'Sublets NYC', href: '/listings/housing/sublets' },
            { label: 'No-Fee Apartments', href: '/listings/housing/apartments' },
            { label: 'Jobs in NYC', href: '/listings/jobs' },
            { label: 'Software Engineering Jobs', href: '/listings/jobs/software-engineering' },
            { label: 'Restaurant Jobs NYC', href: '/listings/jobs/restaurant-and-hospitality' },
            { label: 'Remote Jobs NYC', href: '/listings/jobs/remote---hybrid' },
            { label: 'Part-Time Jobs', href: '/listings/jobs/part-time' },
            { label: 'Healthcare Jobs', href: '/listings/jobs/healthcare' },
            { label: 'Furniture for Sale', href: '/listings/for-sale/furniture' },
            { label: 'Free Stuff NYC', href: '/listings/for-sale/free-stuff' },
            { label: 'Electronics for Sale', href: '/listings/for-sale/electronics' },
            { label: 'Bikes for Sale NYC', href: '/listings/for-sale/bikes' },
            { label: 'Sneakers & Streetwear', href: '/listings/for-sale/sneakers-and-streetwear' },
            { label: 'Cleaning Services', href: '/listings/services/cleaning' },
            { label: 'Moving & Hauling', href: '/listings/services/moving-and-hauling' },
            { label: 'Handyman NYC', href: '/listings/services/handyman' },
            { label: 'Plumbing Services', href: '/listings/services/plumbing' },
            { label: 'Dog Walking Gigs', href: '/listings/gigs/dog-walking' },
            { label: 'Delivery Gigs', href: '/listings/gigs/delivery-runs' },
            { label: 'Broadway Tickets', href: '/listings/tickets/broadway' },
            { label: 'Concert Tickets NYC', href: '/listings/tickets/concerts' },
            { label: 'Pet Adoption NYC', href: '/listings/pets/adoption' },
            { label: 'Lost & Found Pets', href: '/listings/pets/lost-and-found-pets' },
            { label: 'Manhattan Classifieds', href: '/manhattan' },
            { label: 'Brooklyn Classifieds', href: '/brooklyn' },
            { label: 'Queens Classifieds', href: '/queens' },
            { label: 'Bronx Classifieds', href: '/bronx' },
            { label: 'Staten Island', href: '/staten-island' },
            { label: 'Williamsburg', href: '/brooklyn/williamsburg' },
            { label: 'Astoria', href: '/queens/astoria' },
            { label: 'Upper West Side', href: '/manhattan/upper-west-side' },
            { label: 'Park Slope', href: '/brooklyn/park-slope' },
            { label: 'Harlem', href: '/manhattan/harlem' },
            { label: 'Long Island City', href: '/queens/long-island-city' },
            { label: 'Bushwick', href: '/brooklyn/bushwick' },
            { label: 'East Village', href: '/manhattan/east-village' },
            { label: 'Flushing', href: '/queens/flushing' },
            { label: 'The Porch', href: '/porch' },
            { label: 'Business Directory', href: '/business' },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{
              fontSize: '0.8125rem', color: '#1a56db', textDecoration: 'none',
              padding: '4px 12px', borderRadius: '4px', border: '1px solid #e5e7eb',
              marginRight: '6px', marginBottom: '4px', whiteSpace: 'nowrap',
            }}>
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Why NYC Classifieds ─── */}
      <section style={sectionWrap}>
        <h2 style={sectionHeading}>Why New Yorkers Choose NYC Classifieds Over Craigslist</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {[
            { title: 'Every User Is Verified', desc: 'Selfie + GPS at your NYC address. No anonymous accounts, no bots, no out-of-state scammers. Every listing is from a real New Yorker.' },
            { title: '100% Free, Forever', desc: 'No listing fees, no premium tiers, no paywalls on any feature. Post classifieds, browse listings, message users — all free.' },
            { title: '126+ Neighborhoods', desc: 'From Astoria to Bay Ridge, Harlem to Williamsburg. Every NYC neighborhood has its own classifieds page and community board.' },
            { title: 'The Porch Community', desc: 'Neighborhood Q&A, alerts, lost pets, stoop sales, event listings, and recommendations from real, verified neighbors.' },
            { title: 'Built for NYC', desc: 'Not a national platform with an NYC filter. Built from the ground up for New York City — every borough, every neighborhood.' },
            { title: 'Free Business Directory', desc: 'Local businesses get free profiles with hours, photos, service area, and contact info. Visible in neighborhood search results.' },
          ].map(card => (
            <div key={card.title} style={{
              padding: '14px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff',
            }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>{card.title}</h3>
              <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: 1.6 }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FAQ (visible on page, matches JSON-LD) ─── */}
      <section style={sectionWrap}>
        <h2 style={sectionHeading}>Frequently Asked Questions About NYC Classifieds</h2>
        <div>
          {faqs.map((faq, i) => (
            <details key={i} style={{
              borderBottom: '1px solid #e5e7eb', padding: '12px 0',
            }}>
              <summary style={{
                fontSize: '0.875rem', fontWeight: 600, color: '#111827', cursor: 'pointer',
                listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                {faq.question}
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: '8px', flexShrink: 0 }}>+</span>
              </summary>
              <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: 1.7, marginTop: '8px', paddingRight: '24px' }}>
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ─── Site Resources ─── */}
      <section style={sectionWrap}>
        <h2 style={sectionHeading}>Explore The NYC Classifieds</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px', fontSize: '0.8125rem' }}>
          <Link href="/about" style={linkStyle}>About Us</Link>
          <Link href="/blog" style={linkStyle}>Blog</Link>
          <Link href="/business" style={linkStyle}>Business Directory</Link>
          <Link href="/porch" style={linkStyle}>The Porch</Link>
          <Link href="/search" style={linkStyle}>Search</Link>
          <Link href="/guidelines" style={linkStyle}>Community Guidelines</Link>
          <Link href="/terms" style={linkStyle}>Terms of Service</Link>
          <Link href="/privacy" style={linkStyle}>Privacy Policy</Link>
          <Link href="/signup" style={linkStyle}>Sign Up</Link>
          <Link href="/login" style={linkStyle}>Log In</Link>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ ...sectionWrap, textAlign: 'center', paddingBottom: '16px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
          Ready to Join Your NYC Neighbors?
        </h2>
        <p style={{ ...sectionBody, marginBottom: '16px', maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto' }}>
          Sign up in 30 seconds, get geo-verified, and start posting free classifieds in your neighborhood.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup" style={{
            display: 'inline-block', padding: '10px 28px', borderRadius: '8px',
            backgroundColor: '#1a56db', color: '#ffffff', fontSize: '0.9375rem',
            fontWeight: 600, textDecoration: 'none',
          }}>
            Sign Up Free
          </Link>
          <Link href="/about" style={{
            display: 'inline-block', padding: '10px 28px', borderRadius: '8px',
            border: '1px solid #e5e7eb', color: '#111827', fontSize: '0.9375rem',
            fontWeight: 500, textDecoration: 'none',
          }}>
            Learn More
          </Link>
        </div>
      </section>
    </main>
  )
}
