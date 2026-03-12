/**
 * Generates long-tail H1s, descriptions, and sample listings for all classified pages.
 * Descriptions are ~5 sentences, SEO-focused, specific to each subcategory + location.
 */

// ── Subcategory-specific examples (used in description sentence 3) ──

export const subcategoryExamples: Record<string, Record<string, string>> = {
  housing: {
    'apartments': 'studio and 1BR units, no-fee rentals, walk-ups, and elevator buildings',
    'apartments-wanted': 'apartment-wanted posts, roommate searches, and neighborhood-specific housing requests',
    'co-working': 'shared desks, private offices, meeting rooms, and day passes at local co-working spaces',
    'for-sale-real-estate': 'condos, co-ops, townhouses, multi-family properties, and investment opportunities',
    'parking-storage': 'monthly parking spots, garage spaces, storage units, and warehouse rentals',
    'real-estate-wanted': 'buyer requests, investment inquiries, and neighborhood-specific property searches',
    'rooms-shared': 'private rooms, shared apartments, furnished rooms, and month-to-month arrangements',
    'sublets': 'short-term sublets, summer sublets, furnished sublets, and temporary housing',
  },
  jobs: {
    'accounting-finance': 'bookkeeping roles, tax preparation positions, financial analyst openings, CPA opportunities, and payroll jobs',
    'admin-office': 'receptionist positions, office manager roles, executive assistant openings, and data entry jobs',
    'ai-machine-learning': 'ML engineer roles, AI researcher positions, NLP specialists, prompt engineering jobs, and data pipeline roles',
    'architecture-design': 'architect positions, interior design roles, CAD drafting jobs, urban planning openings, and landscape architecture',
    'biotech-pharma': 'lab technician roles, research scientist positions, clinical trial coordinators, QA analysts, and pharmaceutical sales',
    'cannabis-industry': 'budtender positions, dispensary management roles, cultivation jobs, compliance officers, and cannabis marketing',
    'construction': 'general labor, foreman roles, project manager positions, carpentry jobs, and heavy equipment operator openings',
    'creative-media': 'graphic designer roles, video editor positions, content creator jobs, art director openings, and copywriter positions',
    'customer-service': 'call center roles, help desk positions, client relations jobs, support specialists, and chat agent openings',
    'cybersecurity': 'security analyst roles, penetration tester positions, SOC analyst jobs, compliance officers, and incident response',
    'data-science': 'data analyst roles, data engineer positions, business intelligence jobs, statistician openings, and visualization specialists',
    'delivery-logistics': 'delivery driver positions, warehouse coordinator roles, dispatch jobs, courier openings, and supply chain positions',
    'education-teaching': 'tutoring positions, after-school programs, ESL teaching roles, substitute teacher openings, and curriculum development',
    'engineering': 'mechanical engineer roles, civil engineer positions, electrical engineering jobs, and project engineering openings',
    'fashion-apparel': 'fashion designer roles, merchandising positions, retail buyer jobs, pattern maker openings, and showroom coordinator',
    'film-tv-production': 'production assistant roles, camera operator positions, set design jobs, post-production openings, and casting coordinator',
    'fitness-wellness': 'personal trainer roles, yoga instructor positions, gym manager jobs, wellness coach openings, and group fitness',
    'food-beverage': 'chef positions, line cook roles, bakery jobs, barista openings, and food truck operator positions',
    'government': 'city agency roles, public administration positions, policy analyst jobs, and municipal worker openings',
    'healthcare': 'medical assistant roles, phlebotomist positions, home health aide jobs, EMT openings, and clinical coordinators',
    'hotel-tourism': 'front desk roles, concierge positions, housekeeping jobs, tour guide openings, and event coordinators',
    'human-resources': 'HR coordinator roles, recruiter positions, benefits specialist jobs, and training manager openings',
    'legal': 'paralegal roles, legal secretary positions, compliance officer jobs, and law firm associate openings',
    'marketing-advertising': 'social media manager roles, SEO specialist positions, brand strategist jobs, and campaign coordinators',
    'nonprofit': 'program coordinator roles, fundraising positions, grant writer jobs, outreach specialist openings, and volunteer managers',
    'nursing': 'registered nurse roles, LPN positions, home care nurse jobs, travel nurse openings, and nurse practitioners',
    'operations-warehouse': 'operations manager roles, inventory specialist positions, shipping clerk jobs, and logistics coordinators',
    'part-time': 'flexible part-time roles, weekend positions, evening shifts, and supplemental income opportunities',
    'property-management': 'property manager roles, leasing agent positions, building superintendent jobs, and maintenance coordinators',
    'real-estate': 'real estate agent positions, broker roles, property appraiser jobs, and transaction coordinator openings',
    'remote-hybrid': 'work-from-home positions, hybrid roles, remote-first opportunities, and flexible location jobs',
    'restaurant-hospitality': 'server positions, host roles, bartender jobs, kitchen manager openings, and catering coordinators',
    'retail': 'sales associate positions, store manager roles, visual merchandiser jobs, and inventory specialist openings',
    'sales': 'account executive roles, business development positions, inside sales jobs, and sales manager openings',
    'security': 'security guard positions, loss prevention roles, building security jobs, and event security openings',
    'social-work': 'case manager roles, therapist positions, community outreach jobs, and crisis counselor openings',
    'software-engineering': 'full-stack developer roles, frontend engineer positions, backend developer jobs, DevOps openings, and mobile development',
    'sustainability-green': 'sustainability coordinator roles, environmental analyst positions, green energy jobs, and ESG compliance',
    'tech-engineering': 'IT support roles, systems administrator positions, network engineer jobs, and QA tester openings',
    'trades-skilled-labor': 'electrician roles, plumber positions, HVAC technician jobs, welder openings, and carpenter positions',
    'transportation': 'CDL driver positions, dispatcher roles, fleet manager jobs, and logistics coordinator openings',
    'writing-editing': 'content writer roles, copy editor positions, technical writer jobs, and proofreader openings',
  },
  'for-sale': {
    'appliances': 'washers, dryers, refrigerators, microwaves, and small kitchen appliances',
    'art-prints': 'original artwork, framed prints, photography, posters, and gallery pieces',
    'baby-kids': 'strollers, cribs, toys, children\'s clothing, and baby gear',
    'bikes': 'road bikes, mountain bikes, city cruisers, fixies, and bike accessories',
    'books-media': 'novels, textbooks, vinyl records, DVDs, and audiobooks',
    'building-materials': 'lumber, tiles, paint, fixtures, and renovation supplies',
    'cameras-photo': 'DSLR cameras, mirrorless bodies, lenses, tripods, and lighting equipment',
    'cars-trucks': 'sedans, SUVs, trucks, vans, and classic vehicles',
    'cell-phones': 'iPhones, Android phones, unlocked devices, phone accessories, and tablets',
    'clothing-accessories': 'designer clothing, vintage wear, shoes, belts, and scarves',
    'collectibles': 'trading cards, coins, figurines, memorabilia, and limited editions',
    'computer-parts': 'GPUs, motherboards, RAM, SSDs, and monitors',
    'e-bikes-scooters': 'electric bikes, e-scooters, mopeds, and electric skateboards',
    'electronics': 'TVs, speakers, headphones, smart home devices, and laptops',
    'free-stuff': 'furniture, clothing, books, appliances, and household items — all completely free',
    'furniture': 'sofas, tables, chairs, desks, bookshelves, and bed frames',
    'gaming-consoles': 'PlayStation, Xbox, Nintendo Switch, gaming PCs, and retro consoles',
    'handbags-wallets': 'designer handbags, wallets, clutches, tote bags, and messenger bags',
    'health-beauty': 'skincare products, makeup, hair tools, wellness devices, and fragrances',
    'home-decor': 'rugs, lamps, wall art, mirrors, and decorative accents',
    'instruments': 'guitars, keyboards, drums, brass instruments, and DJ equipment',
    'jewelry-watches': 'rings, necklaces, bracelets, luxury watches, and vintage jewelry',
    'kitchen-dining': 'cookware, small appliances, barware, tableware, and storage containers',
    'motorcycles': 'sport bikes, cruisers, scooters, vintage motorcycles, and motorcycle gear',
    'office-equipment': 'desks, chairs, printers, monitors, and office supplies',
    'outdoor-camping': 'tents, backpacks, sleeping bags, hiking gear, and camping stoves',
    'power-tools': 'drills, saws, sanders, impact drivers, and tool sets',
    'sneakers-streetwear': 'limited-edition sneakers, Supreme, vintage streetwear, hype drops, and resale kicks',
    'sporting-goods': 'gym equipment, yoga mats, weights, sports gear, and fitness accessories',
    'toys-games': 'board games, LEGO sets, action figures, puzzles, and outdoor toys',
    'vinyl-records': 'classic rock, jazz, hip-hop, rare pressings, and record players',
    'vintage-antiques': 'mid-century furniture, antique jewelry, vintage clothing, retro electronics, and estate sale finds',
  },
  services: {
    'ai-automation': 'AI chatbot setup, workflow automation, data pipeline configuration, and custom AI tool development',
    'appliance-repair': 'washer and dryer repair, refrigerator fixes, dishwasher service, and oven troubleshooting',
    'auto-repair': 'oil changes, brake service, transmission work, body repair, and pre-purchase inspections',
    'beauty-hair': 'haircuts, color treatments, blowouts, braiding, and bridal styling',
    'bike-repair': 'flat fixes, tune-ups, brake adjustments, wheel truing, and full overhauls',
    'carpentry': 'custom shelving, cabinet installation, door hanging, trim work, and furniture repair',
    'catering': 'event catering, meal prep for parties, corporate lunch service, and holiday catering',
    'childcare-nanny': 'full-time nannies, part-time babysitters, after-school care, and newborn specialists',
    'cleaning': 'deep cleaning, move-out cleaning, weekly house cleaning, office cleaning, and post-renovation cleanup',
    'content-creation': 'blog writing, social media content, video scripts, newsletter copy, and brand storytelling',
    'dj-entertainment': 'wedding DJs, party DJs, karaoke hosts, live music, and event MCs',
    'e-bike-scooter-repair': 'battery diagnostics, motor repair, tire replacement, brake service, and electrical troubleshooting',
    'electrical': 'outlet installation, panel upgrades, lighting fixtures, wiring repair, and ceiling fan installation',
    'flooring': 'hardwood installation, tile work, laminate flooring, floor refinishing, and carpet installation',
    'graphic-design': 'logo design, brand identity, flyer design, social media graphics, and packaging design',
    'handyman': 'furniture assembly, TV mounting, shelf hanging, minor plumbing, and general repairs',
    'home-organizing': 'closet organization, kitchen decluttering, garage cleanup, moving prep, and storage solutions',
    'hvac-heating': 'AC repair, furnace maintenance, duct cleaning, thermostat installation, and heat pump service',
    'interior-design': 'room makeovers, space planning, furniture selection, color consulting, and home staging',
    'junk-removal': 'furniture removal, appliance hauling, construction debris, estate cleanouts, and donation pickup',
    'legal': 'contract review, lease disputes, small claims guidance, business formation, and notarized documents',
    'locksmith': 'lockouts, rekeying, lock installation, key duplication, and smart lock setup',
    'massage-wellness': 'deep tissue massage, Swedish massage, sports massage, prenatal massage, and reflexology',
    'meal-prep': 'weekly meal prep, diet-specific cooking, family portions, and post-workout meals',
    'moving-hauling': 'local moves, apartment moves, furniture delivery, packing services, and storage transport',
    'music-lessons': 'guitar lessons, piano instruction, vocal coaching, drum lessons, and music theory',
    'notary': 'document notarization, loan signings, affidavits, power of attorney, and mobile notary service',
    'painting': 'interior painting, exterior painting, accent walls, cabinet refinishing, and touch-up work',
    'personal-training': 'one-on-one training, group fitness, weight loss programs, strength training, and flexibility coaching',
    'pest-control': 'roach treatment, bed bug removal, rodent control, ant extermination, and preventive spraying',
    'pet-grooming': 'dog grooming, cat grooming, nail trimming, de-shedding treatments, and mobile grooming',
    'photography': 'portrait sessions, event photography, headshots, product photography, and real estate photos',
    'plant-care': 'indoor plant maintenance, repotting services, plant health consultations, and balcony garden setup',
    'plumbing': 'leak repair, drain unclogging, toilet installation, faucet replacement, and water heater service',
    'smart-home-setup': 'smart speaker installation, security camera setup, smart lighting, thermostat configuration, and home automation',
    'social-media-mgmt': 'account management, content scheduling, engagement strategy, analytics reporting, and influencer outreach',
    'soundproofing': 'wall insulation, window treatment, door sealing, acoustic panels, and studio soundproofing',
    'tailoring': 'hem alterations, suit tailoring, dress fittings, zipper replacement, and custom adjustments',
    'tax-accounting': 'tax filing, bookkeeping, quarterly estimates, small business accounting, and audit preparation',
    'tutoring': 'math tutoring, SAT/ACT prep, college essay help, language instruction, and science tutoring',
    'tv-mounting': 'flat-screen mounting, cable management, sound bar installation, and projector setup',
    'videography': 'event videography, promotional videos, social media reels, interviews, and real estate walkthroughs',
    'web-app-dev': 'website design, app development, e-commerce builds, WordPress setup, and SEO optimization',
    'window-cleaning': 'residential window cleaning, commercial window washing, screen cleaning, and high-rise service',
  },
  gigs: {
    'background-extra-work': 'TV and film background roles, commercial extras, music video appearances, and crowd scene casting',
    'bartending': 'event bartending, private party bar service, cocktail catering, and promotional tastings',
    'brand-ambassador': 'product sampling, street team promotions, event representation, and brand activations',
    'catering-help': 'event prep, food service, kitchen assistance, cleanup crew, and buffet setup',
    'cleaning': 'one-time deep cleans, move-out cleaning, post-party cleanup, and office tidying',
    'closet-organizing': 'wardrobe edits, closet system installation, seasonal rotation, and donation sorting',
    'content-creation': 'social media posts, product photos, short-form video, blog drafts, and TikTok content',
    'data-entry': 'spreadsheet work, database input, document digitization, and form processing',
    'delivery-runs': 'package drops, grocery delivery, restaurant pickups, and same-day courier runs',
    'dog-walking': 'daily walks, group walks, puppy visits, and senior dog exercise',
    'errand-running': 'pharmacy pickups, dry cleaning drop-off, post office runs, and miscellaneous errands',
    'event-setup': 'table and chair setup, decoration hanging, sound equipment setup, and venue breakdown',
    'flyer-promo': 'flyer distribution, door-to-door drops, poster hanging, and street marketing',
    'focus-groups': 'paid research sessions, product testing, survey participation, and user interviews',
    'furniture-assembly': 'IKEA assembly, desk setup, bookshelf building, and bed frame construction',
    'grocery-shopping': 'weekly grocery runs, specialty store shopping, bulk buying, and delivery to your door',
    'house-sitting': 'overnight stays, plant watering, mail collection, and pet companionship',
    'line-waiting': 'restaurant line holding, sneaker release queues, government office waits, and event lines',
    'market-research': 'survey completion, in-store audits, mystery shopping, and consumer interviews',
    'moving-help': 'loading and unloading, furniture carrying, box packing, and truck riding',
    'packing-unpacking': 'box packing, labeling, fragile item wrapping, and unpacking at your new place',
    'painting': 'room painting, touch-ups, accent walls, and small area jobs',
    'personal-shopping': 'outfit selection, gift shopping, home decor sourcing, and style consultations',
    'pet-sitting': 'overnight pet care, drop-in visits, medication administration, and multi-pet sitting',
    'photography': 'event photos, portrait sessions, product shots, and real estate photography',
    'snow-shoveling': 'sidewalk clearing, stoop shoveling, driveway plowing, and salt spreading',
    'tech-help': 'computer setup, Wi-Fi troubleshooting, printer installation, and phone or tablet support',
    'translation': 'document translation, interpreter services, phone call translation, and form assistance',
    'video-editing': 'social media edits, YouTube videos, event highlight reels, and promotional clips',
    'warehouse-help': 'inventory sorting, package handling, shelf stocking, and order fulfillment',
  },
  'tickets': {
    'broadway': 'musical tickets, play tickets, matinee shows, orchestra seats, and preview performances',
    'comedy': 'stand-up shows, improv nights, comedy club tickets, and open mic events',
    'concerts': 'live music shows, arena concerts, intimate venue performances, and festival passes',
    'festivals': 'food festivals, music festivals, cultural events, and street fairs',
    'resale': 'sold-out event tickets, premium seating upgrades, VIP passes, and face-value transfers',
    'sports': 'Knicks, Nets, Yankees, Mets, Rangers, and other NYC sports tickets',
  },
  pets: {
    'adoption': 'dogs, cats, rabbits, birds, and other animals looking for loving homes',
    'dog-walking': 'daily walks, group walks, puppy visits, senior dog exercise, and adventure hikes',
    'grooming': 'full grooming, nail trimming, bathing, de-shedding, and breed-specific cuts',
    'lost-found-pets': 'missing pet alerts, found animal reports, sighting updates, and reunion help',
    'pet-sitting': 'overnight stays, drop-in visits, medication administration, and vacation pet care',
  },
  personals: {
    'activity-partners': 'workout buddies, hiking partners, concert companions, museum friends, and dining partners',
    'missed-connections': 'coffee shop encounters, subway moments, park conversations, and neighborhood sightings',
    'penpals-virtual-only': 'letter exchanges, email buddies, long-distance friendships, and virtual conversation partners',
    'strictly-platonic': 'friendship seekers, new-to-NYC connections, hobby partners, and neighborhood hangout buddies',
  },
  barter: {
    'goods-for-goods': 'furniture swaps, electronics trades, clothing exchanges, and household item bartering',
    'goods-for-skills': 'trade your stuff for services — exchange furniture for cleaning, electronics for tutoring, and more',
    'skills-for-skills': 'swap your expertise — trade graphic design for photography, language lessons for cooking classes, and more',
  },
  'rentals': {
    'baby-kid-gear': 'strollers, cribs, car seats, high chairs, and baby carriers',
    'cameras-gear': 'DSLR cameras, lenses, lighting kits, tripods, and video equipment',
    'formal-wear': 'evening gowns, suits, tuxedos, designer dresses, and accessories',
    'moving-equipment': 'dollies, hand trucks, moving blankets, straps, and furniture sliders',
    'party-supplies': 'folding tables, chairs, speakers, projectors, and decoration kits',
    'sports-equipment': 'bikes, kayaks, skis, camping gear, and fitness equipment',
    'tools-equipment': 'power drills, saws, ladders, pressure washers, and painting equipment',
  },
  resumes: {
    'accounting-finance': 'accountants, financial analysts, bookkeepers, tax specialists, and CFO candidates',
    'admin-office': 'office managers, executive assistants, receptionists, and administrative coordinators',
    'ai-data-science': 'machine learning engineers, data scientists, AI researchers, and analytics specialists',
    'architecture-design': 'architects, interior designers, CAD specialists, and urban planners',
    'biotech-pharma': 'lab researchers, clinical trial managers, pharmaceutical scientists, and regulatory specialists',
    'construction': 'project managers, site supervisors, estimators, and safety coordinators',
    'creative-media': 'graphic designers, video editors, content creators, and art directors',
    'customer-service': 'support specialists, call center reps, client success managers, and help desk agents',
    'cybersecurity': 'security analysts, penetration testers, compliance officers, and incident responders',
    'education-teaching': 'teachers, tutors, curriculum developers, and education administrators',
    'engineering': 'mechanical engineers, civil engineers, electrical engineers, and project engineers',
    'fashion': 'fashion designers, merchandisers, stylists, and production coordinators',
    'film-tv': 'producers, directors, editors, cinematographers, and production managers',
    'fitness-wellness': 'personal trainers, yoga instructors, wellness coaches, and gym managers',
    'food-hospitality': 'chefs, restaurant managers, bartenders, and catering coordinators',
    'healthcare': 'medical assistants, technicians, therapists, and healthcare administrators',
    'human-resources': 'HR managers, recruiters, benefits coordinators, and training specialists',
    'legal': 'paralegals, legal assistants, compliance officers, and contract specialists',
    'marketing-advertising': 'marketing managers, SEO specialists, social media managers, and brand strategists',
    'nonprofit': 'program directors, fundraisers, grant writers, and community organizers',
    'nursing': 'registered nurses, LPNs, nurse practitioners, and clinical nurse specialists',
    'operations': 'operations managers, logistics coordinators, supply chain analysts, and inventory specialists',
    'real-estate': 'real estate agents, property managers, leasing consultants, and appraisers',
    'retail': 'store managers, sales associates, visual merchandisers, and district managers',
    'sales': 'account executives, business development reps, sales managers, and territory managers',
    'social-work': 'social workers, case managers, therapists, and community outreach coordinators',
    'software-engineering': 'full-stack developers, frontend engineers, backend developers, and DevOps engineers',
    'tech': 'IT administrators, systems engineers, network specialists, and QA testers',
    'trades-skilled-labor': 'electricians, plumbers, HVAC technicians, welders, and carpenters',
    'transportation': 'CDL drivers, dispatchers, fleet managers, and logistics planners',
    'writing-editing': 'writers, editors, content strategists, and technical communicators',
  },
}

// ── Description template per category ──

type DescTemplate = (subName: string, examples: string, location: string, locationShort: string) => string

const categoryDescTemplates: Record<string, DescTemplate> = {
  housing: (sub, examples, loc, locShort) =>
    `Find ${sub.toLowerCase()} in ${loc} posted by geo-verified locals. Every listing comes from a real person confirmed to live or work here — no brokers, no scams, no fake photos. Browse ${examples}. Completely free to post and browse. Get alerts when new ${sub.toLowerCase()} listings go live in ${locShort}.`,
  jobs: (sub, examples, loc, locShort) =>
    `Find ${sub.toLowerCase()} jobs in ${loc} posted by verified local employers and businesses. Every job poster is geo-verified with a live selfie and GPS at their NYC address — no recruiters, no spam, just real opportunities in your neighborhood. Browse ${examples}. All listings are 100% free to post and apply. Sign up to get alerts when new ${sub.toLowerCase()} jobs drop in ${locShort}.`,
  'for-sale': (sub, examples, loc, locShort) =>
    `Shop ${sub.toLowerCase()} in ${loc} from your geo-verified neighbors. Every seller is confirmed to live or work nearby — meet locally, buy safely, no shipping hassles. Browse ${examples}. 100% free to list and browse. Get alerts when new ${sub.toLowerCase()} listings drop in ${locShort}.`,
  services: (sub, examples, loc, locShort) =>
    `Find trusted ${sub.toLowerCase()} professionals in ${loc} — every provider is geo-verified to your neighborhood. These are your real neighbors offering real services, not anonymous contractors from across the city. Browse ${examples}. Completely free to post and browse. Sign up to get notified when new ${sub.toLowerCase()} pros post in ${locShort}.`,
  gigs: (sub, examples, loc, locShort) =>
    `Find ${sub.toLowerCase()} gigs in ${loc} posted by your geo-verified neighbors. Quick jobs and side work from people confirmed to be in your area — pick up work right in your neighborhood. Browse ${examples}. Free to post and apply. Sign up to get alerts for new ${sub.toLowerCase()} gigs in ${locShort}.`,
  community: (sub, examples, loc, locShort) =>
    `Connect with your verified neighbors through ${sub.toLowerCase()} in ${loc}. Every post comes from someone confirmed to live or work right here — a real community board, not a faceless feed. Browse ${examples}. Free to join and post. Sign up to stay connected with ${locShort}.`,
  'tickets': (sub, examples, loc, locShort) =>
    `Buy and sell ${sub.toLowerCase()} tickets in ${loc} from geo-verified locals. No bots, no scalpers — every seller is confirmed to be a real person in your area. Browse ${examples}. Free to post and browse. Get alerts when new ${sub.toLowerCase()} tickets drop in ${locShort}.`,
  pets: (sub, examples, loc, locShort) =>
    `Find ${sub.toLowerCase()} in ${loc} from verified pet owners and animal lovers. Every poster is geo-verified — they're your actual neighbors who care about animals as much as you do. Browse ${examples}. Completely free to post. Sign up to get alerts for ${sub.toLowerCase()} in ${locShort}.`,
  personals: (sub, examples, loc, locShort) =>
    `Find ${sub.toLowerCase()} in ${loc}. Every person is geo-verified with a live selfie and GPS — you know they're real and actually local. Browse ${examples}. Free and safe to use. Sign up to connect with verified people in ${locShort}.`,
  barter: (sub, examples, loc, locShort) =>
    `Browse ${sub.toLowerCase()} listings in ${loc}. Trade with your geo-verified neighbors — every user is confirmed local. Browse ${examples}. No money needed, just swap what you have for what you need. Free to post in ${locShort}.`,
  'rentals': (sub, examples, loc, locShort) =>
    `Find ${sub.toLowerCase()} available to rent or borrow in ${loc}. Every lender is geo-verified — they're your actual neighbors. Browse ${examples}. Why buy when you can borrow from someone nearby? Free to post and browse in ${locShort}.`,
  resumes: (sub, examples, loc, locShort) =>
    `Browse verified ${sub.toLowerCase()} professionals in ${loc}. Every candidate is geo-verified with selfie + GPS — they actually live or work in your area. Browse ${examples}. Free to post your resume and get found by local employers. Get alerts for new ${sub.toLowerCase()} candidates in ${locShort}.`,
}

// Category-level descriptions (no subcategory selected)
const categoryLevelDescTemplates: Record<string, (catName: string, location: string, locationShort: string) => string> = {
  housing: (cat, loc, locShort) =>
    `Find apartments, rooms, sublets, and more in ${loc}. Every listing is posted by a geo-verified local — confirmed with a selfie and GPS at their NYC address. No brokers, no scams, no fees. Just real housing from real neighbors. Get alerts when new housing listings go live in ${locShort}.`,
  jobs: (cat, loc, locShort) =>
    `Browse jobs in ${loc} posted by verified local businesses and neighbors. From full-time careers to part-time roles across 41 industries, every poster is confirmed to be in your area with selfie + GPS verification. No middlemen, no fees. Sign up to get alerts for new jobs in ${locShort}.`,
  'for-sale': (cat, loc, locShort) =>
    `Find great deals on everything in ${loc}. Every seller is a geo-verified local — confirmed with a selfie and GPS. Furniture, electronics, clothing, bikes, and more from neighbors you can actually meet. No fees, no shipping hassles. Get alerts for new listings in ${locShort}.`,
  services: (cat, loc, locShort) =>
    `Hire trusted local professionals in ${loc}. From cleaning to plumbing to tutoring, every service provider is geo-verified with a selfie and GPS. These are your real neighbors offering real services — not anonymous gig workers from across the city. Free to post and browse in ${locShort}.`,
  gigs: (cat, loc, locShort) =>
    `Browse gig work in ${loc}. Dog walking, moving help, tutoring, event staffing, and 30+ categories — all posted by geo-verified locals. Pick up work right in your neighborhood or hire someone nearby. Free to post, free to apply in ${locShort}.`,
  community: (cat, loc, locShort) =>
    `Connect with your verified neighbors in ${loc}. Events, groups, local alerts, garage sales, stoop sales, and more — every post comes from a geo-verified local. This is your neighborhood community board, spam-free and real. Join the conversation in ${locShort}.`,
  'tickets': (cat, loc, locShort) =>
    `Buy and sell tickets and find local events in ${loc}. Every poster is a geo-verified neighbor. Broadway, concerts, comedy, festivals, and sports — get deals from real people, not scalper bots. Free to browse and post in ${locShort}.`,
  pets: (cat, loc, locShort) =>
    `Adopt pets, find dog walkers, groomers, and pet sitters in ${loc}. Every poster is a verified local — confirmed with selfie + GPS. Connect with fellow animal lovers in your neighborhood. Completely free to post and browse in ${locShort}.`,
  personals: (cat, loc, locShort) =>
    `Personals in ${loc}. Meet real, verified New Yorkers who actually live near you. Activity partners, missed connections, and platonic friendships — every user is confirmed local with selfie + GPS verification. No catfish, no fakes. Free and safe in ${locShort}.`,
  barter: (cat, loc, locShort) =>
    `Trade goods and skills with verified neighbors in ${loc}. Every user is geo-verified — they live or work right here. Goods for goods, goods for skills, skills for skills. No money needed, just swap with people you can trust. Free to post in ${locShort}.`,
  'rentals': (cat, loc, locShort) =>
    `Rent and borrow from verified neighbors in ${loc}. Tools, cameras, sports gear, party supplies, and more — all from geo-verified locals. Why buy it when your neighbor has one? Free to post and browse in ${locShort}.`,
  resumes: (cat, loc, locShort) =>
    `Browse resumes from verified professionals in ${loc}. Every candidate is geo-verified with selfie + GPS — they actually live or work here. Find local talent across 30+ industries. Free to post your resume and get found by employers in ${locShort}.`,
}

// ── Public API ──

export function getPageDescription(opts: {
  categorySlug: string
  categoryName: string
  subcategorySlug?: string
  subcategoryName?: string
  neighborhood?: string
  borough?: string
}): string {
  const { categorySlug, categoryName, subcategorySlug, subcategoryName, neighborhood, borough } = opts

  const location = neighborhood && borough ? `${neighborhood}, ${borough}` : 'New York City'
  const locationShort = neighborhood || 'NYC'

  // Subcategory page
  if (subcategorySlug && subcategoryName) {
    const examples = subcategoryExamples[categorySlug]?.[subcategorySlug] || ''
    const template = categoryDescTemplates[categorySlug]
    if (template && examples) {
      return template(subcategoryName, examples, location, locationShort)
    }
    // Fallback
    return `Browse ${subcategoryName.toLowerCase()} listings in ${location}. Every poster is geo-verified with a live selfie and GPS at their NYC address. Free to browse and post. Sign up to get alerts when new ${subcategoryName.toLowerCase()} listings drop in ${locationShort}.`
  }

  // Category page (no subcategory)
  const catTemplate = categoryLevelDescTemplates[categorySlug]
  if (catTemplate) {
    return catTemplate(categoryName, location, locationShort)
  }
  return `Browse ${categoryName.toLowerCase()} listings in ${location}. Every poster is geo-verified. Free to browse and post. Sign up to get alerts in ${locationShort}.`
}

// ── Long-tail H1 generators ──

// Housing subcategories need individual patterns
const housingH1Overrides: Record<string, (loc: string) => string> = {
  'apartments': (loc) => `Apartments for Rent in ${loc}`,
  'apartments-wanted': (loc) => `Apartments Wanted in ${loc}`,
  'co-working': (loc) => `Co-working Space in ${loc}`,
  'for-sale-real-estate': (loc) => `Real Estate for Sale in ${loc}`,
  'parking-storage': (loc) => `Parking & Storage in ${loc}`,
  'real-estate-wanted': (loc) => `Real Estate Wanted in ${loc}`,
  'rooms-shared': (loc) => `Rooms for Rent in ${loc}`,
  'sublets': (loc) => `Sublets in ${loc}`,
}

const petsH1Overrides: Record<string, (loc: string) => string> = {
  'adoption': (loc) => `Animals up for Adoption in ${loc}`,
  'dog-walking': (loc) => `Dog Walking Services in ${loc}`,
  'grooming': (loc) => `Pet Grooming Services in ${loc}`,
  'lost-found-pets': (loc) => `Lost & Found Pets in ${loc}`,
  'pet-sitting': (loc) => `Pet Sitting Services in ${loc}`,
}

const barterH1Overrides: Record<string, (loc: string) => string> = {
  'goods-for-goods': (loc) => `Barter in ${loc} — Trade Goods for Goods`,
  'goods-for-skills': (loc) => `Barter in ${loc} — Trade Goods for Skills`,
  'skills-for-skills': (loc) => `Barter in ${loc} — Swap Skills for Skills`,
}

const subcategoryH1Templates: Record<string, (sub: string, location: string) => string> = {
  housing: (sub, loc) => `${sub} in ${loc}`,
  jobs: (sub, loc) => `${sub} Jobs in ${loc}`,
  'for-sale': (sub, loc) => `${sub} for Sale in ${loc}`,
  services: (sub, loc) => `${sub} Services in ${loc}`,
  gigs: (sub, loc) => `${sub} Gigs in ${loc}`,
  community: (sub, loc) => `${sub} in ${loc}`,
  'tickets': (sub, loc) => `${sub} Tickets for Sale in ${loc}`,

  pets: (sub, loc) => `${sub} in ${loc}`,
  personals: (sub, loc) => `${sub} in ${loc}`,
  barter: (sub, loc) => `${sub} in ${loc}`,
  'rentals': (sub, loc) => `${sub} for Rent in ${loc}`,
  resumes: (sub, loc) => `${sub} Resumes in ${loc}`,
}

const categoryH1Templates: Record<string, (location: string) => string> = {
  housing: (loc) => `Housing in ${loc}`,
  jobs: (loc) => `Jobs in ${loc}`,
  'for-sale': (loc) => `For Sale in ${loc}`,
  services: (loc) => `Services in ${loc}`,
  gigs: (loc) => `Gigs in ${loc}`,
  community: (loc) => `Community in ${loc}`,
  'tickets': (loc) => `Tickets & Events in ${loc}`,
  pets: (loc) => `Pets in ${loc}`,
  personals: (loc) => `Personals in ${loc}`,
  barter: (loc) => `Barter in ${loc}`,
  'rentals': (loc) => `Rentals & Lending in ${loc}`,
  resumes: (loc) => `Resumes in ${loc}`,
}

export function getLongTailH1(opts: {
  categorySlug: string
  subcategoryName?: string
  subcategorySlug?: string
  neighborhood?: string
  borough?: string
}): string {
  const { categorySlug, subcategoryName, subcategorySlug, neighborhood, borough } = opts
  const location = neighborhood && borough ? `${neighborhood}, ${borough}` : 'New York City'

  if (subcategoryName) {
    // Check for per-subcategory overrides (e.g. housing)
    if (categorySlug === 'housing' && subcategorySlug && housingH1Overrides[subcategorySlug]) {
      return housingH1Overrides[subcategorySlug](location)
    }
    if (categorySlug === 'pets' && subcategorySlug && petsH1Overrides[subcategorySlug]) {
      return petsH1Overrides[subcategorySlug](location)
    }
    if (categorySlug === 'barter' && subcategorySlug && barterH1Overrides[subcategorySlug]) {
      return barterH1Overrides[subcategorySlug](location)
    }
    const fn = subcategoryH1Templates[categorySlug]
    if (fn) return fn(subcategoryName, location)
    return `${subcategoryName} in ${location}`
  }
  const fn = categoryH1Templates[categorySlug]
  if (fn) return fn(location)
  return `Listings in ${location}`
}

// ── Sample listings (shown when 0 real listings) ──

export interface SampleListing {
  title: string
  price: string | null
  tag: string
}

const categorySampleTemplates: Record<string, (sub: string, loc: string) => SampleListing[]> = {
  housing: (sub, loc) => [
    { title: `${sub} — Spacious, Great Light, Available Now`, price: '$2,200/mo', tag: 'Example' },
    { title: `${sub} in ${loc} — Renovated, Pet-Friendly`, price: '$1,800/mo', tag: 'Example' },
    { title: `${sub} — Walk to Subway, Laundry in Building`, price: '$2,500/mo', tag: 'Example' },
    { title: `Quiet ${sub} — Tree-Lined Block, Move-In Ready`, price: '$2,000/mo', tag: 'Example' },
    { title: `${sub} — Flexible Lease, Utilities Included`, price: '$1,650/mo', tag: 'Example' },
  ],
  jobs: (sub, loc) => [
    { title: `Hiring: ${sub} — Full-Time, Competitive Pay`, price: '$55K–$75K', tag: 'Example' },
    { title: `${sub} Position in ${loc} — Start This Week`, price: '$25/hr', tag: 'Example' },
    { title: `Part-Time ${sub} — Flexible Schedule`, price: '$20–$30/hr', tag: 'Example' },
    { title: `Entry-Level ${sub} — Training Provided`, price: '$18/hr', tag: 'Example' },
    { title: `${sub} — Remote-Friendly, Local Team`, price: '$60K+', tag: 'Example' },
  ],
  'for-sale': (sub, loc) => [
    { title: `${sub} — Excellent Condition, Must Sell`, price: '$150', tag: 'Example' },
    { title: `${sub} — Like New, Barely Used`, price: '$75', tag: 'Example' },
    { title: `${sub} — Great Deal, Pickup in ${loc}`, price: '$200', tag: 'Example' },
    { title: `${sub} Bundle — Everything Must Go`, price: '$50', tag: 'Example' },
    { title: `Premium ${sub} — OBO, Moving Sale`, price: '$300', tag: 'Example' },
  ],
  services: (sub, loc) => [
    { title: `${sub} — Licensed & Insured, Free Estimates`, price: null, tag: 'Example' },
    { title: `Professional ${sub} in ${loc} — Same-Day Available`, price: null, tag: 'Example' },
    { title: `${sub} — 10+ Years Experience, References Available`, price: null, tag: 'Example' },
    { title: `Affordable ${sub} — Serving All of ${loc}`, price: null, tag: 'Example' },
    { title: `${sub} Pro — Evenings & Weekends, Book Now`, price: null, tag: 'Example' },
  ],
  gigs: (sub, loc) => [
    { title: `${sub} Needed This Weekend — $150 Cash`, price: '$150', tag: 'Example' },
    { title: `${sub} Gig in ${loc} — Flexible Hours`, price: '$20/hr', tag: 'Example' },
    { title: `Quick ${sub} Job — 2 Hours, Good Pay`, price: '$80', tag: 'Example' },
    { title: `${sub} Help Wanted — Start Tomorrow`, price: '$25/hr', tag: 'Example' },
    { title: `${sub} — One-Time Job, Pay Same Day`, price: '$100', tag: 'Example' },
  ],
  community: (sub, loc) => [
    { title: `${sub} — All ${loc} Neighbors Welcome`, price: null, tag: 'Example' },
    { title: `${loc} ${sub} — This Saturday`, price: null, tag: 'Example' },
    { title: `${sub} — Free & Open to the Community`, price: null, tag: 'Example' },
    { title: `Join Our ${loc} ${sub}`, price: null, tag: 'Example' },
    { title: `${sub} Update — Important for ${loc} Residents`, price: null, tag: 'Example' },
  ],
  'tickets': (sub, loc) => [
    { title: `${sub} Tickets — 2 Available, Below Face Value`, price: '$85 ea', tag: 'Example' },
    { title: `${sub} — This Friday, Great Seats`, price: '$120', tag: 'Example' },
    { title: `${sub} Tickets — Sold Out Everywhere, Have 2`, price: '$95', tag: 'Example' },
    { title: `${sub} — Local Event in ${loc}, Free Entry`, price: 'Free', tag: 'Example' },
    { title: `2 Tickets to ${sub} — Can't Make It, Face Value`, price: '$70 ea', tag: 'Example' },
  ],
  pets: (sub, loc) => [
    { title: `${sub} — Experienced & Reliable in ${loc}`, price: null, tag: 'Example' },
    { title: `${sub} — References Available, Flexible Schedule`, price: null, tag: 'Example' },
    { title: `${sub} in ${loc} — Bonded & Insured`, price: null, tag: 'Example' },
    { title: `${sub} — Weekend & Holiday Availability`, price: null, tag: 'Example' },
    { title: `Local ${sub} — Your ${loc} Neighbor`, price: null, tag: 'Example' },
  ],
  personals: (sub, loc) => [
    { title: `${sub} — Looking to Connect in ${loc}`, price: null, tag: 'Example' },
    { title: `${sub} — New to the Neighborhood, Say Hi`, price: null, tag: 'Example' },
    { title: `${sub} — Weekend Coffee? Verified & Real`, price: null, tag: 'Example' },
    { title: `${sub} in ${loc} — Let's Meet Up`, price: null, tag: 'Example' },
    { title: `${sub} — Genuine & Local, No Games`, price: null, tag: 'Example' },
  ],
  barter: (sub, loc) => [
    { title: `${sub} — Will Trade for Help with Moving`, price: null, tag: 'Example' },
    { title: `${sub} Swap in ${loc} — Open to Offers`, price: null, tag: 'Example' },
    { title: `Trading ${sub} — What Do You Have?`, price: null, tag: 'Example' },
    { title: `${sub} — Fair Trade with Your ${loc} Neighbor`, price: null, tag: 'Example' },
    { title: `${sub} Exchange — Pickup in ${loc}`, price: null, tag: 'Example' },
  ],
  'rentals': (sub, loc) => [
    { title: `${sub} Available to Rent — Daily or Weekly`, price: '$25/day', tag: 'Example' },
    { title: `${sub} — Borrow from Your ${loc} Neighbor`, price: '$15/day', tag: 'Example' },
    { title: `${sub} for Rent — Great Condition`, price: '$10/day', tag: 'Example' },
    { title: `Need ${sub}? Rent Mine — Pickup in ${loc}`, price: '$20/day', tag: 'Example' },
    { title: `${sub} — Available This Weekend`, price: '$30/wknd', tag: 'Example' },
  ],
  resumes: (sub, loc) => [
    { title: `${sub} Professional — 5+ Years Experience in ${loc}`, price: null, tag: 'Example' },
    { title: `${sub} — Available Immediately, Strong References`, price: null, tag: 'Example' },
    { title: `Experienced ${sub} Specialist — Open to Full-Time`, price: null, tag: 'Example' },
    { title: `${sub} — Freelance or Contract, Based in ${loc}`, price: null, tag: 'Example' },
    { title: `${sub} Pro — Portfolio Available, Verified Local`, price: null, tag: 'Example' },
  ],
}

export function getSampleListings(opts: {
  categorySlug: string
  subcategoryName: string
  neighborhood?: string
  borough?: string
}): SampleListing[] {
  const { categorySlug, subcategoryName, neighborhood, borough } = opts
  const location = neighborhood || 'NYC'
  const fn = categorySampleTemplates[categorySlug]
  if (fn) return fn(subcategoryName, location)
  return [
    { title: `${subcategoryName} — Posted by a Verified ${location} Local`, price: null, tag: 'Example' },
    { title: `${subcategoryName} in ${location} — Free to Browse`, price: null, tag: 'Example' },
    { title: `${subcategoryName} — From Your Verified Neighbors`, price: null, tag: 'Example' },
    { title: `${subcategoryName} — Real Posts, Real People`, price: null, tag: 'Example' },
    { title: `${subcategoryName} — Sign Up to Post Yours`, price: null, tag: 'Example' },
  ]
}
