import type { Metadata } from 'next'
import { Suspense } from 'react'
import { categories, categoryBySlug, slugify } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'
import CategoryPageClient from './CategoryPageClient'

export async function generateStaticParams() {
  return categories.map(c => ({ category: c.slug }))
}

// Custom per-category SEO copy
const categoryMeta: Record<string, { title: string; desc: string }> = {
  'housing': {
    title: 'NYC Apartments & Housing — No-Fee Rentals, Rooms & Sublets',
    desc: 'Find apartments, rooms, sublets & real estate in NYC. Every landlord is verified with a selfie + GPS. No-fee rentals across Manhattan, Brooklyn, Queens, Bronx & Staten Island.',
  },
  'jobs': {
    title: 'NYC Jobs — Now Hiring Across All 5 Boroughs',
    desc: 'Find local jobs in NYC — restaurants, tech, healthcare, trades, finance & more. No recruiter fees. Every employer is geo-verified to a real NYC address. Post jobs free.',
  },
  'for-sale': {
    title: 'Buy & Sell in NYC — Furniture, Electronics, Vintage & More',
    desc: 'Buy & sell furniture, electronics, clothing, bikes, sneakers & more in NYC. Free to post. Every seller is verified with a selfie at their NYC address. No bots, no scams.',
  },
  'services': {
    title: 'NYC Services — Hire Verified Plumbers, Cleaners, Movers & Local Pros',
    desc: 'Find trusted local service providers in NYC. Plumbing, cleaning, moving, handyman, tutoring & 40+ categories. Every pro is geo-verified. Free to list your business.',
  },
  'gigs': {
    title: 'NYC Gigs — Find Quick Work or Hire Local Help Today',
    desc: 'Pick up gigs in NYC — dog walking, moving help, event setup, delivery & more. Or post a gig and hire a verified local worker. All gig posters are geo-verified.',
  },
  'community': {
    title: 'NYC Community Board — Events, Lost & Found, Stoop Sales & More',
    desc: 'Your local community feed for NYC. Share recommendations, post alerts, report lost pets, list stoop sales & connect with verified neighbors across 126+ neighborhoods.',
  },
  'tickets': {
    title: 'NYC Tickets & Events — Broadway, Concerts, Comedy & Sports',
    desc: 'Buy & sell tickets to NYC events. Broadway shows, comedy clubs, concerts, sports & festivals. Verified sellers only — no bots, no scams. Post tickets free.',
  },
  'pets': {
    title: 'NYC Pets — Adopt Dogs & Cats, Find Pet Sitters & Walkers',
    desc: 'Adopt pets, find dog walkers, groomers & pet sitters in NYC. Every user is geo-verified. Help NYC animals find loving homes. Free to post.',
  },
  'personals': {
    title: 'NYC Personals — Meet Verified New Yorkers Near You',
    desc: 'Activity partners, missed connections & platonic friendships in NYC. Every user is verified with a selfie at their real address. Real people, real neighborhoods.',
  },
  'barter': {
    title: 'NYC Barter — Trade Skills & Stuff with Your Neighbors',
    desc: 'Swap goods for goods, skills for skills, or mix & match with real NYC neighbors. No cash needed. Everyone is geo-verified to their NYC address.',
  },
  'rentals': {
    title: 'NYC Rentals & Lending — Borrow Tools, Cameras, Gear & More',
    desc: 'Borrow from your NYC neighbors instead of buying. Tools, cameras, sports gear, party supplies & more. All users are geo-verified. Free to list.',
  },
  'resumes': {
    title: 'NYC Resumes — Post Yours Free, Get Found by Local Employers',
    desc: 'Post your resume for free and get found by NYC employers hiring now. Browse candidates across tech, healthcare, trades, finance & 30+ fields. Verified profiles only.',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params
  const cat = categoryBySlug[category]
  if (!cat) return { title: 'Not Found' }

  const custom = categoryMeta[cat.slug]
  const subList = cat.subs.slice(0, 8).join(', ')
  return buildMetadata({
    title: custom?.title || `${cat.name} in New York City — Free ${cat.name} Listings`,
    description: custom?.desc || `Browse free ${cat.name.toLowerCase()} listings in NYC. ${subList}, and more from geo-verified New Yorkers.`,
    path: `/listings/${cat.slug}`,
  })
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const cat = categoryBySlug[category]

  // JSON-LD for category page
  const subItems = cat?.subs.map(s => ({
    name: `${s} in NYC`,
    url: `/listings/${category}/${slugify(s)}`,
  })) || []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${cat?.name || category} in New York City`,
    description: `Browse free ${(cat?.name || category).toLowerCase()} listings across all five NYC boroughs.`,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thenycclassifieds.com'}/listings/${category}`,
    isPartOf: { '@type': 'WebSite', name: 'The NYC Classifieds' },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: subItems.length,
      itemListElement: subItems.map((item, i) => ({
        '@type': 'ListItem', position: i + 1, name: item.name,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thenycclassifieds.com'}${item.url}`,
      })),
    },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: process.env.NEXT_PUBLIC_SITE_URL || 'https://thenycclassifieds.com' },
      { '@type': 'ListItem', position: 2, name: cat?.name || category, item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thenycclassifieds.com'}/listings/${category}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>}>
        <CategoryPageClient categorySlug={category} />
      </Suspense>
    </>
  )
}
