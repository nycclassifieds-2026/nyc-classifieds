import type { Metadata } from 'next'

const SITE_NAME = 'The NYC Classifieds'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thenycclassifieds.com'
const SITE_DESC = 'Free local classifieds for NYC. Apartments, jobs, services, for sale, gigs & more across 126+ neighborhoods in all 5 boroughs. Every user geo-verified. 100% free.'

// ─── Metadata builder ───

interface SeoOptions {
  title: string
  description: string
  path: string
  type?: 'website' | 'article'
  noIndex?: boolean
}

export function buildMetadata({ title, description, path, type = 'website', noIndex }: SeoOptions): Metadata {
  const url = `${SITE_URL}${path}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    ...(noIndex && { robots: { index: false, follow: false } }),
  }
}

// ─── JSON-LD Schemas ───

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESC,
    inLanguage: 'en-US',
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESC,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/icon-512.png`,
      width: 512,
      height: 512,
    },
    areaServed: {
      '@type': 'City',
      name: 'New York',
      sameAs: 'https://en.wikipedia.org/wiki/New_York_City',
    },
    knowsAbout: [
      'NYC classifieds',
      'free classifieds',
      'local classifieds',
      'New York City apartments',
      'NYC jobs',
      'NYC services',
      'NYC for sale',
      'neighborhood community boards',
      'NYC housing',
      'NYC gigs',
      'Craigslist alternative',
    ],
    slogan: 'Free local classifieds for New York City — every user geo-verified',
  }
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      ...items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: item.name,
        item: `${SITE_URL}${item.url}`,
      })),
    ],
  }
}

export function collectionPageSchema(opts: {
  name: string
  description: string
  url: string
  items?: { name: string; url: string }[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}${opts.url}`,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    ...(opts.items && opts.items.length > 0 && {
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: opts.items.length,
        itemListElement: opts.items.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          url: `${SITE_URL}${item.url}`,
        })),
      },
    }),
  }
}

export function placeSchema(opts: {
  name: string
  borough?: string
  description: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}${opts.url}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: opts.borough || 'New York',
      addressRegion: 'NY',
      addressCountry: 'US',
    },
    containedInPlace: {
      '@type': 'City',
      name: 'New York',
      sameAs: 'https://en.wikipedia.org/wiki/New_York_City',
    },
  }
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function discussionForumSchema(opts: {
  name: string
  description: string
  url: string
  borough?: string
  neighborhood?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForum',
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}${opts.url}`,
    author: { '@type': 'Organization', name: SITE_NAME },
    ...(opts.neighborhood && {
      spatialCoverage: {
        '@type': 'Place',
        name: `${opts.neighborhood}${opts.borough ? `, ${opts.borough}` : ''}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: opts.borough || 'New York',
          addressRegion: 'NY',
          addressCountry: 'US',
        },
      },
    }),
  }
}

export function articleSchema(opts: {
  title: string
  description: string
  url: string
  datePublished: string
  author: string
  category?: string
  tags?: string[]
  wordCount?: number
  articleBody?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    url: `${SITE_URL}${opts.url}`,
    datePublished: opts.datePublished,
    dateModified: opts.datePublished,
    inLanguage: 'en-US',
    author: {
      '@type': 'Organization',
      name: opts.author,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icon-512.png`,
        width: 512,
        height: 512,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}${opts.url}`,
    },
    isPartOf: {
      '@type': 'Blog',
      name: `${SITE_NAME} Blog`,
      url: `${SITE_URL}/blog`,
    },
    ...(opts.category && { articleSection: opts.category }),
    ...(opts.tags && opts.tags.length > 0 && { keywords: opts.tags.join(', ') }),
    ...(opts.wordCount && { wordCount: opts.wordCount }),
    ...(opts.articleBody && { articleBody: opts.articleBody }),
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['[data-article-headline]', '[data-article-body]'],
    },
    about: {
      '@type': 'Thing',
      name: opts.category || 'NYC Classifieds',
      description: opts.description,
    },
  }
}

export function howToSchema(opts: {
  name: string
  description: string
  url: string
  steps: { name: string; text: string }[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}${opts.url}`,
    step: opts.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  }
}

export function itemListSchema(opts: {
  name: string
  description: string
  url: string
  items: { name: string; url?: string }[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}${opts.url}`,
    numberOfItems: opts.items.length,
    itemListElement: opts.items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.url && { url: item.url }),
    })),
  }
}

// ─── Speakable Schema (for voice assistants + AI) ───

export function speakableSchema(opts: { url: string; cssSelectors?: string[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: `${SITE_URL}${opts.url}`,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: opts.cssSelectors || ['h1', '[data-speakable]'],
    },
  }
}

// ─── Category → Schema.org Type Map ───

interface CategorySeo {
  schemaType: string
  keywords: string[]
  descriptionTemplate: string
}

const CATEGORY_SEO_MAP: Record<string, CategorySeo> = {
  'Auto Shop': { schemaType: 'AutoRepair', keywords: ['auto shop', 'auto repair', 'car repair', 'mechanic', 'NYC auto shop'], descriptionTemplate: 'providing auto repair and maintenance services in NYC' },
  'Bakery': { schemaType: 'Bakery', keywords: ['bakery', 'fresh bread', 'pastries', 'cakes', 'NYC bakery'], descriptionTemplate: 'serving fresh baked goods in NYC' },
  'Bar & Lounge': { schemaType: 'BarOrPub', keywords: ['bar', 'lounge', 'cocktails', 'nightlife', 'NYC bar'], descriptionTemplate: 'serving drinks and good times in NYC' },
  'Barbershop': { schemaType: 'BarberShop', keywords: ['barbershop', 'haircut', 'men\'s grooming', 'barber', 'NYC barbershop'], descriptionTemplate: 'offering expert haircuts and grooming in NYC' },
  'Beauty Salon': { schemaType: 'BeautySalon', keywords: ['beauty salon', 'hair salon', 'styling', 'beauty', 'NYC beauty salon'], descriptionTemplate: 'providing beauty and styling services in NYC' },
  'Bookstore': { schemaType: 'BookStore', keywords: ['bookstore', 'books', 'reading', 'literature', 'NYC bookstore'], descriptionTemplate: 'selling books and literature in NYC' },
  'Cafe': { schemaType: 'CafeOrCoffeeShop', keywords: ['cafe', 'coffee shop', 'coffee', 'espresso', 'NYC cafe'], descriptionTemplate: 'serving coffee and more in NYC' },
  'Catering': { schemaType: 'FoodEstablishment', keywords: ['catering', 'event catering', 'food service', 'caterer', 'NYC catering'], descriptionTemplate: 'providing catering services in NYC' },
  'Childcare': { schemaType: 'ChildCare', keywords: ['childcare', 'daycare', 'babysitting', 'child care', 'NYC childcare'], descriptionTemplate: 'providing childcare services in NYC' },
  'Cleaning Service': { schemaType: 'LocalBusiness', keywords: ['cleaning service', 'house cleaning', 'commercial cleaning', 'maid service', 'NYC cleaning'], descriptionTemplate: 'providing professional cleaning services in NYC' },
  'Clothing Store': { schemaType: 'ClothingStore', keywords: ['clothing store', 'fashion', 'apparel', 'clothes', 'NYC clothing'], descriptionTemplate: 'selling clothing and fashion in NYC' },
  'Construction': { schemaType: 'LocalBusiness', keywords: ['construction', 'building', 'renovation', 'contractor', 'NYC construction'], descriptionTemplate: 'providing construction services in NYC' },
  'Consulting': { schemaType: 'LocalBusiness', keywords: ['consulting', 'consultant', 'business consulting', 'advisory', 'NYC consulting'], descriptionTemplate: 'providing consulting services in NYC' },
  'Creative Agency': { schemaType: 'LocalBusiness', keywords: ['creative agency', 'design agency', 'branding', 'marketing', 'NYC creative agency'], descriptionTemplate: 'providing creative and design services in NYC' },
  'Deli & Bodega': { schemaType: 'LocalBusiness', keywords: ['deli', 'bodega', 'sandwich shop', 'corner store', 'NYC deli'], descriptionTemplate: 'serving deli favorites in NYC' },
  'Dental Office': { schemaType: 'Dentist', keywords: ['dentist', 'dental office', 'dental care', 'teeth cleaning', 'NYC dentist'], descriptionTemplate: 'providing dental care in NYC' },
  'Dog Walker': { schemaType: 'LocalBusiness', keywords: ['dog walker', 'dog walking', 'pet sitting', 'dog care', 'NYC dog walker'], descriptionTemplate: 'providing dog walking services in NYC' },
  'Dry Cleaner': { schemaType: 'DryCleaningOrLaundry', keywords: ['dry cleaner', 'dry cleaning', 'laundry', 'garment care', 'NYC dry cleaner'], descriptionTemplate: 'providing dry cleaning services in NYC' },
  'Electrician': { schemaType: 'Electrician', keywords: ['electrician', 'electrical repair', 'wiring', 'electrical services', 'NYC electrician'], descriptionTemplate: 'providing electrical services in NYC' },
  'Event Planner': { schemaType: 'LocalBusiness', keywords: ['event planner', 'event planning', 'party planner', 'wedding planner', 'NYC event planner'], descriptionTemplate: 'planning events in NYC' },
  'Fitness Studio': { schemaType: 'ExerciseGym', keywords: ['fitness studio', 'gym', 'personal training', 'fitness', 'NYC fitness'], descriptionTemplate: 'offering fitness and training in NYC' },
  'Florist': { schemaType: 'Florist', keywords: ['florist', 'flowers', 'flower delivery', 'floral arrangements', 'NYC florist'], descriptionTemplate: 'providing floral arrangements in NYC' },
  'Food Truck': { schemaType: 'FoodEstablishment', keywords: ['food truck', 'street food', 'mobile food', 'food vendor', 'NYC food truck'], descriptionTemplate: 'serving street food in NYC' },
  'Freelancer': { schemaType: 'LocalBusiness', keywords: ['freelancer', 'freelance', 'independent contractor', 'gig worker', 'NYC freelancer'], descriptionTemplate: 'providing freelance services in NYC' },
  'Furniture Store': { schemaType: 'FurnitureStore', keywords: ['furniture store', 'furniture', 'home furnishing', 'decor', 'NYC furniture'], descriptionTemplate: 'selling furniture in NYC' },
  'General Contractor': { schemaType: 'GeneralContractor', keywords: ['general contractor', 'contractor', 'renovation', 'remodeling', 'NYC contractor'], descriptionTemplate: 'providing contracting services in NYC' },
  'Graphic Designer': { schemaType: 'LocalBusiness', keywords: ['graphic designer', 'graphic design', 'logo design', 'branding', 'NYC graphic designer'], descriptionTemplate: 'providing graphic design services in NYC' },
  'Grocery Store': { schemaType: 'GroceryStore', keywords: ['grocery store', 'supermarket', 'groceries', 'food market', 'NYC grocery'], descriptionTemplate: 'selling groceries in NYC' },
  'Gym': { schemaType: 'ExerciseGym', keywords: ['gym', 'fitness center', 'workout', 'exercise', 'NYC gym'], descriptionTemplate: 'offering gym and fitness facilities in NYC' },
  'Handyman': { schemaType: 'LocalBusiness', keywords: ['handyman', 'home repair', 'maintenance', 'fix-it', 'NYC handyman'], descriptionTemplate: 'providing handyman services in NYC' },
  'Home Inspector': { schemaType: 'LocalBusiness', keywords: ['home inspector', 'home inspection', 'property inspection', 'building inspection', 'NYC home inspector'], descriptionTemplate: 'providing home inspection services in NYC' },
  'Insurance': { schemaType: 'InsuranceAgency', keywords: ['insurance', 'insurance agent', 'insurance broker', 'coverage', 'NYC insurance'], descriptionTemplate: 'providing insurance services in NYC' },
  'Interior Designer': { schemaType: 'LocalBusiness', keywords: ['interior designer', 'interior design', 'home design', 'decor', 'NYC interior designer'], descriptionTemplate: 'providing interior design services in NYC' },
  'IT Services': { schemaType: 'LocalBusiness', keywords: ['IT services', 'tech support', 'computer repair', 'IT consulting', 'NYC IT services'], descriptionTemplate: 'providing IT services in NYC' },
  'Jewelry Store': { schemaType: 'JewelryStore', keywords: ['jewelry store', 'jewelry', 'rings', 'necklaces', 'NYC jewelry'], descriptionTemplate: 'selling jewelry in NYC' },
  'Landscaping': { schemaType: 'LocalBusiness', keywords: ['landscaping', 'lawn care', 'garden design', 'yard maintenance', 'NYC landscaping'], descriptionTemplate: 'providing landscaping services in NYC' },
  'Laundromat': { schemaType: 'DryCleaningOrLaundry', keywords: ['laundromat', 'laundry', 'wash and fold', 'self-service laundry', 'NYC laundromat'], descriptionTemplate: 'providing laundry services in NYC' },
  'Law Firm': { schemaType: 'LegalService', keywords: ['law firm', 'lawyer', 'attorney', 'legal services', 'NYC law firm'], descriptionTemplate: 'providing legal services in NYC' },
  'Locksmith': { schemaType: 'Locksmith', keywords: ['locksmith', 'lock repair', 'key cutting', 'emergency locksmith', 'NYC locksmith'], descriptionTemplate: 'providing locksmith services in NYC' },
  'Massage & Spa': { schemaType: 'DaySpa', keywords: ['massage', 'spa', 'wellness', 'relaxation', 'NYC massage spa'], descriptionTemplate: 'providing massage and spa services in NYC' },
  'Mechanic': { schemaType: 'AutoRepair', keywords: ['mechanic', 'auto repair', 'car mechanic', 'vehicle repair', 'NYC mechanic'], descriptionTemplate: 'providing auto repair services in NYC' },
  'Medical Office': { schemaType: 'MedicalBusiness', keywords: ['medical office', 'doctor', 'physician', 'healthcare', 'NYC medical office'], descriptionTemplate: 'providing medical care in NYC' },
  'Moving Company': { schemaType: 'MovingCompany', keywords: ['moving company', 'movers', 'relocation', 'moving services', 'NYC movers'], descriptionTemplate: 'providing moving services in NYC' },
  'Music Studio': { schemaType: 'LocalBusiness', keywords: ['music studio', 'recording studio', 'music production', 'rehearsal space', 'NYC music studio'], descriptionTemplate: 'offering music studio services in NYC' },
  'Nail Salon': { schemaType: 'NailSalon', keywords: ['nail salon', 'manicure', 'pedicure', 'nails', 'NYC nail salon'], descriptionTemplate: 'providing nail care services in NYC' },
  'Notary': { schemaType: 'Notary', keywords: ['notary', 'notary public', 'notarization', 'document signing', 'NYC notary'], descriptionTemplate: 'providing notary services in NYC' },
  'Painter': { schemaType: 'HousePainter', keywords: ['painter', 'house painting', 'interior painting', 'exterior painting', 'NYC painter'], descriptionTemplate: 'providing painting services in NYC' },
  'Pest Control': { schemaType: 'LocalBusiness', keywords: ['pest control', 'exterminator', 'bug removal', 'pest management', 'NYC pest control'], descriptionTemplate: 'providing pest control services in NYC' },
  'Pet Grooming': { schemaType: 'LocalBusiness', keywords: ['pet grooming', 'dog grooming', 'cat grooming', 'pet care', 'NYC pet grooming'], descriptionTemplate: 'providing pet grooming services in NYC' },
  'Pet Store': { schemaType: 'PetStore', keywords: ['pet store', 'pet shop', 'pet supplies', 'pet food', 'NYC pet store'], descriptionTemplate: 'selling pet supplies in NYC' },
  'Pharmacy': { schemaType: 'Pharmacy', keywords: ['pharmacy', 'drugstore', 'prescription', 'medication', 'NYC pharmacy'], descriptionTemplate: 'providing pharmacy services in NYC' },
  'Photographer': { schemaType: 'LocalBusiness', keywords: ['photographer', 'photography', 'photo studio', 'portraits', 'NYC photographer'], descriptionTemplate: 'providing photography services in NYC' },
  'Plumber': { schemaType: 'Plumber', keywords: ['plumber', 'plumbing', 'emergency plumber', 'pipe repair', 'NYC plumber'], descriptionTemplate: 'providing plumbing services in NYC' },
  'Printing Shop': { schemaType: 'LocalBusiness', keywords: ['printing shop', 'print shop', 'printing services', 'copies', 'NYC printing'], descriptionTemplate: 'providing printing services in NYC' },
  'Real Estate': { schemaType: 'RealEstateAgent', keywords: ['real estate', 'realtor', 'real estate agent', 'property', 'NYC real estate'], descriptionTemplate: 'providing real estate services in NYC' },
  'Restaurant': { schemaType: 'Restaurant', keywords: ['restaurant', 'dining', 'food', 'eat', 'NYC restaurant'], descriptionTemplate: 'serving food in NYC' },
  'Roofing': { schemaType: 'RoofingContractor', keywords: ['roofing', 'roof repair', 'roofer', 'roof installation', 'NYC roofing'], descriptionTemplate: 'providing roofing services in NYC' },
  'Security': { schemaType: 'LocalBusiness', keywords: ['security', 'security services', 'security guard', 'protection', 'NYC security'], descriptionTemplate: 'providing security services in NYC' },
  'Tailor': { schemaType: 'LocalBusiness', keywords: ['tailor', 'tailoring', 'alterations', 'custom clothing', 'NYC tailor'], descriptionTemplate: 'providing tailoring services in NYC' },
  'Tattoo Studio': { schemaType: 'TattooParlor', keywords: ['tattoo studio', 'tattoo', 'tattoo artist', 'body art', 'NYC tattoo'], descriptionTemplate: 'creating tattoo art in NYC' },
  'Tax & Accounting': { schemaType: 'AccountingService', keywords: ['tax preparation', 'accounting', 'CPA', 'bookkeeping', 'NYC accountant'], descriptionTemplate: 'providing tax and accounting services in NYC' },
  'Tech Repair': { schemaType: 'LocalBusiness', keywords: ['tech repair', 'phone repair', 'computer repair', 'electronics repair', 'NYC tech repair'], descriptionTemplate: 'providing tech repair services in NYC' },
  'Therapist': { schemaType: 'LocalBusiness', keywords: ['therapist', 'therapy', 'counseling', 'mental health', 'NYC therapist'], descriptionTemplate: 'providing therapy services in NYC' },
  'Tutor': { schemaType: 'LocalBusiness', keywords: ['tutor', 'tutoring', 'academic help', 'test prep', 'NYC tutor'], descriptionTemplate: 'providing tutoring services in NYC' },
  'Veterinarian': { schemaType: 'VeterinaryCare', keywords: ['veterinarian', 'vet', 'animal hospital', 'pet doctor', 'NYC vet'], descriptionTemplate: 'providing veterinary care in NYC' },
  'Videographer': { schemaType: 'LocalBusiness', keywords: ['videographer', 'video production', 'filming', 'video editing', 'NYC videographer'], descriptionTemplate: 'providing video production services in NYC' },
  'Web Developer': { schemaType: 'LocalBusiness', keywords: ['web developer', 'web design', 'website development', 'web agency', 'NYC web developer'], descriptionTemplate: 'providing web development services in NYC' },
  'Yoga Studio': { schemaType: 'ExerciseGym', keywords: ['yoga studio', 'yoga', 'yoga classes', 'meditation', 'NYC yoga'], descriptionTemplate: 'offering yoga classes in NYC' },
  'Other': { schemaType: 'LocalBusiness', keywords: ['local business', 'NYC business', 'New York business'], descriptionTemplate: 'serving customers in NYC' },
}

export function getCategorySeo(category: string | null): CategorySeo {
  if (!category) return CATEGORY_SEO_MAP['Other']
  return CATEGORY_SEO_MAP[category] || CATEGORY_SEO_MAP['Other']
}

// ─── Helpers ───

export function jsonLdScript(schema: Record<string, unknown> | Record<string, unknown>[]) {
  const schemas = Array.isArray(schema) ? schema : [schema]
  return schemas.map(s => JSON.stringify(s))
}

export { SITE_NAME, SITE_URL }
