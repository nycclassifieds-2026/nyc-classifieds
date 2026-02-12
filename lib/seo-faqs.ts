// ─── Voice-search & AI-optimized FAQ content for every page type ───

// Category-specific FAQs (voice search: "where can I find X in NYC?")
export const categoryFaqs: Record<string, { question: string; answer: string }[]> = {
  'housing': [
    { question: 'Where can I find no-fee apartments in NYC?', answer: 'NYC Classifieds lists no-fee apartments across all five boroughs. Every landlord is geo-verified with a selfie and GPS at their address, so you know listings are real. Browse apartments, rooms, sublets, and co-working spaces for free.' },
    { question: 'How do I find a room for rent in New York City?', answer: 'Search rooms and shared housing on NYC Classifieds. Filter by borough or neighborhood to find rooms near you. All landlords and tenants are verified to their NYC address with a live selfie, eliminating scams and fake listings.' },
    { question: 'What neighborhoods have the cheapest apartments in NYC?', answer: 'Affordable apartments are commonly found in neighborhoods like Astoria, Washington Heights, Bay Ridge, Bushwick, and parts of the Bronx. Use NYC Classifieds to browse housing listings by specific neighborhood across all 126+ areas we cover.' },
    { question: 'Is it free to post apartments on NYC Classifieds?', answer: 'Yes, posting housing listings on NYC Classifieds is 100% free. There are no fees for landlords, tenants, or roommates. The only requirement is geo-verification — a selfie at your NYC address to prove you are a real New Yorker.' },
    { question: 'How does landlord verification work?', answer: 'Every user on NYC Classifieds must complete geo-verification: take a live selfie while at their registered NYC address. GPS confirms you are within 50 feet of your stated location. This eliminates fake listings, scams, and out-of-state spammers.' },
  ],
  'jobs': [
    { question: 'Where can I find jobs in NYC right now?', answer: 'NYC Classifieds lists local jobs across all five boroughs — restaurants, retail, tech, healthcare, trades, finance, and 40+ categories. Every employer is geo-verified to a real NYC address. No recruiter fees. Browse or post jobs free.' },
    { question: 'How do I find part-time work in New York City?', answer: 'Search the Jobs category on NYC Classifieds and filter by part-time, or browse Gigs for flexible short-term work. You can filter by borough and neighborhood to find work close to home.' },
    { question: 'Are there remote jobs listed on NYC Classifieds?', answer: 'Yes, NYC Classifieds has a Remote / Hybrid subcategory under Jobs. Even remote job posters must be geo-verified NYC residents, ensuring the jobs are from real local employers, not overseas spam.' },
    { question: 'Is it free to post a job on NYC Classifieds?', answer: 'Yes, posting jobs on NYC Classifieds is completely free. No fees for employers, no fees for job seekers. Every poster must be a verified NYC resident or business.' },
    { question: 'What types of jobs are available in NYC?', answer: 'NYC Classifieds covers 40+ job categories including restaurants and hospitality, tech and engineering, healthcare, construction, creative and media, finance, retail, education, and more. All across Manhattan, Brooklyn, Queens, the Bronx, and Staten Island.' },
  ],
  'for-sale': [
    { question: 'Where can I buy and sell stuff in NYC?', answer: 'NYC Classifieds is a free marketplace for New York City residents. Buy and sell furniture, electronics, clothing, bikes, vintage items, and more. Every seller is verified with a selfie and GPS at their NYC address — no bots, no scams.' },
    { question: 'How do I sell furniture in New York City?', answer: 'Post your furniture for free on NYC Classifieds under For Sale > Furniture. Add photos and your neighborhood. Only verified NYC residents can post, so buyers know you are real and local.' },
    { question: 'Is NYC Classifieds safe for buying and selling?', answer: 'Yes. Every user on NYC Classifieds is geo-verified with a live selfie at their NYC address. This means every seller is a confirmed real New Yorker — not a bot, scammer, or out-of-state poster. Meet locally in your neighborhood.' },
    { question: 'Where can I find free stuff in NYC?', answer: 'Check the Free Stuff subcategory under For Sale on NYC Classifieds. New Yorkers regularly give away furniture, electronics, clothing, and household items. All posters are verified to their address.' },
    { question: 'What can I sell on NYC Classifieds?', answer: 'You can sell furniture, electronics, bikes, clothing, sneakers, art, cameras, collectibles, appliances, instruments, and 30+ categories of items. Posting is 100% free and only available to geo-verified NYC residents.' },
  ],
  'services': [
    { question: 'How do I find a handyman near me in NYC?', answer: 'Search Services on NYC Classifieds and filter by your borough or neighborhood. Find handymen, plumbers, electricians, cleaners, movers, and 40+ service types. Every service provider is geo-verified to their NYC address.' },
    { question: 'Where can I find affordable movers in NYC?', answer: 'Browse the Moving & Hauling subcategory under Services on NYC Classifieds. Compare local movers verified to real NYC addresses. No middlemen, no broker fees — connect directly with your mover.' },
    { question: 'How do I hire a cleaner in New York City?', answer: 'Find verified cleaning professionals on NYC Classifieds under Services > Cleaning. Every cleaner is geo-verified to their NYC address. Browse their profile, see their service area, and message them directly.' },
    { question: 'Is it free to list my business on NYC Classifieds?', answer: 'Yes. Service providers and local businesses can list on NYC Classifieds for free. You also get a free business profile page with your hours, service area, photos, and contact info in our Business Directory.' },
    { question: 'What services are available on NYC Classifieds?', answer: 'NYC Classifieds lists 40+ service categories: plumbing, electrical, cleaning, moving, handyman, tutoring, photography, pet grooming, personal training, web development, tax preparation, and more. All across NYC.' },
  ],
  'gigs': [
    { question: 'Where can I find gig work in NYC?', answer: 'NYC Classifieds lists gig work across all five boroughs — dog walking, moving help, event setup, delivery, cleaning, pet sitting, and 30+ gig types. Every poster is geo-verified. Pick up work today.' },
    { question: 'How do I hire someone for a quick job in NYC?', answer: 'Post a gig on NYC Classifieds for free. Describe the work, set the pay, and verified local workers will see it. Dog walking, furniture assembly, cleaning, errands — post anything and get help from real New Yorkers.' },
    { question: 'How much do gig workers make in NYC?', answer: 'Gig rates on NYC Classifieds vary by task. Dog walking typically runs $15-25 per walk, moving help $20-40 per hour, cleaning $25-50 per hour, and event setup $20-35 per hour. Set your own rate when you post.' },
    { question: 'Is it safe to hire gig workers on NYC Classifieds?', answer: 'Every gig worker on NYC Classifieds is geo-verified with a live selfie at their NYC address. You know exactly what neighborhood they are from. No anonymous accounts, no fake profiles.' },
  ],
  'community': [
    { question: 'What is The Porch on NYC Classifieds?', answer: 'The Porch is a neighborhood community feed where verified NYC residents share recommendations, ask questions, post alerts, report lost pets, list stoop sales, and more. Think of it as a verified, spam-free neighborhood board.' },
    { question: 'How do I find stoop sales near me in NYC?', answer: 'Check the Community category on NYC Classifieds or visit The Porch for your neighborhood. Filter by Stoop Sales or Garage Sales to find sales happening near you this weekend.' },
    { question: 'Where can I post a lost pet in NYC?', answer: 'Post on The Porch under Lost & Found in your neighborhood. Every user is geo-verified, so your post reaches real neighbors who actually live nearby and might have seen your pet.' },
    { question: 'How do I connect with my NYC neighbors?', answer: 'Join The Porch on NYC Classifieds. Select your neighborhood and start posting questions, recommendations, or alerts. Everyone is verified to their address, so you know you are talking to actual neighbors.' },
  ],
  'tickets': [
    { question: 'Where can I buy cheap Broadway tickets in NYC?', answer: 'Check the Tickets & Events category on NYC Classifieds. Verified NYC residents sell Broadway tickets, often below face value. No bots, no scalper markups — just real New Yorkers selling tickets they cannot use.' },
    { question: 'How do I sell concert tickets in NYC?', answer: 'List your tickets for free on NYC Classifieds under Tickets & Events. Add the event name, date, venue, and price. Only geo-verified NYC residents can post, so buyers trust the listing is real.' },
    { question: 'Where can I find comedy show tickets in NYC?', answer: 'Browse Tickets & Events > Comedy on NYC Classifieds. Find tickets to Comedy Cellar, Gotham Comedy Club, and other NYC venues from verified local sellers.' },
    { question: 'Is it safe to buy tickets on NYC Classifieds?', answer: 'Yes. Every ticket seller is geo-verified to a real NYC address. No anonymous sellers, no bots, no scam accounts. Meet locally to exchange tickets or use the platform messaging to coordinate.' },
  ],
  'pets': [
    { question: 'Where can I adopt a dog in NYC?', answer: 'Browse the Pets > Adoption category on NYC Classifieds. Find dogs and cats available for adoption from verified NYC residents and local rescues. Every poster is geo-verified to their NYC address.' },
    { question: 'How do I find a dog walker near me in NYC?', answer: 'Search Pets > Dog Walking on NYC Classifieds and filter by your neighborhood. Every dog walker is geo-verified, so you know they live or work near you. Also check our Business Directory for pet service businesses.' },
    { question: 'Where do I report a lost pet in NYC?', answer: 'Post on NYC Classifieds under Pets > Lost & Found Pets and also on The Porch in your neighborhood. Your post reaches verified neighbors in your area who might spot your pet.' },
    { question: 'Is it free to post pet listings on NYC Classifieds?', answer: 'Yes. Pet adoption, rehoming, dog walking, pet sitting, and all pet listings are 100% free to post. You just need to be a geo-verified NYC resident.' },
  ],
  'personals': [
    { question: 'Where can I meet real people in NYC?', answer: 'NYC Classifieds Personals connects verified New Yorkers looking for activity partners, platonic friendships, and missed connections. Every user is verified with a selfie and GPS — no catfishing, no fake profiles.' },
    { question: 'How is NYC Classifieds Personals different from dating apps?', answer: 'Unlike dating apps, every user on NYC Classifieds is geo-verified to a real NYC address with a live selfie. You know the person actually lives in your city. Categories include activity partners, strictly platonic, and missed connections.' },
    { question: 'Is NYC Classifieds Personals safe?', answer: 'Yes. Every user must complete geo-verification — a live selfie at their registered NYC address with GPS confirmation. This eliminates fake profiles, bots, and catfishing. Real New Yorkers only.' },
  ],
  'barter': [
    { question: 'Where can I trade stuff in NYC without money?', answer: 'NYC Classifieds Barter lets you swap goods for goods, skills for skills, or mix and match with verified NYC neighbors. Trade furniture, clothing, lessons, services — anything. No cash needed, free to post.' },
    { question: 'How does bartering work on NYC Classifieds?', answer: 'Post what you have and what you want under Barter. Categories include Goods for Goods, Goods for Skills, and Skills for Skills. Every trader is geo-verified to their NYC address. Arrange swaps with real neighbors.' },
    { question: 'Can I trade skills on NYC Classifieds?', answer: 'Yes. The Skills for Skills subcategory lets you trade services — guitar lessons for Spanish tutoring, photography for web design, cooking for yoga. All traders are geo-verified NYC residents.' },
  ],
  'rentals': [
    { question: 'Where can I borrow tools in NYC?', answer: 'NYC Classifieds Rentals & Lending connects you with neighbors who lend tools, cameras, sports gear, and more. Borrow a drill for the weekend instead of buying one. Every lender is geo-verified to their NYC address.' },
    { question: 'Can I rent camera equipment in NYC from neighbors?', answer: 'Yes. Browse Rentals & Lending > Cameras & Gear on NYC Classifieds. Borrow cameras, lenses, lighting, and video gear from verified NYC residents in your borough. Usually cheaper than traditional rental shops.' },
    { question: 'Is it free to list items for lending on NYC Classifieds?', answer: 'Yes. Listing items for rent or lending is 100% free. Set your own rate or lend for free. Every user is geo-verified so you know who has your stuff.' },
  ],
  'resumes': [
    { question: 'Where can I post my resume in NYC?', answer: 'Post your resume for free on NYC Classifieds under Resumes. Choose your field from 30+ categories. NYC employers can find you directly. Your profile is geo-verified, which employers trust.' },
    { question: 'How do NYC employers find candidates on NYC Classifieds?', answer: 'Employers browse the Resumes category filtered by field (tech, healthcare, finance, trades, etc.) and borough. Every candidate is geo-verified to a real NYC address, ensuring they are local and real.' },
    { question: 'Is it free to post a resume on NYC Classifieds?', answer: 'Yes. Posting your resume is completely free. Your resume stays active and searchable by NYC employers. You can update or remove it anytime from your account.' },
  ],
}

// Borough-specific FAQs
export function boroughFaqs(boroughName: string, neighborhoodCount: number, nhSample: string): { question: string; answer: string }[] {
  return [
    { question: `What can I find on ${boroughName} classifieds?`, answer: `NYC Classifieds covers ${boroughName} with 12 categories: housing, jobs, services, for sale, gigs, community, tickets, pets, personals, barter, rentals, and resumes. All posted by residents verified to their ${boroughName} address.` },
    { question: `Is it free to post classifieds in ${boroughName}?`, answer: `Yes. Posting on NYC Classifieds is 100% free for ${boroughName} residents. No fees to post listings, browse, or message other users. The only requirement is geo-verification at your ${boroughName} address.` },
    { question: `What ${boroughName} neighborhoods are on NYC Classifieds?`, answer: `NYC Classifieds covers ${neighborhoodCount} ${boroughName} neighborhoods including ${nhSample}, and more. Each neighborhood has its own page with local listings from verified residents.` },
    { question: `How do I know ${boroughName} listings are real?`, answer: `Every user on NYC Classifieds is geo-verified. They take a live selfie at their ${boroughName} address while GPS confirms their location within 50 feet. No fake accounts, no out-of-borough spam.` },
  ]
}

// Neighborhood-specific FAQs
export function neighborhoodFaqs(nhName: string, boroughName: string): { question: string; answer: string }[] {
  return [
    { question: `What classifieds are available in ${nhName}, ${boroughName}?`, answer: `NYC Classifieds has listings in ${nhName} across 12 categories: apartments, jobs, services, items for sale, gigs, community posts, tickets, pets, personals, barter, rentals, and resumes. Every poster is verified to ${nhName}.` },
    { question: `How do I post something in ${nhName}?`, answer: `Sign up for free on NYC Classifieds, complete geo-verification at your ${nhName} address (a live selfie with GPS), and post in any category. It takes under 2 minutes and is 100% free.` },
    { question: `Are ${nhName} listings from real people?`, answer: `Yes. Every person posting in ${nhName} on NYC Classifieds has been verified with a live selfie at their address, with GPS confirming they are actually in ${nhName}, ${boroughName}. No fake accounts.` },
  ]
}

// Neighborhood + Category FAQs
export function neighborhoodCategoryFaqs(nhName: string, boroughName: string, categoryName: string): { question: string; answer: string }[] {
  return [
    { question: `Where can I find ${categoryName.toLowerCase()} in ${nhName}, ${boroughName}?`, answer: `Browse ${categoryName.toLowerCase()} listings in ${nhName} on NYC Classifieds. Every poster is geo-verified to ${nhName}. Free to browse and post.` },
    { question: `Is it free to post ${categoryName.toLowerCase()} in ${nhName}?`, answer: `Yes. Posting ${categoryName.toLowerCase()} listings in ${nhName} on NYC Classifieds is completely free. You must be a geo-verified resident of ${nhName}, ${boroughName} to post.` },
  ]
}

// Borough + Category FAQs
export function boroughCategoryFaqs(boroughName: string, categoryName: string): { question: string; answer: string }[] {
  return [
    { question: `Where can I find ${categoryName.toLowerCase()} in ${boroughName}?`, answer: `Browse ${categoryName.toLowerCase()} in ${boroughName} on NYC Classifieds. Filter by neighborhood to find listings near you. Every poster is geo-verified to their ${boroughName} address.` },
    { question: `How do I post ${categoryName.toLowerCase()} in ${boroughName}?`, answer: `Sign up free on NYC Classifieds, verify your ${boroughName} address with a selfie + GPS, and post in ${categoryName}. Takes under 2 minutes, costs nothing.` },
  ]
}

// Subcategory FAQs (city-wide)
export function subcategoryFaqs(subName: string, categoryName: string): { question: string; answer: string }[] {
  return [
    { question: `Where can I find ${subName.toLowerCase()} in NYC?`, answer: `Browse ${subName.toLowerCase()} listings on NYC Classifieds under ${categoryName}. Available across all five boroughs — Manhattan, Brooklyn, Queens, the Bronx, and Staten Island. Every poster is geo-verified.` },
    { question: `Is it free to post ${subName.toLowerCase()} on NYC Classifieds?`, answer: `Yes. Posting ${subName.toLowerCase()} is 100% free. All you need is a verified NYC address. No listing fees, no premium tiers — completely free.` },
  ]
}
