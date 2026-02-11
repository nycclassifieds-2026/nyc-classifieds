import { howToSchema, faqSchema, itemListSchema } from './seo'

type SchemaEntry =
  | { type: 'howto'; name: string; description: string; steps: { name: string; text: string }[] }
  | { type: 'faq'; items: { question: string; answer: string }[] }
  | { type: 'itemlist'; name: string; description: string; items: { name: string; url?: string }[] }

// Secondary schemas for blog posts that qualify for rich results
// (HowTo, FAQPage, or ItemList in addition to the base Article schema)
const schemas: Record<string, SchemaEntry> = {

  // ── HowTo ──────────────────────────────────────────────────

  'how-to-write-a-listing-that-sells-fast': {
    type: 'howto',
    name: 'How to Write a Classified Ad That Sells Fast',
    description: 'Step-by-step guide to writing classifieds listings that sell quickly in NYC.',
    steps: [
      { name: 'Start with the photo', text: 'Shoot in natural light, show the full item in context, and include close-ups of any wear or damage. Take at least three photos: one wide shot, one detail shot, and one showing scale.' },
      { name: 'Write a specific title', text: 'Your title should answer three questions: What is it? What condition? What neighborhood? Include brand, model, color, and pickup location.' },
      { name: 'Price it right', text: 'Check what similar items sell for. Used furniture in good condition sells for 30–50% of retail. Price 10–15% below average to sell fast.' },
      { name: 'Write a description that builds trust', text: 'Include condition details, dimensions, age and history, reason for selling, and pickup details like floor number and elevator access. Be honest about flaws.' },
      { name: 'Choose the right category', text: 'Post in the correct category and subcategory so your listing appears in front of the right buyers.' },
    ],
  },

  'nyc-apartment-hunting-survival-guide-2026': {
    type: 'howto',
    name: 'How to Find an Apartment in NYC in 2026',
    description: 'Step-by-step guide to apartment hunting in New York City after the FARE Act eliminated broker fees.',
    steps: [
      { name: 'Understand the FARE Act changes', text: 'The FARE Act eliminated tenant-paid broker fees across NYC, saving roughly $13,000 on move-in costs. Your costs are now just first month\'s rent and security deposit.' },
      { name: 'Meet the 40x income rule', text: 'Your annual salary should be at least 40 times your monthly rent. For a $2,500 apartment, that means $100,000/year. If you\'re short, find a guarantor.' },
      { name: 'Prepare your documents', text: 'Gather photo ID, three months of pay stubs, bank statements, tax returns, and an employment letter before you start looking.' },
      { name: 'Search the right platforms', text: 'Start with NYC HPD\'s apartment hunting page for affordable housing lotteries. Use StreetEasy for market-rate listings and geo-verified platforms for scam-free results.' },
      { name: 'Time your search strategically', text: 'Hunt in winter (November through February) when rents typically dip 3–5% compared to summer peaks.' },
      { name: 'Check for red flags before signing', text: 'Look up your building through HPD\'s online portal for violations, Google your landlord, and never send money before seeing the apartment in person.' },
    ],
  },

  'first-time-buyers-guide-spotting-legit-listings': {
    type: 'howto',
    name: 'How to Spot Fake Listings and Avoid Online Scams',
    description: 'Step-by-step guide to identifying legitimate classifieds listings and avoiding scams when buying online.',
    steps: [
      { name: 'Check the price against market rates', text: 'If a listing is dramatically below market rate, it\'s bait. A one-bedroom in the West Village for $1,400 or a MacBook Pro for $200 are clear scam signals.' },
      { name: 'Resist urgency pressure', text: 'Legitimate sellers don\'t pressure you into instant decisions. If someone says "I need a deposit today," slow down and verify.' },
      { name: 'Insist on meeting in person', text: 'Anyone selling something in NYC should be willing to meet locally. If they\'re "traveling" or "out of state" but have an active listing, walk away.' },
      { name: 'Use safe payment methods only', text: 'Avoid wire transfers, gift cards, cryptocurrency, or Zelle to strangers. Stick to cash for in-person sales.' },
      { name: 'Choose verified platforms', text: 'Use platforms with identity and location verification. Unverified platforms attract scammers because there\'s no cost to creating fake listings.' },
      { name: 'Follow the safe buying checklist', text: 'Research the price, communicate on-platform, meet in public, inspect before paying, trust your gut, and report suspicious listings.' },
    ],
  },

  'moving-to-nyc-classifieds-survival-guide': {
    type: 'howto',
    name: 'How to Move to NYC: The Complete First-Timer\'s Guide',
    description: 'Step-by-step guide to moving to New York City — finding an apartment, hiring movers, furnishing, and meeting neighbors.',
    steps: [
      { name: 'Find your apartment', text: 'Use the FARE Act savings (no broker fees), search in winter for lower rents, check the Rent Guidelines Board\'s free resources, and browse geo-verified housing listings.' },
      { name: 'Hire movers smartly', text: 'Get at least three quotes from licensed, insured movers. Insist on written quotes based on an inventory check. Ask your building about insurance requirements.' },
      { name: 'Furnish without going broke', text: 'Buy secondhand furniture from classifieds. End of month is the best time to find deals when leases turn over and people need to sell before moving.' },
      { name: 'Set up essential services', text: 'Line up internet, cleaning, locksmith, and handyman services. Find verified local providers through services classifieds.' },
      { name: 'Meet your neighbors', text: 'Use The Porch community feed organized by borough and neighborhood. Introduce yourself, ask for local recommendations, and find your go-to spots.' },
    ],
  },

  'fake-apartment-scams-how-to-spot-them-2026': {
    type: 'howto',
    name: 'How to Spot Fake Apartment Listings in NYC',
    description: 'Step-by-step guide to identifying fake apartment listings and avoiding rental scams in New York City in 2026.',
    steps: [
      { name: 'Learn how modern scams work', text: 'Scammers now use AI-generated photos, clone legitimate listings at lower prices, and create fake landlord personas with Google Voice numbers.' },
      { name: 'Watch for below-market rent', text: 'If a one-bedroom in the West Village is listed at $1,500, it\'s a scam. Trust your knowledge of NYC market rates.' },
      { name: 'Never pay before seeing the apartment', text: 'Any request for a deposit or application fee before you\'ve physically entered the apartment is a red flag.' },
      { name: 'Verify ownership', text: 'Look up the building on NYC\'s ACRIS system or the Department of Buildings website. Confirm the person actually owns or manages the property.' },
      { name: 'Reverse-image search listing photos', text: 'If the photos show up on other listings with different addresses, walk away. Ask for a photo with today\'s date.' },
      { name: 'Use only traceable payment methods', text: 'Use a check made out to a named entity or pay through a verified management company portal. Never wire money or use Venmo to strangers.' },
    ],
  },

  'guide-to-the-porch-nycs-local-feed': {
    type: 'howto',
    name: 'How to Use The Porch — NYC\'s Free Local Community Feed',
    description: 'Step-by-step guide to getting the most out of The Porch, NYC\'s neighborhood-based community feed.',
    steps: [
      { name: 'Browse by borough and neighborhood', text: 'The Porch is structured by borough and neighborhood. Open it to see conversations from your area, then drill into your specific neighborhood.' },
      { name: 'Learn the post types', text: 'The Porch supports Neighborhood Questions, Recommendations, Local Alerts, Events, Lost & Found, Pet Sightings, and Welcome posts.' },
      { name: 'Start by reading', text: 'See what your neighbors are talking about before you post. Get a feel for the vibe and the kinds of conversations happening.' },
      { name: 'Ask questions and share what you know', text: 'Ask neighborhood-specific questions. Share your favorite local businesses, restaurants, and service providers.' },
      { name: 'Post events and report bad actors', text: 'Share stoop sales, block parties, and community meetings. Flag spam or suspicious activity to keep the community safe.' },
    ],
  },

  // ── FAQ ─────────────────────────────────────────────────────

  'free-forever-and-we-mean-it': {
    type: 'faq',
    items: [
      { question: 'Is The NYC Classifieds really free to post on?', answer: 'Yes. Posting is completely free across all 12 categories — no listing fees, no premium tiers, no per-listing charges. Whether you\'re listing a studio apartment or giving away a bookshelf, it costs nothing.' },
      { question: 'How does The NYC Classifieds make money if it\'s free?', answer: 'Through small, clearly-labeled local business advertising and optional paid business tools like promoted listings, analytics dashboards, and verified business profiles. The core platform remains free for individuals.' },
      { question: 'Will The NYC Classifieds start charging users in the future?', answer: 'No. Individual posting, messaging, community features like The Porch, alerts, and recommendations will never be paywalled or charged for.' },
      { question: 'Does The NYC Classifieds sell user data?', answer: 'No. Browsing habits, messages, and location history are never sold. There is no behavioral tracking, no advertising profiles, and no data sold to third parties.' },
    ],
  },

  'everything-we-do-to-keep-you-safe': {
    type: 'faq',
    items: [
      { question: 'How does The NYC Classifieds verify users are real?', answer: 'Every user must complete GPS verification confirming they\'re in NYC\'s five boroughs and take a real-time selfie during signup. This confirms a real person is creating the account, not a bot or fake profile.' },
      { question: 'How does content moderation work on The NYC Classifieds?', answer: 'Every listing and Porch post is scanned before publication. The system blocks spam, prohibited items, hate speech, known scam patterns, and exposed contact information.' },
      { question: 'Can other users see my email or phone number?', answer: 'No. All messaging happens on-platform. Your personal contact information is never visible to other users unless you choose to share it in a conversation.' },
      { question: 'What happens when someone violates the rules?', answer: 'First offense gets a warning, repeated offenses lead to temporary suspension, and serious or continued violations result in a permanent ban.' },
      { question: 'How do I report suspicious activity on The NYC Classifieds?', answer: 'Every post and listing has a flag button. When you flag something, it goes into a review queue and is evaluated quickly. Every profile and conversation also includes block and report options.' },
    ],
  },

  'security-isnt-a-feature-its-the-foundation': {
    type: 'faq',
    items: [
      { question: 'Why does The NYC Classifieds require verification before posting?', answer: 'GPS and selfie verification ensure every user is a real person actually in NYC, eliminating bots, out-of-state scammers, and fake accounts before they can post.' },
      { question: 'Does verification reduce signups?', answer: 'Some users bounce at the verification step, but that trade-off is intentional. Users who complete verification are real New Yorkers who value trust.' },
      { question: 'How does verification improve the platform experience?', answer: 'When every user is verified, messaging works without spam bots, community features are stronger because people aren\'t anonymous, and moderation is more effective.' },
      { question: 'What makes The NYC Classifieds safer than Craigslist or Facebook Marketplace?', answer: 'Other platforms have no user verification. The NYC Classifieds requires GPS location and selfie confirmation before anyone can post, creating accountability that prevents scams.' },
    ],
  },

  'job-scams-targeting-new-yorkers-2026': {
    type: 'faq',
    items: [
      { question: 'How do I spot a fake remote job offer in NYC?', answer: 'If a remote job pays surprisingly well for minimal qualifications and the company asks you to buy equipment, pay for training, or provide banking info upfront, it\'s a scam. A real employer never asks you to pay.' },
      { question: 'What is an advance fee job scam?', answer: 'You\'re "hired" quickly, then asked to pay for a background check or certification. They may send a check to cover expenses and ask you to forward part. The check bounces and your money is gone.' },
      { question: 'Can a fake job listing steal my identity?', answer: 'Yes. Some fake listings exist solely to harvest your Social Security number, bank details, or copies of your ID. Never provide your SSN on an initial application.' },
      { question: 'What are the red flags of a job scam?', answer: 'Vague descriptions, no company name, interviews only over chat, being "hired" after five minutes with no references, and pressure to answer immediately.' },
      { question: 'What should I do if I fell for a job scam in NYC?', answer: 'Contact your bank immediately, place a fraud alert on your credit reports, file a report with the FTC at reportfraud.ftc.gov, and report the listing to the platform.' },
    ],
  },

  // ── ItemList ────────────────────────────────────────────────

  'best-thrift-stores-stoop-sales-vintage-finds-nyc': {
    type: 'itemlist',
    name: 'Best Thrift Stores and Vintage Shops in NYC',
    description: 'A curated list of the best thrift stores, vintage shops, stoop sales, and secondhand finds across New York City.',
    items: [
      { name: 'East Village thrift shops' },
      { name: 'Williamsburg vintage stores' },
      { name: 'Chelsea and West Village upscale consignment' },
      { name: 'L Train Vintage' },
      { name: 'Tokio7' },
      { name: 'Housing Works' },
      { name: 'City Opera Thrift Shop' },
      { name: 'West 104th Street Block Association Yard Sale' },
    ],
  },

  'nyc-hottest-job-market-sectors-2026': {
    type: 'itemlist',
    name: 'Hottest Job Market Sectors in NYC (2026)',
    description: 'The top industries hiring in New York City in 2026, from tech and healthcare to finance and the gig economy.',
    items: [
      { name: 'Technology — AI, machine learning, data infrastructure' },
      { name: 'Healthcare — clinical research, physician assistants, biotech' },
      { name: 'Finance and fintech' },
      { name: 'Business and professional services' },
      { name: 'Gig economy — delivery, content creation, event staffing, tutoring' },
    ],
  },

  'nyc-events-cheat-sheet-2026': {
    type: 'itemlist',
    name: 'NYC Events Calendar 2026',
    description: 'The biggest concerts, Broadway shows, festivals, and events coming to New York City in 2026.',
    items: [
      { name: 'FIFA World Cup at MetLife Stadium (June–July 2026)' },
      { name: 'Lady Gaga Mayhem Ball at Madison Square Garden' },
      { name: 'My Chemical Romance at Citi Field' },
      { name: 'NY Philharmonic free summer borough tour' },
      { name: 'River to River Festival in Lower Manhattan' },
    ],
  },

  'most-walkable-nyc-neighborhoods-where-community-thrives': {
    type: 'itemlist',
    name: 'Most Walkable Neighborhoods in NYC',
    description: 'The most walkable neighborhoods in New York City ranked by Walk Score and community strength.',
    items: [
      { name: 'Little Italy — Walk Score 100' },
      { name: 'NoLita — Walk Score 100' },
      { name: 'Chinatown — Walk Score 100' },
      { name: 'Greenwich Village — Walk Score 100' },
      { name: 'West Village' },
      { name: 'East Village' },
      { name: 'Williamsburg' },
      { name: 'Astoria' },
      { name: 'Park Slope' },
      { name: 'Jackson Heights' },
      { name: 'Sunnyside' },
      { name: 'Prospect Heights' },
      { name: 'Washington Heights' },
      { name: 'Financial District' },
    ],
  },

  '5-scams-hitting-nyc-right-now': {
    type: 'itemlist',
    name: '5 Scams Hitting NYC Right Now in 2026',
    description: 'The five most common scams currently targeting New Yorkers in 2026.',
    items: [
      { name: 'The Zelle Reversal Scam' },
      { name: 'The Apartment That Doesn\'t Exist' },
      { name: 'QR Code Phishing' },
      { name: 'AI-Generated Fake Listings' },
      { name: 'The Overpayment Scheme' },
    ],
  },

  '12-categories-zero-fees': {
    type: 'itemlist',
    name: '12 Free Classifieds Categories on The NYC Classifieds',
    description: 'All 12 free classifieds categories available on The NYC Classifieds for buying, selling, housing, jobs, and more.',
    items: [
      { name: 'Housing' },
      { name: 'Jobs' },
      { name: 'For Sale' },
      { name: 'Services' },
      { name: 'Vehicles' },
      { name: 'Community' },
      { name: 'Pets' },
      { name: 'Free Stuff' },
      { name: 'Wanted' },
      { name: 'Gigs' },
      { name: 'Real Estate' },
      { name: 'Other' },
    ],
  },

  'five-boroughs-126-neighborhoods': {
    type: 'itemlist',
    name: 'All Five NYC Boroughs and 126 Neighborhoods',
    description: 'How The NYC Classifieds maps all five boroughs and 126 neighborhoods for hyperlocal classifieds.',
    items: [
      { name: 'Manhattan' },
      { name: 'Brooklyn' },
      { name: 'Queens' },
      { name: 'The Bronx' },
      { name: 'Staten Island' },
    ],
  },
}

// Build secondary schema JSON-LD for a given blog post slug
export function getSecondarySchemas(slug: string, url: string): Record<string, unknown>[] {
  const entry = schemas[slug]
  if (!entry) return []

  switch (entry.type) {
    case 'howto':
      return [howToSchema({ name: entry.name, description: entry.description, url, steps: entry.steps })]
    case 'faq':
      return [faqSchema(entry.items)]
    case 'itemlist':
      return [itemListSchema({ name: entry.name, description: entry.description, url, items: entry.items })]
    default:
      return []
  }
}
