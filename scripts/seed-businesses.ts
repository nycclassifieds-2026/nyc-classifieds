import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
  process.env.SUPABASE_SERVICE_KEY!.trim()
)

const businesses = [
  { name: "Mario's Plumbing", cat: 'Plumber', desc: 'Licensed NYC plumber. Emergency repairs, bathroom renovations, and pipe installations. 24/7 service available.', area: ['Park Slope', 'Carroll Gardens', 'Cobble Hill'], phone: '(718) 555-0101', web: 'https://marioplumbing.nyc' },
  { name: 'Brooklyn Bakes', cat: 'Bakery', desc: 'Artisan breads, pastries, and custom cakes baked fresh daily. Wedding cakes our specialty.', area: ['Williamsburg', 'Greenpoint', 'Bushwick'], phone: '(718) 555-0102', web: 'https://brooklynbakes.com' },
  { name: 'Casa Bonita Restaurant', cat: 'Restaurant', desc: 'Authentic Mexican cuisine in the heart of East Harlem. Family recipes passed down three generations.', area: ['East Harlem', 'Harlem', 'Morningside Heights'], phone: '(212) 555-0103', web: '' },
  { name: 'Precise Electric NYC', cat: 'Electrician', desc: 'Commercial and residential electrical work. Licensed, bonded, insured. Panel upgrades, rewiring, smart home installation.', area: ['Astoria', 'Long Island City', 'Sunnyside'], phone: '(718) 555-0104', web: 'https://preciseelectricnyc.com' },
  { name: 'Glow Up Beauty Salon', cat: 'Beauty Salon', desc: 'Full-service beauty salon. Hair, nails, facials, and waxing. Walk-ins welcome.', area: ['Flatbush', 'Crown Heights', 'Prospect Heights'], phone: '(718) 555-0105', web: '' },
  { name: 'Downtown Dog Walkers', cat: 'Dog Walker', desc: 'Professional dog walking and pet sitting in lower Manhattan. GPS-tracked walks, daily photo updates.', area: ['Financial District', 'Tribeca', 'Battery Park City'], phone: '(212) 555-0106', web: 'https://downtowndogwalkers.com' },
  { name: 'Kim\'s Dry Cleaning', cat: 'Dry Cleaner', desc: 'Expert dry cleaning and alterations. Same-day service available. Free pickup and delivery.', area: ['Upper East Side', 'Lenox Hill', 'Carnegie Hill'], phone: '(212) 555-0107', web: '' },
  { name: 'Fresh Start Cleaning Co', cat: 'Cleaning Service', desc: 'Residential and commercial cleaning. Deep cleaning, move-in/move-out, regular maintenance. Eco-friendly products.', area: ['Chelsea', 'Flatiron', 'Gramercy'], phone: '(212) 555-0108', web: 'https://freshstartnyc.com' },
  { name: 'Tony\'s Auto Repair', cat: 'Auto Shop', desc: 'Full-service auto shop. Oil changes, brake repair, engine diagnostics. Honest pricing, no surprises.', area: ['Bay Ridge', 'Dyker Heights', 'Bensonhurst'], phone: '(718) 555-0109', web: '' },
  { name: 'Bronx Fitness Studio', cat: 'Fitness Studio', desc: 'Group classes and personal training. HIIT, yoga, boxing, spinning. First class free.', area: ['Mott Haven', 'South Bronx', 'Concourse'], phone: '(718) 555-0110', web: 'https://bronxfitness.com' },
  { name: 'East Village Tattoo', cat: 'Tattoo Studio', desc: 'Custom tattoos and piercings. Award-winning artists. Walk-ins and appointments. Clean, professional studio.', area: ['East Village', 'Lower East Side', 'Alphabet City'], phone: '(212) 555-0111', web: 'https://evtattoo.com' },
  { name: 'Queens Landscaping', cat: 'Landscaping', desc: 'Lawn care, garden design, tree trimming, and snow removal. Residential and commercial properties.', area: ['Bayside', 'Flushing', 'Fresh Meadows'], phone: '(718) 555-0112', web: '' },
  { name: 'Harlem Barbershop', cat: 'Barbershop', desc: 'Classic cuts and modern styles. Hot towel shaves. Appointments and walk-ins. The neighborhood barbershop since 2005.', area: ['Harlem', 'Hamilton Heights', 'Sugar Hill'], phone: '(212) 555-0113', web: '' },
  { name: 'SoHo Yoga Studio', cat: 'Yoga Studio', desc: 'Vinyasa, Hatha, and hot yoga classes. Beginner-friendly. Private sessions available. Rooftop classes in summer.', area: ['SoHo', 'NoHo', 'Nolita'], phone: '(212) 555-0114', web: 'https://sohoyoga.com' },
  { name: 'Rivera Law Firm', cat: 'Law Firm', desc: 'Immigration, family law, and personal injury. Free consultations. Se habla Espanol. Serving all five boroughs.', area: ['Jackson Heights', 'Corona', 'Elmhurst'], phone: '(718) 555-0115', web: 'https://riveralaw.nyc' },
  { name: 'Sunset Park Grocery', cat: 'Grocery Store', desc: 'Fresh produce, international foods, and everyday essentials. Serving the community for over 20 years.', area: ['Sunset Park', 'Borough Park', 'Kensington'], phone: '(718) 555-0116', web: '' },
  { name: 'NYC Moving Pros', cat: 'Moving Company', desc: 'Local and long-distance moves. Packing services, storage solutions. Licensed and insured. Free estimates.', area: ['Midtown East', 'Midtown West', 'Murray Hill', 'Kips Bay'], phone: '(212) 555-0117', web: 'https://nycmovingpros.com' },
  { name: 'Pixel Perfect Design', cat: 'Graphic Designer', desc: 'Logo design, branding, marketing materials, and social media graphics. Quick turnaround, competitive rates.', area: ['DUMBO', 'Downtown Brooklyn', 'Brooklyn Heights'], phone: '(718) 555-0118', web: 'https://pixelperfectnyc.com' },
  { name: 'Island Pest Control', cat: 'Pest Control', desc: 'Rodent, roach, bed bug, and termite treatment. Same-day emergency service. EPA-approved methods.', area: ['St. George', 'Stapleton', 'Tompkinsville'], phone: '(718) 555-0119', web: 'https://islandpestcontrol.com' },
  { name: 'Chef\'s Table Catering', cat: 'Catering', desc: 'Event catering for weddings, corporate events, and private parties. Custom menus. 10-500 guests.', area: ['Upper West Side', 'Lincoln Square', 'Manhattan Valley'], phone: '(212) 555-0120', web: 'https://chefstablenyc.com' },
  { name: 'Fix-It Handyman Services', cat: 'Handyman', desc: 'No job too small. Furniture assembly, drywall repair, painting, mounting. Same-day availability.', area: ['Bed-Stuy', 'Clinton Hill', 'Fort Greene'], phone: '(718) 555-0121', web: '' },
  { name: 'Riverdale Pet Grooming', cat: 'Pet Grooming', desc: 'Full grooming services for dogs and cats. Bathing, haircuts, nail trimming. Gentle handling guaranteed.', area: ['Riverdale', 'Kingsbridge', 'Norwood'], phone: '(718) 555-0122', web: '' },
  { name: 'LIC Photography', cat: 'Photographer', desc: 'Portraits, events, headshots, and real estate photography. Studio and on-location shoots across NYC.', area: ['Long Island City', 'Astoria', 'Sunnyside'], phone: '(718) 555-0123', web: 'https://licphoto.com' },
  { name: 'Murray Hill Tax & Accounting', cat: 'Tax & Accounting', desc: 'Personal and business tax prep, bookkeeping, payroll. CPA on staff. Year-round service.', area: ['Murray Hill', 'Kips Bay', 'Gramercy'], phone: '(212) 555-0124', web: 'https://murrayhilltax.com' },
  { name: 'Village Locksmith', cat: 'Locksmith', desc: '24/7 emergency lockout service. Lock changes, key duplication, safe installation. Fast response time.', area: ['West Village', 'Greenwich Village', 'Chelsea'], phone: '(212) 555-0125', web: '' },
  { name: 'Flushing Dental Care', cat: 'Dental Office', desc: 'General and cosmetic dentistry. Cleanings, fillings, crowns, implants. Most insurance accepted. Evening hours.', area: ['Flushing', 'Whitestone', 'College Point'], phone: '(718) 555-0126', web: 'https://flushingdental.com' },
  { name: 'BK Music Studio', cat: 'Music Studio', desc: 'Recording studio and rehearsal space. Music lessons for all ages. Guitar, piano, drums, vocals.', area: ['Bushwick', 'Ridgewood', 'Williamsburg'], phone: '(718) 555-0127', web: 'https://bkmusicstudio.com' },
  { name: 'Heights Real Estate', cat: 'Real Estate', desc: 'Residential sales and rentals in Washington Heights, Inwood, and Hamilton Heights. Local expertise since 2010.', area: ['Washington Heights', 'Inwood', 'Hamilton Heights'], phone: '(212) 555-0128', web: 'https://heightsrealestate.nyc' },
  { name: 'Astoria Florist', cat: 'Florist', desc: 'Fresh flowers for every occasion. Custom arrangements, wedding flowers, and weekly subscriptions. Same-day delivery.', area: ['Astoria', 'Long Island City', 'Woodside'], phone: '(718) 555-0129', web: '' },
  { name: 'Secure Shield Security', cat: 'Security', desc: 'Security guards, camera installation, and alarm systems for residential and commercial properties.', area: ['Midtown East', 'Midtown West', 'Times Square'], phone: '(212) 555-0130', web: 'https://secureshieldnyc.com' },
  { name: 'Little Italy Tailor', cat: 'Tailor', desc: 'Expert alterations and custom tailoring. Suits, dresses, leather. Rush service available.', area: ['Little Italy', 'Nolita', 'Chinatown'], phone: '(212) 555-0131', web: '' },
  { name: 'Green Thumb Plant Care', cat: 'Cleaning Service', desc: 'Indoor plant care and maintenance for offices and homes. Plant selection, watering schedules, pest treatment.', area: ['Williamsburg', 'Greenpoint', 'DUMBO'], phone: '(718) 555-0132', web: 'https://greenthumbnyc.com' },
  { name: 'Fordham Pharmacy', cat: 'Pharmacy', desc: 'Independent pharmacy serving the Bronx. Prescription filling, OTC meds, health consultations. Free delivery.', area: ['Fordham', 'Belmont', 'Tremont'], phone: '(718) 555-0133', web: '' },
  { name: 'NYC Notary Express', cat: 'Notary', desc: 'Mobile notary public serving all five boroughs. Real estate closings, affidavits, power of attorney. Available 7 days.', area: ['Financial District', 'Tribeca', 'SoHo', 'Chinatown'], phone: '(212) 555-0134', web: 'https://nycnotaryexpress.com' },
  { name: 'Crown Heights Childcare', cat: 'Childcare', desc: 'Licensed home daycare for ages 6 weeks to 5 years. Nurturing environment, structured activities, healthy meals.', area: ['Crown Heights', 'Prospect Heights', 'Flatbush'], phone: '(718) 555-0135', web: '' },
  { name: 'Bay Ridge Jewelry', cat: 'Jewelry Store', desc: 'Custom jewelry, engagement rings, watch repair. GIA-certified diamonds. Buy, sell, and trade gold.', area: ['Bay Ridge', 'Dyker Heights', 'Bensonhurst'], phone: '(718) 555-0136', web: 'https://bayridgejewelry.com' },
  { name: 'Upper East Massage & Spa', cat: 'Massage & Spa', desc: 'Swedish, deep tissue, and hot stone massage. Facials, body wraps. Couples packages available.', area: ['Upper East Side', 'Lenox Hill', 'Carnegie Hill'], phone: '(212) 555-0137', web: 'https://uesmassage.com' },
  { name: 'Rooftop Web Development', cat: 'Web Developer', desc: 'Custom websites, e-commerce, and web apps for NYC small businesses. WordPress, Shopify, and custom builds.', area: ['Chelsea', 'Hudson Yards', 'Flatiron'], phone: '(212) 555-0138', web: 'https://rooftopwebdev.com' },
  { name: 'Jackson Heights Insurance', cat: 'Insurance', desc: 'Auto, home, life, and business insurance. Multiple carriers, competitive quotes. Multilingual staff.', area: ['Jackson Heights', 'Elmhurst', 'Corona'], phone: '(718) 555-0139', web: 'https://jhinsurance.com' },
  { name: 'South Bronx Boxing Gym', cat: 'Gym', desc: 'Boxing, MMA, and strength training. Youth programs. Personal training available. First week free.', area: ['South Bronx', 'Mott Haven', 'Hunts Point'], phone: '(718) 555-0140', web: '' },
  { name: 'Williamsburg Interior Design', cat: 'Interior Designer', desc: 'Residential and commercial interior design. Space planning, furniture sourcing, full renovations.', area: ['Williamsburg', 'Greenpoint', 'Bushwick'], phone: '(718) 555-0141', web: 'https://wburginteriors.com' },
  { name: 'Café Córdoba', cat: 'Cafe', desc: 'Specialty coffee, fresh pastries, and light bites. Cozy workspace with free WiFi. Open early to late.', area: ['Red Hook', 'Carroll Gardens', 'Cobble Hill'], phone: '(718) 555-0142', web: '' },
  { name: 'Pelham Bay Veterinarian', cat: 'Veterinarian', desc: 'Full-service animal hospital. Wellness exams, vaccinations, surgery, and dental care. Emergency walk-ins accepted.', area: ['Pelham Bay', 'Morris Park', 'Throgs Neck'], phone: '(718) 555-0143', web: 'https://pelhambayvet.com' },
  { name: 'Print Shop NYC', cat: 'Printing Shop', desc: 'Business cards, flyers, banners, and large format printing. Rush orders welcome. Graphic design services included.', area: ['Midtown West', 'Hell\'s Kitchen', 'Times Square'], phone: '(212) 555-0144', web: 'https://printshopnyc.com' },
  { name: 'Rego Park Tutoring Center', cat: 'Tutor', desc: 'K-12 tutoring in math, science, English, and test prep. SAT/ACT specialists. In-person and online options.', area: ['Rego Park', 'Forest Hills', 'Kew Gardens'], phone: '(718) 555-0145', web: 'https://regoparktutor.com' },
  { name: 'Staten Island Roofing', cat: 'Roofing', desc: 'Roof repair, replacement, and inspection. Flat roofs, shingles, and gutters. Free estimates. Licensed and insured.', area: ['New Dorp', 'Great Kills', 'Eltingville'], phone: '(718) 555-0146', web: 'https://siroofing.com' },
  { name: 'Nolita Clothing Boutique', cat: 'Clothing Store', desc: 'Curated women\'s clothing and accessories from independent designers. Vintage finds and new arrivals weekly.', area: ['Nolita', 'SoHo', 'Little Italy'], phone: '(212) 555-0147', web: 'https://nolitaboutique.com' },
  { name: 'Inwood Painting Co', cat: 'Painter', desc: 'Interior and exterior painting. Residential and commercial. Color consultation, wallpaper installation. Neat, on-time, on-budget.', area: ['Inwood', 'Washington Heights', 'Hamilton Heights'], phone: '(212) 555-0148', web: '' },
  { name: 'Forest Hills Event Planning', cat: 'Event Planner', desc: 'Weddings, corporate events, birthdays, and bar mitzvahs. Full planning or day-of coordination. Queens and beyond.', area: ['Forest Hills', 'Rego Park', 'Kew Gardens'], phone: '(718) 555-0149', web: 'https://fhevents.com' },
  { name: 'Sunnyside Laundromat', cat: 'Laundromat', desc: 'Self-service and drop-off laundry. Wash, dry, fold service. Clean machines, free WiFi. Open 6am to midnight.', area: ['Sunnyside', 'Woodside', 'Maspeth'], phone: '(718) 555-0150', web: '' },
]

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

async function seed() {
  console.log('Seeding 50 businesses...')

  for (let i = 0; i < businesses.length; i++) {
    const b = businesses[i]
    const email = `biz${i + 1}@seed.nycclassifieds.com`
    const slug = slugify(b.name)

    const { error } = await supabase.from('users').insert({
      email,
      name: b.name,
      account_type: 'business',
      business_name: b.name,
      business_slug: slug,
      business_category: b.cat,
      business_description: b.desc,
      service_area: b.area,
      phone: b.phone,
      website: b.web || null,
      verified: i < 20, // first 20 are verified
    })

    if (error) {
      console.error(`Failed to insert ${b.name}:`, error.message)
    } else {
      console.log(`  [${i + 1}/50] ${b.name}`)
    }
  }

  console.log('Done!')
}

seed()
