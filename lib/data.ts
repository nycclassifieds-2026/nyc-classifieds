// ─── Single source of truth for all site data ───

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// ─── Categories ───

export interface Category {
  name: string
  slug: string
  color: string
  subs: string[]
  tagline?: string
}

export const categories: Category[] = [
  { name: 'Housing', slug: 'housing', color: '#dc2626', subs: ['Apartments', 'Apartments Wanted', 'Co-working', 'For Sale / Real Estate', 'Parking & Storage', 'Real Estate Wanted', 'Rooms & Shared', 'Sublets'] },
  { name: 'Jobs', slug: 'jobs', color: '#0891b2', subs: ['Accounting & Finance', 'Admin & Office', 'AI & Machine Learning', 'Architecture & Design', 'Biotech & Pharma', 'Cannabis Industry', 'Construction', 'Creative & Media', 'Customer Service', 'Cybersecurity', 'Data Science', 'Delivery & Logistics', 'Education & Teaching', 'Engineering', 'Fashion & Apparel', 'Film & TV Production', 'Fitness & Wellness', 'Food & Beverage', 'Government', 'Healthcare', 'Hotel & Tourism', 'Human Resources', 'Legal', 'Marketing & Advertising', 'Nonprofit', 'Nursing', 'Operations & Warehouse', 'Part-time', 'Property Management', 'Real Estate', 'Remote / Hybrid', 'Restaurant & Hospitality', 'Retail', 'Sales', 'Security', 'Social Work', 'Software Engineering', 'Sustainability & Green', 'Tech & Engineering', 'Trades & Skilled Labor', 'Transportation', 'Writing & Editing'] },
  { name: 'For Sale', slug: 'for-sale', color: '#2563eb', subs: ['Appliances', 'Art & Prints', 'Baby & Kids', 'Bikes', 'Books & Media', 'Building Materials', 'Cameras & Photo', 'Cars & Trucks', 'Cell Phones', 'Clothing & Accessories', 'Collectibles', 'Computer Parts', 'E-bikes & Scooters', 'Electronics', 'Free Stuff', 'Furniture', 'Gaming & Consoles', 'Handbags & Wallets', 'Health & Beauty', 'Home Decor', 'Instruments', 'Jewelry & Watches', 'Kitchen & Dining', 'Motorcycles', 'Office Equipment', 'Outdoor & Camping', 'Power Tools', 'Sneakers & Streetwear', 'Sporting Goods', 'Toys & Games', 'Vinyl & Records', 'Vintage & Antiques'] },
  { name: 'Services', slug: 'services', color: '#ea580c', subs: ['AI & Automation', 'Appliance Repair', 'Auto Repair', 'Beauty & Hair', 'Bike Repair', 'Carpentry', 'Catering', 'Childcare & Nanny', 'Cleaning', 'Content Creation', 'DJ & Entertainment', 'E-bike & Scooter Repair', 'Electrical', 'Flooring', 'Graphic Design', 'Handyman', 'Home Organizing', 'HVAC & Heating', 'Interior Design', 'Junk Removal', 'Legal', 'Locksmith', 'Massage & Wellness', 'Meal Prep', 'Moving & Hauling', 'Music Lessons', 'Notary', 'Painting', 'Personal Training', 'Pest Control', 'Pet Grooming', 'Photography', 'Plant Care', 'Plumbing', 'Smart Home Setup', 'Social Media Mgmt', 'Soundproofing', 'Tailoring', 'Tax & Accounting', 'Tutoring', 'TV Mounting', 'Videography', 'Web & App Dev', 'Window Cleaning'] },
  { name: 'Gigs', slug: 'gigs', color: '#d97706', subs: ['Background & Extra Work', 'Bartending', 'Brand Ambassador', 'Catering Help', 'Cleaning', 'Closet Organizing', 'Content Creation', 'Data Entry', 'Delivery Runs', 'Dog Walking', 'Errand Running', 'Event Setup', 'Flyer & Promo', 'Focus Groups', 'Furniture Assembly', 'Grocery Shopping', 'House Sitting', 'Line Waiting', 'Market Research', 'Moving Help', 'Packing & Unpacking', 'Painting', 'Personal Shopping', 'Pet Sitting', 'Photography', 'Snow Shoveling', 'Tech Help', 'Translation', 'Video Editing', 'Warehouse Help'] },
  { name: 'Community', slug: 'community', color: '#059669', tagline: 'The Porch | Local Feed', subs: ['Carpool & Rideshare', 'Events', 'Garage Sales', 'Groups', 'Local Alerts', 'Lost & Found', 'Neighborhood Questions', 'Pet Sightings', 'Recommendations', 'Seasonal', 'Shoutouts', 'Stoop Sales', 'Volunteers', 'Welcome / New Here'] },
  { name: 'Tickets & Events', slug: 'tickets', color: '#6d28d9', subs: ['Broadway', 'Comedy', 'Concerts', 'Festivals', 'Resale', 'Sports'] },
  { name: 'Pets', slug: 'pets', color: '#65a30d', subs: ['Adoption', 'Dog Walking', 'Grooming', 'Lost & Found Pets', 'Pet Sitting'] },
  { name: 'Personals', slug: 'personals', color: '#db2777', subs: ['Activity Partners', 'Missed Connections', 'Strictly Platonic'] },
  { name: 'Barter', slug: 'barter', color: '#7c3aed', subs: ['Goods for Goods', 'Goods for Skills', 'Skills for Skills'] },
  { name: 'Rentals & Lending', slug: 'rentals', color: '#7c3aed', subs: ['Cameras & Gear', 'Party Supplies', 'Sports Equipment', 'Tools & Equipment'] },
  { name: 'Resumes', slug: 'resumes', color: '#4b5563', subs: ['Accounting & Finance', 'Admin & Office', 'AI & Data Science', 'Architecture & Design', 'Biotech & Pharma', 'Construction', 'Creative & Media', 'Customer Service', 'Cybersecurity', 'Education & Teaching', 'Engineering', 'Fashion', 'Film & TV', 'Fitness & Wellness', 'Food & Hospitality', 'Healthcare', 'Human Resources', 'Legal', 'Marketing & Advertising', 'Nonprofit', 'Nursing', 'Operations', 'Real Estate', 'Retail', 'Sales', 'Social Work', 'Software Engineering', 'Tech', 'Trades & Skilled Labor', 'Transportation', 'Writing & Editing'] },
]

// ─── Business Categories ───

export const businessCategories = [
  'Auto Shop',
  'Bakery',
  'Bar & Lounge',
  'Barbershop',
  'Beauty Salon',
  'Bookstore',
  'Cafe',
  'Catering',
  'Childcare',
  'Cleaning Service',
  'Clothing Store',
  'Construction',
  'Consulting',
  'Creative Agency',
  'Deli & Bodega',
  'Dental Office',
  'Dog Walker',
  'Dry Cleaner',
  'Electrician',
  'Event Planner',
  'Fitness Studio',
  'Florist',
  'Food Truck',
  'Freelancer',
  'Furniture Store',
  'General Contractor',
  'Graphic Designer',
  'Grocery Store',
  'Gym',
  'Handyman',
  'Home Inspector',
  'Insurance',
  'Interior Designer',
  'IT Services',
  'Jewelry Store',
  'Landscaping',
  'Laundromat',
  'Law Firm',
  'Locksmith',
  'Massage & Spa',
  'Mechanic',
  'Medical Office',
  'Moving Company',
  'Music Studio',
  'Nail Salon',
  'Notary',
  'Painter',
  'Pest Control',
  'Pet Grooming',
  'Pet Store',
  'Pharmacy',
  'Photographer',
  'Plumber',
  'Printing Shop',
  'Real Estate',
  'Restaurant',
  'Roofing',
  'Security',
  'Tailor',
  'Tattoo Studio',
  'Tax & Accounting',
  'Tech Repair',
  'Therapist',
  'Tutor',
  'Veterinarian',
  'Videographer',
  'Web Developer',
  'Yoga Studio',
  'Other',
]

// ─── Business Profile URL Helper ───

export function businessProfileUrl(businessSlug: string, category: string | null): string {
  const catSlug = category ? slugify(category) : 'other'
  return `/business/${catSlug}/${businessSlug}`
}

// Lookup helpers
export const categoryBySlug = Object.fromEntries(categories.map(c => [c.slug, c]))
export const allCategorySlugs = categories.map(c => c.slug)

// ─── Boroughs & Neighborhoods ───

export interface Borough {
  name: string
  slug: string
  neighborhoods: string[]
}

export const boroughs: Borough[] = [
  { name: 'Manhattan', slug: 'manhattan', neighborhoods: ['Alphabet City','Battery Park City','Carnegie Hill','Chelsea','Chinatown','East Harlem','East Village','Financial District','Flatiron','Gramercy','Greenwich Village','Hamilton Heights','Harlem','Hell\'s Kitchen','Hudson Yards','Inwood','Kips Bay','Koreatown','Lenox Hill','Lincoln Square','Little Italy','Lower East Side','Manhattan Valley','Meatpacking District','Midtown East','Midtown West','Morningside Heights','Murray Hill','NoHo','Nolita','Roosevelt Island','SoHo','Stuyvesant Town','Sugar Hill','Times Square','Tribeca','Two Bridges','Upper East Side','Upper West Side','Washington Heights','West Village'] },
  { name: 'Brooklyn', slug: 'brooklyn', neighborhoods: ['Bay Ridge','Bed-Stuy','Bensonhurst','Boerum Hill','Borough Park','Brighton Beach','Brooklyn Heights','Brownsville','Bushwick','Canarsie','Carroll Gardens','Clinton Hill','Cobble Hill','Coney Island','Crown Heights','Downtown Brooklyn','DUMBO','Dyker Heights','East New York','Flatbush','Fort Greene','Greenpoint','Kensington','Midwood','Park Slope','Prospect Heights','Red Hook','Sheepshead Bay','Sunset Park','Williamsburg'] },
  { name: 'Queens', slug: 'queens', neighborhoods: ['Astoria','Bayside','Bellerose','Briarwood','College Point','Corona','Douglaston','Elmhurst','Far Rockaway','Flushing','Forest Hills','Fresh Meadows','Glen Oaks','Howard Beach','Jackson Heights','Jamaica','Kew Gardens','Little Neck','Long Island City','Maspeth','Middle Village','Ozone Park','Rego Park','Ridgewood','Rockaway Beach','St. Albans','Sunnyside','Whitestone','Woodhaven','Woodside'] },
  { name: 'The Bronx', slug: 'bronx', neighborhoods: ['Belmont','Concourse','Fordham','Highbridge','Hunts Point','Kingsbridge','Morris Park','Mott Haven','Norwood','Pelham Bay','Riverdale','South Bronx','Throgs Neck','Tremont','Wakefield'] },
  { name: 'Staten Island', slug: 'staten-island', neighborhoods: ['Annadale','Eltingville','Great Kills','Huguenot','New Dorp','Prince\'s Bay','St. George','Stapleton','Tompkinsville','Tottenville'] },
]

// Lookup helpers
export const boroughBySlug = Object.fromEntries(boroughs.map(b => [b.slug, b]))
export const allBoroughSlugs = boroughs.map(b => b.slug)

export function neighborhoodSlug(name: string): string {
  return name.toLowerCase().replace(/ /g, '-').replace(/'/g, '').replace(/\./g, '')
}

// Reverse lookup: neighborhood slug → { borough, neighborhood name }
export const neighborhoodLookup: Record<string, { borough: Borough; name: string }> = {}
for (const b of boroughs) {
  for (const n of b.neighborhoods) {
    neighborhoodLookup[`${b.slug}/${neighborhoodSlug(n)}`] = { borough: b, name: n }
  }
}

// Check if a slug is a valid neighborhood within a borough
export function findNeighborhood(boroughSlug: string, nSlug: string) {
  return neighborhoodLookup[`${boroughSlug}/${nSlug}`] || null
}

// ─── Porch Post Types ───

export interface PorchPostType {
  name: string
  slug: string
  icon: string
  color: string
  expiresIn: number // hours
  pinnable?: boolean
}

export const porchPostTypes: PorchPostType[] = [
  { name: 'Recommendation', slug: 'recommendation', icon: '\u2B50', color: '#059669', expiresIn: 720 },
  { name: 'Question', slug: 'question', icon: '\u2753', color: '#2563eb', expiresIn: 720 },
  { name: 'Alert', slug: 'alert', icon: '\u26A0\uFE0F', color: '#dc2626', expiresIn: 48 },
  { name: 'Lost & Found', slug: 'lost-and-found', icon: '\uD83D\uDD0D', color: '#ea580c', expiresIn: 72, pinnable: true },
  { name: 'Event', slug: 'event', icon: '\uD83C\uDF89', color: '#6d28d9', expiresIn: 720 },
  { name: 'Stoop Sale', slug: 'stoop-sale', icon: '\uD83C\uDFE0', color: '#d97706', expiresIn: 720 },
  { name: 'Garage Sale', slug: 'garage-sale', icon: '\uD83D\uDCE6', color: '#d97706', expiresIn: 720 },
  { name: 'Volunteer', slug: 'volunteer', icon: '\uD83E\uDD1D', color: '#059669', expiresIn: 720 },
  { name: 'Carpool', slug: 'carpool', icon: '\uD83D\uDE97', color: '#0891b2', expiresIn: 720 },
  { name: 'Pet Sighting', slug: 'pet-sighting', icon: '\uD83D\uDC3E', color: '#65a30d', expiresIn: 72, pinnable: true },
  { name: 'Welcome', slug: 'welcome', icon: '\uD83D\uDC4B', color: '#db2777', expiresIn: 720 },
  { name: 'Group', slug: 'group', icon: '\uD83D\uDC65', color: '#7c3aed', expiresIn: 720 },
  { name: 'Seasonal', slug: 'seasonal', icon: '\uD83C\uDF3B', color: '#f59e0b', expiresIn: 720 },
  { name: 'Shoutout', slug: 'shoutout', icon: '\uD83D\uDCAA', color: '#ec4899', expiresIn: 720 },
]

export const porchPostTypeBySlug = Object.fromEntries(porchPostTypes.map(t => [t.slug, t]))
export const allPorchPostTypeSlugs = porchPostTypes.map(t => t.slug)

// ─── Homepage column layout (balanced) ───

export const homepageColumns = [
  [categoryBySlug['housing'], categoryBySlug['jobs']],
  [categoryBySlug['for-sale'], categoryBySlug['community']],
  [categoryBySlug['services']],
  [categoryBySlug['gigs'], categoryBySlug['tickets'], categoryBySlug['pets']],
  [categoryBySlug['resumes'], categoryBySlug['personals'], categoryBySlug['barter'], categoryBySlug['rentals']],
]

// Balanced 2-column layout for mobile (~117 vs ~116 visual lines)
export const mobileHomepageColumns = [
  [categoryBySlug['services'], categoryBySlug['jobs'], categoryBySlug['community'], categoryBySlug['pets'], categoryBySlug['barter'], categoryBySlug['rentals']],
  [categoryBySlug['for-sale'], categoryBySlug['resumes'], categoryBySlug['gigs'], categoryBySlug['housing'], categoryBySlug['tickets'], categoryBySlug['personals']],
]
