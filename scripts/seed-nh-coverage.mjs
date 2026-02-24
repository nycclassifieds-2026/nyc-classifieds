#!/usr/bin/env node
/**
 * Neighborhood × Category coverage backfill.
 *
 * Ensures every (neighborhood, category) page has at least 3 listings.
 * Uses the same generic templates as seed-coverage.mjs but targets
 * geographic gaps instead of subcategory gaps.
 *
 * Run: node scripts/seed-nh-coverage.mjs
 */

const SUPABASE_URL = 'https://vpeozixllzdwzqniopfn.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZW96aXhsbHpkd3pxbmlvcGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY3MTQwNiwiZXhwIjoyMDg2MjQ3NDA2fQ.U9w4ZqhUiFDHTjH4taLGfH5Y9a2trsEH-BqLV__znq0'

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal',
}

const TARGET_PER_PAGE = 3

// ─── Helpers ───
function pick(a) { return a[Math.floor(Math.random() * a.length)] }
function rb(a, b) { return a + Math.floor(Math.random() * (b - a + 1)) }
function nhName(s) { return s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }
function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }
function fill(s, v) { return s.replace(/\{(\w+)\}/g, (_, k) => v[k] || k) }

// ─── Geography ───
const BOROUGHS = {
  manhattan:       { lat: 40.7831, lng: -73.9712, nhs: ['alphabet-city','battery-park-city','carnegie-hill','chelsea','chinatown','east-harlem','east-village','financial-district','flatiron','gramercy','greenwich-village','hamilton-heights','harlem','hells-kitchen','hudson-yards','inwood','kips-bay','koreatown','lenox-hill','lincoln-square','little-italy','lower-east-side','manhattan-valley','meatpacking-district','midtown-east','midtown-west','morningside-heights','murray-hill','noho','nolita','roosevelt-island','soho','stuyvesant-town','sugar-hill','times-square','tribeca','two-bridges','upper-east-side','upper-west-side','washington-heights','west-village'] },
  brooklyn:        { lat: 40.6782, lng: -73.9442, nhs: ['bay-ridge','bed-stuy','bensonhurst','boerum-hill','borough-park','brighton-beach','brooklyn-heights','brownsville','bushwick','canarsie','carroll-gardens','clinton-hill','cobble-hill','coney-island','crown-heights','downtown-brooklyn','dumbo','dyker-heights','east-new-york','flatbush','fort-greene','greenpoint','kensington','midwood','park-slope','prospect-heights','red-hook','sheepshead-bay','sunset-park','williamsburg'] },
  queens:          { lat: 40.7282, lng: -73.7949, nhs: ['astoria','bayside','bellerose','briarwood','college-point','corona','douglaston','elmhurst','far-rockaway','flushing','forest-hills','fresh-meadows','glen-oaks','howard-beach','jackson-heights','jamaica','kew-gardens','little-neck','long-island-city','maspeth','middle-village','ozone-park','rego-park','ridgewood','rockaway-beach','st-albans','sunnyside','whitestone','woodhaven','woodside'] },
  bronx:           { lat: 40.8448, lng: -73.8648, nhs: ['belmont','concourse','fordham','highbridge','hunts-point','kingsbridge','morris-park','mott-haven','norwood','pelham-bay','riverdale','south-bronx','throgs-neck','tremont','wakefield'] },
  'staten-island': { lat: 40.5795, lng: -74.1502, nhs: ['annadale','eltingville','great-kills','huguenot','new-dorp','princes-bay','st-george','stapleton','tompkinsville','tottenville'] },
}

const STREETS = ['1st Ave','2nd Ave','3rd Ave','Broadway','Lexington Ave','Madison Ave','Park Ave','Amsterdam Ave','Columbus Ave','5th Ave','6th Ave','7th Ave','8th Ave','Atlantic Ave','Flatbush Ave','DeKalb Ave','Myrtle Ave','Bedford Ave','Grand St','Delancey St','Houston St','Bleecker St','14th St','23rd St','34th St','42nd St','57th St','72nd St','86th St','96th St','110th St','125th St','145th St','Fordham Rd','Tremont Ave','Ditmars Blvd','Steinway St','Jamaica Ave','Queens Blvd','Northern Blvd','Roosevelt Ave','Victory Blvd','Hylan Blvd']
const TRAINS = ['A','C','E','B','D','F','M','N','Q','R','W','1','2','3','4','5','6','7','G','J','Z','L']
const CITIES = ['Boston','Chicago','LA','Miami','Philly','DC','Atlanta','Portland','Denver','Seattle','Austin','San Francisco','Dallas','Nashville','Minneapolis','New Orleans','Pittsburgh','Baltimore']

const CATEGORY_SLUGS = ['housing','jobs','for-sale','services','gigs','community','tickets','pets','personals','barter','rentals','resumes']

// ─── Subcategories per category (for varied subcategory assignment) ───
const SUBCATEGORIES = {
  housing: ['apartments','apartments-wanted','co-working','for-sale-real-estate','parking-storage','real-estate-wanted','rooms-shared','sublets'],
  jobs: ['accounting-finance','admin-office','ai-machine-learning','construction','creative-media','customer-service','delivery-logistics','education-teaching','engineering','food-beverage','healthcare','legal','marketing-advertising','part-time','restaurant-hospitality','retail','sales','software-engineering','tech-engineering','trades-skilled-labor'],
  'for-sale': ['appliances','art-prints','baby-kids','bikes','books-media','cell-phones','clothing-accessories','electronics','free-stuff','furniture','gaming-consoles','home-decor','instruments','jewelry-watches','kitchen-dining','sneakers-streetwear','sporting-goods','vinyl-records','vintage-antiques'],
  services: ['appliance-repair','auto-repair','beauty-hair','cleaning','electrical','graphic-design','handyman','hvac-heating','moving-hauling','painting','personal-training','photography','plumbing','tutoring','web-app-dev'],
  gigs: ['bartending','catering-help','cleaning','delivery-runs','dog-walking','errand-running','event-setup','furniture-assembly','moving-help','pet-sitting','photography','tech-help'],
  community: ['events','groups','local-alerts','lost-found','neighborhood-questions','recommendations','volunteers'],
  tickets: ['broadway','comedy','concerts','festivals','resale','sports'],
  pets: ['adoption','dog-walking','grooming','lost-found-pets','pet-sitting'],
  personals: ['activity-partners','missed-connections','strictly-platonic'],
  barter: ['goods-for-goods','goods-for-skills','skills-for-skills'],
  rentals: ['cameras-gear','party-supplies','sports-equipment','tools-equipment'],
  resumes: ['accounting-finance','admin-office','creative-media','healthcare','marketing-advertising','retail','software-engineering','tech','trades-skilled-labor'],
}

// ─── Generic templates per category (same quality as seed-coverage.mjs) ───
const GENERIC_TEMPLATES = {
  jobs: [
    { t: 'Hiring in {nh} — great opportunity', d: 'We are looking to fill a position at our company in {nh}. This is a great opportunity for someone with experience who wants to work with a team that actually values its people. Competitive salary based on experience, health insurance after 90 days, and a work environment where you are treated like a professional not a number. We have been in business for over 10 years and we are growing. If you are reliable, skilled, and want to be somewhere long-term, we want to hear from you. Apply by sending your resume and a brief intro about yourself' },
    { t: 'Immediate opening — {nh} area', d: 'Immediate opening for a role in {nh}. We need someone who can start within the next two weeks and hit the ground running. Experience is preferred but we are willing to train the right person who shows initiative and has a good attitude. Full-time position, Monday through Friday, with some flexibility on hours. Pay is competitive for the market and depends on what you bring to the table. We are a small team where everyone matters and your work actually has an impact. Come meet us and see if its a fit' },
    { t: 'Now hiring — {nh}, near {train} train', d: 'Looking for an experienced professional to join our team near {street} in {nh}. This is a real opportunity with a company that has been operating in NYC for years. We offer competitive pay, benefits, and most importantly a workplace where people actually enjoy coming in. The right candidate has at least 2 years of relevant experience and can work independently. Interview process is simple — come in, meet the team, show us what you know. We dont do 5-round interviews here' },
  ],
  'for-sale': [
    { t: 'Great condition — pickup in {nh}', d: 'Selling in great condition. I have taken good care of it and it works exactly as it should. The reason Im selling is simple — I either dont need it anymore or Im upgrading and this one deserves a new home where it will actually get used. Located in {nh} near {street}, you pick up. Cash, Venmo, or Zelle all work for me. Happy to send more photos or answer any questions. Price is fair for what youre getting and I am open to reasonable offers if you come ready to pick up' },
    { t: 'Moving sale — {nh}', d: 'Moving out of my apartment in {nh} and this needs a new home. It is in good shape and has served me well but I cant take everything with me. Would rather sell it to someone who needs it than have it end up on the sidewalk. You pick up from my building near {street}. Priced to sell because I need it gone before the end of the month. First come first served. Send me a message and I can get you more details and photos' },
    { t: 'Barely used — {nh}, near {train}', d: 'Selling something I barely used. Bought it with good intentions and then life happened and it has been sitting in my apartment taking up space. It is essentially in new condition with minimal signs of use. Located in {nh}, you pick up. Im pricing it well below what I paid because I just want it gone at this point. Can meet near the {train} station if that works better for you. Serious buyers please, I respond to messages quickly' },
  ],
  services: [
    { t: 'Professional services — {nh} area', d: 'Professional services available in {nh} and surrounding areas. I have been doing this work in NYC for years and my clients keep coming back which I think says more than any ad could. I take pride in doing quality work and I communicate clearly throughout the process — no surprises, no hidden fees, no ghosting after you pay. Free estimates available. Whether its a small job or something bigger, I treat every project like its my own home. Give me a call or send a message and lets figure out what you need' },
    { t: 'Affordable and reliable — {nh}', d: 'Quality services at prices that wont make you cry. Based in {nh} near {street} and serving all five boroughs. I keep my overhead low so I can pass the savings on to my clients instead of charging Manhattan rates for simple work. Fully licensed and insured. I show up on time, I do clean work, and I dont leave until youre satisfied. References available from clients in your neighborhood. Text or call me and I will get back to you the same day' },
    { t: 'Licensed professional — serving {nh}', d: 'Licensed and insured professional serving {nh} and the greater NYC area. Over 10 years of experience working in New York apartments, houses, and commercial spaces. I have seen every situation and I know how to handle it right the first time. My rates are fair and I am transparent about costs before any work begins. Same-day and emergency service available for urgent situations. Call or text anytime' },
  ],
  gigs: [
    { t: 'Quick gig — {nh}, paid same day', d: 'Looking for someone to help with a gig in {nh}. This is a straightforward job — show up, do good work, get paid same day in cash. Shouldnt take more than a few hours. I am easy to work with and I respect your time. Near {street} area. If youre reliable and available this week, send me a message with your availability. Can be a recurring thing if it goes well and you do good work' },
    { t: 'Help needed — {nh} area', d: 'Quick cash opportunity for work in {nh}. Paying above average because I value good help and I dont want to waste time finding someone twice. The job is simple and shouldnt take long. Cash payment at the end. Located near {street}, easy to get to from the {train}. If you are looking for some extra money this week and you are dependable, this is an easy gig. Message me and Ill give you all the details' },
    { t: 'Weekend gig — {nh}', d: 'Need someone for a gig this weekend in {nh}. A few hours of work, paying fairly for the time. I will explain exactly what needs to be done when you get here — nothing complicated, just need an extra pair of hands. Cash at the end of the job. Near {street}. Ive hired people through here before and its always been a good experience. Just show up when you say you will and do honest work' },
  ],
  community: [
    { t: 'Community update — {nh}', d: 'Posting this for the {nh} community. If you live in the area near {street} this is relevant to you. I have been in this neighborhood for years and I believe in looking out for each other. Please share this with your neighbors, building group chats, and anyone who might find it useful. The more connected we are as a neighborhood, the better {nh} gets for everyone. Feel free to reach out if you have questions or want to get involved' },
    { t: 'Neighbors of {nh} — check this out', d: 'Update for the {nh} community. I wanted to share this because I think its important for people in the neighborhood to know. We live in an incredible community and the more informed we are, the better decisions we can make together. Pass this along to your neighbors near {street} and beyond. This is what community is about — keeping each other in the loop and supporting one another' },
    { t: '{nh} community — get involved', d: 'Putting this out there for {nh} residents because not enough people know about it. Whether you have lived here for decades or just moved in last week, this affects our neighborhood. I am near {street} and happy to chat more with anyone who is interested. The community vibe in {nh} is one of the best things about living here and I want to help keep it that way. Reach out if you want to connect or contribute' },
  ],
  tickets: [
    { t: '2 tickets — cant make it, {nh}', d: 'Selling 2 tickets to an event that I unfortunately cant attend anymore. Work schedule changed at the last minute and there is no way to make it work. These are legitimate tickets purchased through an official vendor — I can show you the receipt and transfer them immediately through the app. Selling at face value because I am not a scalper, just someone who doesnt want good tickets going to waste. Can meet in {nh} or do a digital transfer' },
    { t: 'Tickets below face — {nh}', d: 'Two tickets to a great event, selling below face value because I just want them gone at this point. Plans fell through and these have been sitting in my account. Legit tickets, official purchase, will transfer through the platform so everything is safe and verified. Located in {nh}, happy to meet up or do it all digitally. These are good seats and you are getting a deal. First person to message me gets them' },
  ],
  pets: [
    { t: 'Pet lovers of {nh}', d: 'Reaching out to the {nh} community about pets. If you are a pet owner or animal lover in the area near {street}, this is for you. I take this seriously because our pets are family and they deserve the best care and attention we can give them. Located in {nh} near the {train}. Please reach out if you can help or if you have any information. Sharing this post with your neighbors would be incredibly appreciated' },
    { t: 'Pet community — {nh} area', d: 'Posting for pet people in the {nh} area. I am located near {street} and this is important to me. If you are a pet person in this neighborhood, please take a moment to read this and share it with others. The pet community in {nh} is wonderful — lets keep looking out for each other and our four-legged family members. DM me for more details' },
  ],
  personals: [
    { t: 'Looking to connect — {nh}', d: 'Putting myself out there because NYC is massive and sometimes you just have to make an effort instead of waiting for things to happen organically. I am a normal person with a job, hobbies, and a life. I live near {street} in {nh} and I am usually free on evenings and weekends. If this sounds like something you are interested in, send me a message and lets chat. No pressure, no expectations, just seeing if we click. Coffee first is always a good start' },
    { t: 'New to {nh} — looking for people', d: 'Recently moved to {nh} and looking to meet people. NYC has 8 million people and somehow its hard to meet the right ones. I live near {street} and I am open to whatever this turns into. If you are also looking to connect and you are in the area, reach out. I am laid back, easy to talk to, and genuinely just looking to meet good people in my neighborhood' },
  ],
  barter: [
    { t: 'Trade in {nh}', d: 'Looking for an exchange in {nh}. I believe in the power of trading — its how communities used to work and honestly it makes more sense than everything being about money all the time. I have something to offer and I am looking for something in return that has equivalent value. Located near {street}, happy to meet and discuss. Open to creative proposals because sometimes the best trades are the ones you didnt expect. Message me with what you have and what you need' },
    { t: 'Swap — {nh} area', d: 'Interested in a swap with someone in {nh} or nearby. I think barter is underrated in this city — there are so many talented people with things to offer and we should be connecting more often. Everything I am offering is in good condition and I expect the same in return. Fair trade, no games. Near {street}. Lets talk about what you have and what you need and see if we can make something work' },
  ],
  rentals: [
    { t: 'Available to rent — {nh}', d: 'Renting out equipment for anyone who needs it temporarily. Located in {nh} near {street}. I keep everything in excellent working condition. Rates are fair and flexible — daily, weekend, or weekly depending on what you need. ID deposit required which you get back in full when the item is returned in the same condition. Message me to reserve a date' },
    { t: 'Rent instead of buy — {nh}', d: 'Have items available for rent in {nh}. Why buy something you only need once or twice when you can rent it for a fraction of the price? Everything is well-maintained and ready to go. Pick up and drop off near {street}. Flexible on timing. Reasonable rates and I am easy to work with. DM for pricing and availability' },
  ],
  resumes: [
    { t: 'Professional seeking opportunities — {nh}', d: 'Experienced professional based in {nh} looking for new opportunities. I have built my career through dedication, continuous learning, and a genuine passion for this work. My experience spans multiple companies and environments, giving me a well-rounded perspective. Open to full-time, contract, or freelance arrangements. Based in {nh} but willing to commute anywhere in the city or work remote. Portfolio, references, and resume available on request' },
    { t: 'Available immediately — {nh} based', d: 'Available immediately for roles in NYC. Years of relevant experience and a strong track record of delivering results. What I bring is not just technical ability but also reliability, communication skills, and work ethic. Happy to discuss my background over coffee or a call. Based in {nh} near {street} but flexible on location. Lets talk' },
  ],
  housing: [
    { t: 'Housing opportunity — {nh}', d: 'Available housing opportunity in {nh} near {street}. This is a legitimate listing from a real person, not a broker trying to collect a fee. The location is great — close to the {train} train, surrounded by restaurants and shops, and the neighborhood has a genuinely welcoming vibe. Reach out for more details, photos, and to schedule a viewing. Serious inquiries only please' },
    { t: '{nh} — near {train} train', d: 'Housing available in {nh}, walking distance to the {train} train and close to everything you could need. The area around {street} has great food, a grocery store, laundromat, and a park nearby. What you see is what you get, no bait and switch. Hit me up to schedule a time to see it. Looking for someone responsible and respectful' },
  ],
}

// ─── Supabase insert ───
async function supaInsert(table, rows) {
  const batchSize = 50
  let inserted = 0
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST', headers, body: JSON.stringify(batch),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error(`  ERR batch ${Math.floor(i / batchSize)}: ${err.slice(0, 200)}`)
      continue
    }
    inserted += batch.length
  }
  return inserted
}

// ─── Staggered timestamp ───
function staggeredTimestamp(daysAgo) {
  const now = new Date()
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  day.setDate(day.getDate() - daysAgo)
  const hour = rb(7, 22)
  const min = rb(0, 59)
  const sec = rb(0, 59)
  return new Date(day.getTime() + hour * 3600000 + min * 60000 + sec * 1000).toISOString()
}

// ─── Main ───
async function main() {
  console.log('=== Neighborhood × Category Coverage Backfill ===\n')
  console.log(`Target: ${TARGET_PER_PAGE} listings per (neighborhood, category) page\n`)

  // 1. Fetch seed users
  console.log('Fetching seed users...')
  const usersRes = await fetch(
    `${SUPABASE_URL}/rest/v1/users?email=like.*%40example.com&verified=eq.true&select=id,name,email&limit=500`,
    { headers }
  )
  const seedUsers = await usersRes.json()
  console.log(`  Found ${seedUsers.length} seed users`)
  if (seedUsers.length === 0) {
    console.error('No seed users. Run seed setup first.')
    process.exit(1)
  }

  // 2. Fetch ALL existing listings with location + category (paginate to avoid 1000-row limit)
  console.log('\nFetching existing listings...')
  let allExisting = []
  let offset = 0
  const pageSize = 1000
  while (true) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/listings?select=location,category_slug&status=eq.active&limit=${pageSize}&offset=${offset}`,
      { headers }
    )
    const batch = await res.json()
    if (!Array.isArray(batch) || batch.length === 0) break
    allExisting = allExisting.concat(batch)
    if (batch.length < pageSize) break
    offset += pageSize
  }
  console.log(`  Fetched ${allExisting.length} active listings`)

  // 3. Build coverage map: "borough:nh:category" → count
  const coverage = {}
  for (const row of allExisting) {
    if (!row.location) continue
    // location format: "Neighborhood Name, Borough Name"
    const parts = row.location.split(',').map(s => s.trim())
    if (parts.length < 2) continue
    const nhPart = slugify(parts[0])
    const boroughPart = slugify(parts[1])
    const key = `${boroughPart}:${nhPart}:${row.category_slug}`
    coverage[key] = (coverage[key] || 0) + 1
  }

  // 4. Find all gaps
  let totalNeeded = 0
  let blankPages = 0
  let underPages = 0
  const gaps = []

  for (const [borough, bData] of Object.entries(BOROUGHS)) {
    for (const nh of bData.nhs) {
      for (const cat of CATEGORY_SLUGS) {
        const key = `${borough}:${nh}:${cat}`
        const have = coverage[key] || 0
        const need = Math.max(0, TARGET_PER_PAGE - have)
        if (need > 0) {
          gaps.push({ borough, nh, cat, have, need })
          totalNeeded += need
          if (have === 0) blankPages++
          else underPages++
        }
      }
    }
  }

  const totalCombos = Object.values(BOROUGHS).reduce((s, b) => s + b.nhs.length, 0) * CATEGORY_SLUGS.length
  console.log(`\n  ${totalCombos} total (neighborhood, category) combos`)
  console.log(`  ${blankPages} completely blank pages`)
  console.log(`  ${underPages} pages with 1-${TARGET_PER_PAGE - 1} listings`)
  console.log(`  ${totalCombos - blankPages - underPages} pages already have ${TARGET_PER_PAGE}+ listings`)
  console.log(`  ${totalNeeded} total listings to create\n`)

  if (totalNeeded === 0) {
    console.log('All pages already covered! Nothing to do.')
    return
  }

  // 5. Generate listings
  console.log('Generating listings...')
  const allListings = []
  let templateIdx = 0

  for (const { borough, nh, cat, need } of gaps) {
    const templates = GENERIC_TEMPLATES[cat]
    if (!templates) continue

    const bData = BOROUGHS[borough]
    const subs = SUBCATEGORIES[cat] || ['general']

    for (let i = 0; i < need; i++) {
      const user = pick(seedUsers)
      const tmpl = templates[(templateIdx++) % templates.length]
      const sub = subs[rb(0, subs.length - 1)]

      const vars = {
        nh: nhName(nh),
        street: pick(STREETS),
        train: pick(TRAINS),
        city: pick(CITIES),
      }

      const lat = bData.lat + (Math.random() - 0.5) * 0.02
      const lng = bData.lng + (Math.random() - 0.5) * 0.02
      const location = `${nhName(nh)}, ${nhName(borough)}`

      // Price varies by category
      let price = null
      if (cat === 'for-sale') price = rb(1500, 50000) // $15 to $500
      else if (cat === 'housing') price = rb(100000, 400000) // $1000 to $4000
      else if (cat === 'rentals') price = rb(2000, 15000)
      else if (cat === 'tickets') price = rb(3000, 25000)

      allListings.push({
        user_id: user.id,
        title: fill(tmpl.t, vars).slice(0, 200),
        description: fill(tmpl.d, vars).slice(0, 4000),
        price,
        category_slug: cat,
        subcategory_slug: sub,
        images: [],
        location,
        lat,
        lng,
        status: 'active',
        expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
        created_at: staggeredTimestamp(rb(0, 14)),
      })
    }
  }

  console.log(`  Generated ${allListings.length} listings`)

  // 6. Insert
  console.log('  Inserting...')
  const inserted = await supaInsert('listings', allListings)
  console.log(`  Inserted ${inserted} listings\n`)

  // 7. Summary
  const byBorough = {}
  const byCat = {}
  for (const l of allListings) {
    const b = l.location.split(',')[1]?.trim() || 'unknown'
    byBorough[b] = (byBorough[b] || 0) + 1
    byCat[l.category_slug] = (byCat[l.category_slug] || 0) + 1
  }

  console.log('=== Neighborhood Coverage Backfill Complete ===')
  console.log(`  Total inserted: ${inserted}`)
  console.log(`  Blank pages filled: ${blankPages}`)
  console.log(`  Under-${TARGET_PER_PAGE} pages topped up: ${underPages}`)
  console.log('\n  By borough:')
  for (const [b, count] of Object.entries(byBorough).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${b}: ${count}`)
  }
  console.log('\n  By category:')
  for (const [c, count] of Object.entries(byCat).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${c}: ${count}`)
  }
}

main().catch(err => { console.error(err); process.exit(1) })
