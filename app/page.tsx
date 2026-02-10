import { boroughs, categories } from '@/lib/data'
import { websiteSchema, organizationSchema, faqSchema, collectionPageSchema } from '@/lib/seo'
import HomeSearch from './components/HomeSearch'
import BoroughNav from './components/BoroughNav'
import HomeCategoryGrid from './components/HomeCategoryGrid'

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
    faqSchema([
      { question: 'What is The NYC Classifieds?', answer: 'The NYC Classifieds is a free, local classifieds platform for New York City. Every user is geo-verified with a live photo at their address, ensuring all listings are from real New Yorkers.' },
      { question: 'Is it free to post on NYC Classifieds?', answer: 'Yes, posting on NYC Classifieds is completely free. You can list items for sale, housing, jobs, services, gigs, and more at no cost.' },
      { question: 'How does verification work?', answer: 'During signup you take a live selfie while at your NYC address. We verify your GPS location matches your registered address within 50 feet, proving you actually live or work there.' },
      { question: 'What boroughs does NYC Classifieds cover?', answer: 'NYC Classifieds covers all five NYC boroughs: Manhattan, Brooklyn, Queens, the Bronx, and Staten Island, with 126+ neighborhoods across the city.' },
      { question: 'Can businesses use NYC Classifieds?', answer: 'Yes. Businesses get a free profile page with their hours, website, phone number, service area, and photo gallery. Business profiles are required to post in the Services category.' },
      { question: 'What categories are available?', answer: 'NYC Classifieds has 12 categories: Housing, Jobs, For Sale, Services, Gigs, Community, Tickets & Events, Pets, Personals, Barter, Rentals & Lending, and Resumes.' },
    ]),
  ]

  return (
    <main style={{ maxWidth: '1050px', margin: '0 auto', padding: '12px 24px 32px' }}>
      {/* JSON-LD structured data */}
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      {/* Search + boroughs */}
      <section style={{ padding: '8px 0 0' }}>
        <h1 className="sr-only">Free Classifieds in New York City — Housing, Jobs, Services, For Sale & More</h1>
        <div style={{ marginBottom: '12px' }}>
          <HomeSearch />
        </div>
        <BoroughNav />
      </section>

      {/* Categories — localized when home is set */}
      <HomeCategoryGrid />
    </main>
  )
}
