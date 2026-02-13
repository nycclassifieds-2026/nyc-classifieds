import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
  process.env.SUPABASE_SERVICE_KEY!.trim()
)

const SITE = 'https://thenycclassifieds.com'

// Self-promo ad creatives — we'll use placeholder image URLs
// These use via.placeholder.com with branded colors and text
const BLUE = '2563eb'
const WHITE = 'ffffff'

function promoImage(text: string, w = 600, h = 250) {
  return `https://placehold.co/${w}x${h}/${BLUE}/${WHITE}?text=${encodeURIComponent(text)}&font=dm-sans`
}

const expires = new Date(Date.now() + 365 * 86400000).toISOString() // 1 year

const ads = [
  // 1. Homepage
  {
    type: 'homepage',
    advertiser: 'NYC Classifieds',
    image_url: promoImage('Free. Real. Local. Verified.', 600, 250),
    link_url: `${SITE}/signup`,
    category_slug: null,
    borough_slug: null,
    neighborhood_slug: null,
  },

  // 5 Borough ads — one per borough, no category (will show as fallback on borough pages)
  // Using type 'borough' with a generic category
  ...[
    { slug: 'manhattan', name: 'Manhattan' },
    { slug: 'brooklyn', name: 'Brooklyn' },
    { slug: 'queens', name: 'Queens' },
    { slug: 'bronx', name: 'The Bronx' },
    { slug: 'staten-island', name: 'Staten Island' },
  ].map(b => ({
    type: 'borough',
    advertiser: 'NYC Classifieds',
    image_url: promoImage(`${b.name} Classifieds\\nFree & Verified`, 600, 200),
    link_url: `${SITE}/${b.slug}`,
    category_slug: 'for-sale', // need a category for borough type
    borough_slug: b.slug,
    neighborhood_slug: null,
  })),

  // 12 Category ads — one per top-level category, city-wide
  ...[
    { slug: 'housing', name: 'Housing', cta: 'Find Your NYC Home' },
    { slug: 'jobs', name: 'Jobs', cta: 'NYC Jobs — No Fees' },
    { slug: 'for-sale', name: 'For Sale', cta: 'Buy & Sell Local' },
    { slug: 'services', name: 'Services', cta: 'Hire Local Pros' },
    { slug: 'gigs', name: 'Gigs', cta: 'Find Gigs in NYC' },
    { slug: 'community', name: 'Community', cta: 'Join The Porch' },
    { slug: 'tickets', name: 'Tickets', cta: 'NYC Events & Tickets' },
    { slug: 'pets', name: 'Pets', cta: 'Pets in NYC' },
    { slug: 'personals', name: 'Personals', cta: 'Meet New Yorkers' },
    { slug: 'barter', name: 'Barter', cta: 'Trade — No Cash Needed' },
    { slug: 'rentals', name: 'Rentals', cta: 'Borrow & Lend Local' },
    { slug: 'resumes', name: 'Resumes', cta: 'Get Hired in NYC' },
  ].map(c => ({
    type: 'all-nyc' as const,
    advertiser: 'NYC Classifieds',
    image_url: promoImage(`${c.cta}\\nFree on NYC Classifieds`, 600, 200),
    link_url: `${SITE}/listings/${c.slug}`,
    category_slug: c.slug,
    borough_slug: null,
    neighborhood_slug: null,
  })),
]

async function seed() {
  console.log(`Seeding ${ads.length} ads...`)

  for (let i = 0; i < ads.length; i++) {
    const ad = ads[i]
    const { error } = await supabase.from('ads').insert({
      ...ad,
      active: true,
      starts_at: new Date().toISOString(),
      expires_at: expires,
    })

    if (error) {
      if (error.code === '23505') {
        console.log(`  [${i + 1}/${ads.length}] SKIP (slot taken): ${ad.type} ${ad.category_slug || ''} ${ad.borough_slug || ''}`)
      } else {
        console.error(`  [${i + 1}/${ads.length}] FAIL: ${error.message}`)
      }
    } else {
      console.log(`  [${i + 1}/${ads.length}] ${ad.type} ${ad.category_slug || ''} ${ad.borough_slug || ''} — ${ad.advertiser}`)
    }
  }

  console.log('Done!')
}

seed()
