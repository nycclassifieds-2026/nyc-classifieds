import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
  process.env.SUPABASE_SERVICE_KEY!.trim()
)

const SITE = 'https://thenycclassifieds.com'

// Better test ads — look like real local business ads
const categoryAds: Record<string, { advertiser: string; text: string; color: string; link: string }> = {
  'housing': { advertiser: 'StreetEasy NYC', text: 'Find Your NYC Apartment\\nNo Fee Rentals Available', color: '1a1a2e', link: `${SITE}/listings/housing` },
  'jobs': { advertiser: 'NYC Career Center', text: 'Hiring Now in NYC\\n500+ Local Jobs This Week', color: '0f172a', link: `${SITE}/listings/jobs` },
  'for-sale': { advertiser: 'NYC Marketplace', text: 'Sell Your Stuff for Free\\nReach Real NYC Buyers', color: '1e3a5f', link: `${SITE}/listings/for-sale` },
  'services': { advertiser: 'NYC Business Directory', text: 'Find Local Pros\\nPlumbers, Cleaners, Movers & More', color: '7c2d12', link: `${SITE}/business` },
  'gigs': { advertiser: 'Quick Gigs NYC', text: 'Need Help Today?\\nFind Local Gig Workers Fast', color: '78350f', link: `${SITE}/listings/gigs` },
  'community': { advertiser: 'The Porch', text: 'Your Neighborhood Feed\\nAlerts, Lost Pets, Local Q&A', color: '064e3b', link: `${SITE}/porch` },
  'tickets': { advertiser: 'NYC Live Events', text: 'Broadway, Concerts, Comedy\\nBuy & Sell Tickets Locally', color: '4c1d95', link: `${SITE}/listings/tickets` },
  'pets': { advertiser: 'NYC Pet Connect', text: 'Adopt, Rehome, Find Pet Services\\nLocal & Verified', color: '365314', link: `${SITE}/listings/pets` },
  'personals': { advertiser: 'NYC Connections', text: 'Meet Real New Yorkers\\nVerified Profiles Only', color: '831843', link: `${SITE}/listings/personals` },
  'barter': { advertiser: 'NYC Barter Network', text: 'Trade Skills & Stuff\\nNo Cash Needed', color: '581c87', link: `${SITE}/listings/barter` },
  'rentals': { advertiser: 'NYC Lend & Borrow', text: 'Borrow Tools, Gear & More\\nFrom Your Neighbors', color: '3730a3', link: `${SITE}/listings/rentals` },
  'resumes': { advertiser: 'NYC Career Hub', text: 'Post Your Resume\\nGet Found by NYC Employers', color: '1f2937', link: `${SITE}/listings/resumes` },
}

const boroughAds: Record<string, { text: string }> = {
  'manhattan': { text: 'Shop Manhattan\\nFree Local Classifieds' },
  'brooklyn': { text: 'Shop Brooklyn\\nFree Local Classifieds' },
  'queens': { text: 'Shop Queens\\nFree Local Classifieds' },
  'bronx': { text: 'Shop The Bronx\\nFree Local Classifieds' },
  'staten-island': { text: 'Shop Staten Island\\nFree Local Classifieds' },
}

async function update() {
  // Update category (all-nyc) ads
  for (const [slug, ad] of Object.entries(categoryAds)) {
    const imageUrl = `https://placehold.co/728x200/${ad.color}/ffffff?text=${encodeURIComponent(ad.text)}&font=dm-sans`
    const { error } = await supabase
      .from('ads')
      .update({
        advertiser: ad.advertiser,
        image_url: imageUrl,
        link_url: ad.link,
        updated_at: new Date().toISOString(),
      })
      .eq('type', 'all-nyc')
      .eq('category_slug', slug)

    if (error) {
      console.error(`FAIL category ${slug}:`, error.message)
    } else {
      console.log(`Updated category: ${slug} — ${ad.advertiser}`)
    }
  }

  // Update borough ads
  for (const [slug, ad] of Object.entries(boroughAds)) {
    const imageUrl = `https://placehold.co/728x200/111827/ffffff?text=${encodeURIComponent(ad.text)}&font=dm-sans`
    const { error } = await supabase
      .from('ads')
      .update({
        advertiser: 'NYC Classifieds',
        image_url: imageUrl,
        link_url: `${SITE}/${slug}`,
        updated_at: new Date().toISOString(),
      })
      .eq('type', 'borough')
      .eq('borough_slug', slug)

    if (error) {
      console.error(`FAIL borough ${slug}:`, error.message)
    } else {
      console.log(`Updated borough: ${slug}`)
    }
  }

  console.log('Done!')
}

update()
