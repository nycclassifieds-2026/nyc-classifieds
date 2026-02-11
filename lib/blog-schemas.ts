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

  // ── Mega FAQ (100 Q&As) ───────────────────────────────────

  'nyc-classifieds-faq-top-100-questions': {
    type: 'faq',
    items: [
      // Getting Started (1–10)
      { question: 'What is The NYC Classifieds?', answer: 'The NYC Classifieds is a free, geo-verified classifieds platform built exclusively for New York City. Every user is verified as a real person actually in NYC. It covers all five boroughs and 126 neighborhoods with 12 categories: housing, jobs, for sale, services, vehicles, community, pets, free stuff, wanted, gigs, real estate, and other.' },
      { question: 'Is The NYC Classifieds really free to post on?', answer: 'Yes. Completely free. No listing fees, no premium tiers, no per-listing charges, no hidden costs. We make money through small, clearly-labeled business advertising — not by charging individuals.' },
      { question: 'How does The NYC Classifieds make money?', answer: 'Through small, clearly-labeled local business advertising and optional paid business tools like promoted listings and analytics dashboards. The core platform is free for individuals and always will be.' },
      { question: 'How do I create an account on The NYC Classifieds?', answer: 'Sign up at thenycclassifieds.com with your email, complete GPS location verification and a real-time selfie, and you can post immediately after confirmation.' },
      { question: 'What categories can I post in on NYC Classifieds?', answer: 'All 12: Housing, Jobs, For Sale, Services, Vehicles, Community, Pets, Free Stuff, Wanted, Gigs, Real Estate, and Other. Every category is organized by borough and neighborhood.' },
      { question: 'Do I need a smartphone to use NYC Classifieds?', answer: 'The site works on desktop, tablet, and phone. Verification requires GPS and a camera, so you need those capabilities for signup. After that, you can use it from any device.' },
      { question: 'Does The NYC Classifieds have a mobile app?', answer: 'Not yet — but the website is fully mobile-optimized and works like a native app. Add it to your home screen for the best experience. A dedicated app is on the roadmap.' },
      { question: 'How is NYC Classifieds different from Craigslist?', answer: 'Every user is verified with GPS and a selfie before they can post. No bots, no out-of-state scammers, real accountability. Everything is organized by NYC\'s 126 actual neighborhoods, not generic metro areas.' },
      { question: 'How is NYC Classifieds different from Facebook Marketplace?', answer: 'No Facebook account required, no behavioral tracking, no algorithms deciding what you see. Your feed shows what\'s new in your neighborhood — period.' },
      { question: 'Who built The NYC Classifieds?', answer: 'New Yorkers, for New Yorkers. An independent team that believes the city deserves a classifieds platform that\'s free, safe, and built for how New York works — borough by borough, neighborhood by neighborhood.' },
      // Verification & Trust (11–20)
      { question: 'Why does NYC Classifieds require identity verification?', answer: 'Verification keeps scammers, bots, and out-of-state bad actors off the platform. Every other classifieds site lets anyone post anonymously — that\'s why they\'re full of scams.' },
      { question: 'How does geo-verification work on NYC Classifieds?', answer: 'During signup, your device\'s GPS confirms you\'re physically within one of NYC\'s five boroughs. You also take a real-time selfie. This two-step check ensures you\'re a real person in New York.' },
      { question: 'Can I use The NYC Classifieds if I live outside NYC?', answer: 'No. The platform is exclusively for people in Manhattan, Brooklyn, Queens, The Bronx, and Staten Island. You must be physically in NYC during verification.' },
      { question: 'Is my personal information safe on NYC Classifieds?', answer: 'Yes. Your email, phone number, and personal details are never shown to other users. All communication happens through on-platform messaging. We don\'t sell data to third parties.' },
      { question: 'What happens if someone fakes their verification?', answer: 'GPS spoofing and fake selfies are detected by our system. Accounts flagged for verification fraud are permanently banned. We\'d rather have fewer users than fake ones.' },
      { question: 'Can I re-verify if I change phones?', answer: 'Yes. If you switch devices, you can re-verify from your account settings. The process takes about 30 seconds.' },
      { question: 'Does verification expire on NYC Classifieds?', answer: 'No. Once verified, your account stays verified. If our system detects suspicious activity, we may ask you to re-verify, but that\'s rare.' },
      { question: 'Can I have more than one NYC Classifieds account?', answer: 'No. One person, one account. Duplicate accounts are detected and removed to keep the platform fair for everyone.' },
      { question: 'What data does NYC Classifieds collect during verification?', answer: 'We check GPS coordinates to confirm you\'re in NYC and capture a selfie to confirm you\'re a real person. We don\'t store precise location history, and selfie data is used only for verification — never sold or shared.' },
      { question: 'Does NYC Classifieds share verification data with anyone?', answer: 'No. Verification data stays on our servers, encrypted, and is never shared with third parties, advertisers, or other users.' },
      // Posting & Selling (21–35)
      { question: 'How do I post a listing on NYC Classifieds?', answer: 'Click "Post" from any page, choose your category, add a title and description, set your price (or mark as free), select your neighborhood, and publish. It goes live within seconds.' },
      { question: 'How do I write a classified listing that sells fast?', answer: 'Start with a specific title (item + condition + neighborhood). Price competitively at 30–50% of retail for used goods. Write an honest description with dimensions, age, and flaws. Include pickup details.' },
      { question: 'Can I edit my listing after posting on NYC Classifieds?', answer: 'Yes. You can edit the title, description, price, and category at any time from your dashboard. Changes go live immediately.' },
      { question: 'How long do listings stay active on NYC Classifieds?', answer: 'Listings stay active for 30 days. After that, they expire and you can renew them with one click if the item is still available.' },
      { question: 'Can I repost an expired listing?', answer: 'Yes. From your dashboard, you can renew any expired listing. It gets a fresh timestamp and shows up as new in your neighborhood.' },
      { question: 'How should I price used furniture in NYC?', answer: 'Used furniture in good condition typically sells for 30–50% of retail. End-of-month is the best time to sell because people moving in need to furnish quickly. Price 10–15% below similar listings to sell fast.' },
      { question: 'How should I price used electronics in NYC?', answer: 'Electronics depreciate faster — expect 40–60% off retail. Be specific about model, storage, condition, and accessories included.' },
      { question: 'Can I list items as free on NYC Classifieds?', answer: 'Absolutely. The Free Stuff category is one of the most popular. Moving and need to offload furniture? Mark it as free and it\'ll be gone by sundown.' },
      { question: 'Can I list services on NYC Classifieds?', answer: 'Yes. The Services category covers cleaning, tutoring, handyman work, pet care, photography, and more. Set your own rates and service area.' },
      { question: 'Can I post a wanted ad on NYC Classifieds?', answer: 'Yes. The Wanted category lets you post what you\'re looking for — furniture, services, roommates. Sellers and providers in your area will reach out.' },
      { question: 'What\'s not allowed on The NYC Classifieds?', answer: 'No illegal items, weapons, drugs, counterfeit goods, multi-level marketing, adult services, or deceptive listings. Automated moderation catches most prohibited content.' },
      { question: 'How does content moderation work on NYC Classifieds?', answer: 'Every listing is automatically scanned before going live for prohibited items, spam, scam language, and exposed personal info. Flagged posts go to human review. Most legitimate posts go live instantly.' },
      { question: 'Can I sell a vehicle on NYC Classifieds?', answer: 'Yes. The Vehicles category covers cars, motorcycles, bicycles, and scooters. Include make, model, year, mileage, condition, and asking price.' },
      { question: 'Can I promote my listing on NYC Classifieds?', answer: 'Not yet, but promoted listings are coming. For now, every listing gets equal visibility based on freshness and location.' },
      { question: 'How many listings can I have active at once?', answer: 'No hard limit for individuals. Unusually high volume may be flagged for review to prevent commercial spam.' },
      // Buying & Safety (36–50)
      { question: 'How do I contact a seller on NYC Classifieds?', answer: 'Click the "Message" button on any listing. All conversations happen on-platform and you\'ll get notified when they reply.' },
      { question: 'How do I avoid scams on NYC Classifieds?', answer: 'Never pay before seeing an item in person, meet in public for high-value transactions, use cash or traceable payment methods, and trust your gut. If a deal seems too good to be true, it is.' },
      { question: 'Is it safe to meet strangers from online classifieds?', answer: 'Meet in well-lit public places for portable items. For furniture, bring a friend and tell someone where you\'re going. Verified users provide accountability, but common sense still applies.' },
      { question: 'What payment methods should I use for classifieds?', answer: 'Cash for in-person transactions. Venmo or PayPal Goods & Services for higher-value items. Never wire money, send gift cards, or use cryptocurrency with strangers.' },
      { question: 'What are the biggest red flags for classifieds scams?', answer: 'Prices dramatically below market rate, refusal to meet in person, urgency to pay immediately, requests for wire transfers or gift cards, stolen or stock photos, and deposit requests before seeing the item.' },
      { question: 'How do I report a suspicious listing on NYC Classifieds?', answer: 'Every listing has a flag button. Click it, select the reason, and we\'ll review it. You can also block and report users from their profile or conversations.' },
      { question: 'What happens when I flag a listing?', answer: 'It enters our moderation queue for review. Violations are removed and the poster is notified. Repeated violations lead to suspension or permanent bans.' },
      { question: 'Can I block another user on NYC Classifieds?', answer: 'Yes. From any conversation or user profile, click "Block." They won\'t be able to message you or see your listings.' },
      { question: 'Should I share my phone number with a buyer?', answer: 'Keep communication on-platform until you\'re ready to meet. Our messaging notifies you instantly. Share your number only after a real conversation when you feel comfortable.' },
      { question: 'What if I get scammed on classifieds?', answer: 'Report the user on the platform immediately. File a police report if you lost money. Contact your bank to dispute the transaction. We cooperate with law enforcement on fraud cases.' },
      { question: 'Are there safe meeting spots for exchanges in NYC?', answer: 'Police precincts across the city have designated safe exchange zones. Banks and coffee shops also make good meeting spots. Avoid secluded areas, especially after dark.' },
      { question: 'How do I check if a seller is legitimate?', answer: 'On NYC Classifieds, every seller is verified. Check their profile for verification status, account age, and other active listings. Trust your instincts if something feels off.' },
      { question: 'What if an item isn\'t as described?', answer: 'Communicate with the seller through messaging. Most disputes resolve between parties. If the seller intentionally misrepresented the item, flag the listing and report the user.' },
      { question: 'Can I get a refund on a classifieds purchase?', answer: 'Classifieds sales are generally final — you\'re buying from a person, not a store. Always inspect items in person before paying. PayPal Goods & Services offers some buyer protection.' },
      { question: 'Is it safe to buy electronics from classifieds?', answer: 'Yes, if you test the item before paying, check serial numbers, meet in person, and avoid prices that are too good to be true.' },
      // Housing & Apartments (51–65)
      { question: 'Can I find apartments on The NYC Classifieds?', answer: 'Yes. The Housing category covers apartment rentals, room shares, sublets, and short-term stays across all five boroughs and 126 neighborhoods.' },
      { question: 'Are there broker fees on NYC Classifieds listings?', answer: 'No. The NYC Classifieds doesn\'t charge any fees. Plus the FARE Act eliminated tenant-paid broker fees citywide.' },
      { question: 'What is the FARE Act in NYC?', answer: 'The FARE Act, signed in late 2024, eliminates tenant-paid broker fees in NYC. The person who hires the broker (typically the landlord) pays. This saves renters roughly $10,000–$15,000 on move-in costs.' },
      { question: 'How do I spot a fake apartment listing in NYC?', answer: 'Watch for rent dramatically below market rate, refusal to meet in person, deposit requests before viewings, and stock photos. Look up buildings on NYC\'s HPD portal and reverse-image search photos.' },
      { question: 'What documents do I need to rent an apartment in NYC?', answer: 'Photo ID, three months of pay stubs, bank statements, tax returns, and an employment letter. You typically need to earn 40x the monthly rent annually, or have a guarantor.' },
      { question: 'What is the 40x rent rule in NYC?', answer: 'Most NYC landlords require your annual salary to be at least 40 times the monthly rent. For a $2,500/month apartment, you need $100,000/year. A guarantor typically must earn 80x the monthly rent.' },
      { question: 'What is a guarantor for NYC apartments?', answer: 'A guarantor co-signs your lease and assumes financial responsibility if you can\'t pay rent. They typically need to earn 80x your monthly rent. Services like Insurent offer institutional guarantors for a fee.' },
      { question: 'What\'s the best time to apartment hunt in NYC?', answer: 'Winter — November through February sees 3–5% lower rents compared to summer. Competition is lighter and landlords are more flexible.' },
      { question: 'Can I find roommates on NYC Classifieds?', answer: 'Yes. Post in Housing specifying you\'re looking for a roommate, or browse room share listings. Include budget, preferred neighborhoods, lifestyle preferences, and move-in date.' },
      { question: 'What should I know about subletting in NYC?', answer: 'Subletting is legal in most NYC buildings with landlord approval. Always get written permission, use a sublease agreement, and never pay a sublet fee to unverified parties.' },
      { question: 'How do I check a building\'s complaint history in NYC?', answer: 'Use the NYC HPD Online portal to look up any building by address. See open violations, complaint history, and landlord responsiveness. This is the most important research step before signing a lease.' },
      { question: 'What\'s the average rent in NYC in 2026?', answer: 'Manhattan one-bedrooms average ~$4,000/month. Brooklyn and Queens $2,500–$3,200. The Bronx and Staten Island $1,500–$2,200. Prices vary widely by neighborhood.' },
      { question: 'Are rent-stabilized apartments still available in NYC?', answer: 'Yes. About one million NYC apartments are rent-stabilized with capped annual increases. They\'re harder to find but available. Check the DHCR rent roll to verify specific units.' },
      { question: 'Can I negotiate rent in NYC?', answer: 'Yes, especially in winter. Longer lease terms, immediate move-in, and strong financials give you leverage. The worst they can say is no.' },
      { question: 'What should I check on an apartment viewing in NYC?', answer: 'Water pressure, cabinets and closets, signs of pests, light switches and outlets, windows for drafts, laundry and storage options, and cell reception. Take photos and visit at different times of day.' },
      // Jobs & Gigs (66–75)
      { question: 'Can I find jobs on The NYC Classifieds?', answer: 'Yes. The Jobs category covers full-time, part-time, and contract positions. The Gigs category covers freelance, event staffing, moving help, creative projects, and more.' },
      { question: 'How do I spot a job scam in NYC?', answer: 'Red flags: vague descriptions, no company name, text-only interviews, instant hiring, and any request to pay upfront for training or equipment. A real employer never asks you to pay them.' },
      { question: 'Are job listings verified on NYC Classifieds?', answer: 'All users posting jobs go through the same GPS + selfie verification. This eliminates anonymous scam postings, but still research any company before sharing personal information.' },
      { question: 'What kinds of gigs are posted on NYC Classifieds?', answer: 'Moving help, event staffing, dog walking, tutoring, photography, graphic design, house cleaning, handyman work, and more. Most gigs are local and pay same-day.' },
      { question: 'Can I post a gig I need done on NYC Classifieds?', answer: 'Yes. Post in Gigs or Wanted describing the work, budget, timeline, and neighborhood. Verified providers in your area will reach out.' },
      { question: 'How do I find freelance work in NYC?', answer: 'Browse Gigs and Services categories in your borough. Many small businesses post one-off projects. You can also advertise your skills in the Wanted category.' },
      { question: 'What are the hottest job sectors in NYC in 2026?', answer: 'Tech (especially AI and data), healthcare, finance and fintech, creative industries, and the gig economy. NYC\'s unemployment is below the national average.' },
      { question: 'Should I share my Social Security number on a job application?', answer: 'Never on an initial application through classifieds. Legitimate employers ask for SSN only after a formal offer during official onboarding. If a listing asks upfront, it\'s a scam.' },
      { question: 'Can I find remote work on NYC Classifieds?', answer: 'Yes. Many job listings specify remote, hybrid, or in-office. Filter by borough and check listing details for work location.' },
      { question: 'How do I report a fraudulent job listing?', answer: 'Click the flag button and select "Scam / Fraud." If you\'ve shared personal info, place fraud alerts on your credit reports and file at reportfraud.ftc.gov.' },
      // The Porch & Community (76–85)
      { question: 'What is The Porch on NYC Classifieds?', answer: 'The Porch is a community feed organized by borough and neighborhood — a digital bulletin board where New Yorkers ask questions, share recommendations, post alerts, coordinate events, and talk to neighbors.' },
      { question: 'What can I post on The Porch?', answer: 'Neighborhood questions, local recommendations, community alerts, events like stoop sales and block parties, lost & found, pet sightings, and welcome posts for new neighbors.' },
      { question: 'Is The Porch moderated?', answer: 'Yes. Same rules as listings — spam, hate speech, scams, and violations are removed. But genuine disagreement and honest conversation are welcome.' },
      { question: 'Can I use The Porch without posting listings?', answer: 'Absolutely. Many users come to The Porch purely for neighborhood conversation and never post a classified.' },
      { question: 'How do I find my neighborhood on The Porch?', answer: 'Navigate to The Porch, select your borough, then your neighborhood. Set your home neighborhood in your profile for personalized results.' },
      { question: 'Can I post about lost pets on The Porch?', answer: 'Yes. Lost & Found and Pet Sightings are dedicated post types. Include a photo, description, last known location, and contact preference. Lost pet posts get strong neighbor engagement.' },
      { question: 'Can I organize a stoop sale through The Porch?', answer: 'Yes. Post an event with date, time, location, and what you\'re selling. Also post individual items in Free Stuff or For Sale categories.' },
      { question: 'Is The Porch anonymous?', answer: 'No. Every user is verified and posts show your display name. This accountability makes conversations genuine and respectful.' },
      { question: 'How is The Porch different from Nextdoor?', answer: 'The Porch is integrated into a classifieds platform, not a social network. No algorithmic feed, no sponsored content disguised as posts, no corporate partnerships. Just neighbors talking.' },
      { question: 'Can businesses post on The Porch?', answer: 'Businesses can participate in conversations and share recommendations, but promotional spam is removed. Use business profiles and listings for commercial purposes.' },
      // Business Profiles (86–92)
      { question: 'Can my local business be listed on NYC Classifieds?', answer: 'Yes. Free business profiles are available for local NYC shops, restaurants, and service providers. Your profile appears in search results and borough/neighborhood pages.' },
      { question: 'Do business profiles cost money on NYC Classifieds?', answer: 'Basic profiles are free. Optional paid tools (analytics, promoted listings, verified badges) are coming, but the core profile is and will remain free.' },
      { question: 'How is NYC Classifieds different from Yelp?', answer: 'Neighborhood-first. Your business appears alongside the community it serves. No review extortion, no pay-to-play ranking manipulation.' },
      { question: 'Can I respond to mentions of my business on The Porch?', answer: 'Yes. If someone mentions your business in a recommendation or question, you can respond directly — the best kind of organic, community-driven marketing.' },
      { question: 'How do I set up a business profile on NYC Classifieds?', answer: 'Sign up and verify like any user, then claim your business from your dashboard. Add your business name, category, address, hours, and description.' },
      { question: 'Can I post job listings from my business profile?', answer: 'Yes. Businesses can post in Jobs and Gigs categories. Your business name and verification status appear on listings, building trust with applicants.' },
      { question: 'Will NYC Classifieds have business reviews?', answer: 'We\'re considering it with a better model — reviews from verified users only, no pay-for-removal, no review extortion. If we add it, it\'ll be fair.' },
      // Technical & Account (93–100)
      { question: 'How do notifications work on NYC Classifieds?', answer: 'You get notified for messages about listings, Porch post replies, and activity in saved neighborhoods. Customize preferences from account settings.' },
      { question: 'Can I save searches on NYC Classifieds?', answer: 'Saved searches are coming soon. Set criteria (category, neighborhood, price range) and get notified when matching listings appear.' },
      { question: 'How do I change my neighborhood on NYC Classifieds?', answer: 'Select a different borough and neighborhood from the homepage navigation, or update your default neighborhood in account settings.' },
      { question: 'How do I delete my NYC Classifieds account?', answer: 'Contact us through the feedback widget or email. We\'ll delete your account and all associated data — no hoops to jump through.' },
      { question: 'Is messaging private on NYC Classifieds?', answer: 'Yes. Messages are between you and the other user. We don\'t read conversations. The only exception is messages flagged for suspected fraud or harassment.' },
      { question: 'Can I use NYC Classifieds on my computer?', answer: 'Yes. The site works on any modern browser — Chrome, Safari, Firefox, Edge — and adapts to any screen size.' },
      { question: 'How do I give feedback or suggest a feature?', answer: 'Click the Feedback button on any page or post on The Porch. We read every piece of feedback and it directly shapes what we build next.' },
      { question: 'What\'s coming next for The NYC Classifieds?', answer: 'Photo uploads for listings, saved searches with alerts, improved direct messaging, neighborhood-level notifications, and a business analytics dashboard. Check our blog for updates.' },
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
