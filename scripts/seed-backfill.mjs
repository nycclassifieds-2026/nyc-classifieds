#!/usr/bin/env node
/**
 * Backfill script — generates 30-60 days of historical content.
 * Creates 4,000+ listings + 2,500+ porch posts with growth curve.
 * Personals weighted HEAVY (~25% of all listings).
 *
 * Run: node scripts/seed-backfill.mjs
 */

const SUPABASE_URL = 'https://vpeozixllzdwzqniopfn.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZW96aXhsbHpkd3pxbmlvcGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY3MTQwNiwiZXhwIjoyMDg2MjQ3NDA2fQ.U9w4ZqhUiFDHTjH4taLGfH5Y9a2trsEH-BqLV__znq0'

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal',
}

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
      console.error(`  ERR ${table} batch ${Math.floor(i/batchSize)}: ${err.slice(0,200)}`)
      continue
    }
    inserted += batch.length
    if (i % 200 === 0 && i > 0) process.stdout.write(` ${inserted}...`)
  }
  return inserted
}

// ─── Helpers ───
function pick(a) { return a[Math.floor(Math.random()*a.length)] }
function rb(a,b) { return a+Math.floor(Math.random()*(b-a+1)) }
function nhName(s) { return s.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) }
function fill(s, v) { return s.replace(/\{(\w+)\}/g, (_, k) => v[k] || k) }

// ─── Geography ───
const BOROUGHS = {
  manhattan:      { lat:40.7831, lng:-73.9712, nhs:['alphabet-city','battery-park-city','carnegie-hill','chelsea','chinatown','east-harlem','east-village','financial-district','flatiron','gramercy','greenwich-village','hamilton-heights','harlem','hells-kitchen','hudson-yards','inwood','kips-bay','koreatown','lenox-hill','lincoln-square','little-italy','lower-east-side','manhattan-valley','meatpacking-district','midtown-east','midtown-west','morningside-heights','murray-hill','noho','nolita','roosevelt-island','soho','stuyvesant-town','sugar-hill','times-square','tribeca','two-bridges','upper-east-side','upper-west-side','washington-heights','west-village'] },
  brooklyn:       { lat:40.6782, lng:-73.9442, nhs:['bay-ridge','bed-stuy','bensonhurst','boerum-hill','borough-park','brighton-beach','brooklyn-heights','brownsville','bushwick','canarsie','carroll-gardens','clinton-hill','cobble-hill','coney-island','crown-heights','downtown-brooklyn','dumbo','dyker-heights','east-new-york','flatbush','fort-greene','greenpoint','kensington','midwood','park-slope','prospect-heights','red-hook','sheepshead-bay','sunset-park','williamsburg'] },
  queens:         { lat:40.7282, lng:-73.7949, nhs:['astoria','bayside','bellerose','briarwood','college-point','corona','douglaston','elmhurst','far-rockaway','flushing','forest-hills','fresh-meadows','glen-oaks','howard-beach','jackson-heights','jamaica','kew-gardens','little-neck','long-island-city','maspeth','middle-village','ozone-park','rego-park','ridgewood','rockaway-beach','st-albans','sunnyside','whitestone','woodhaven','woodside'] },
  bronx:          { lat:40.8448, lng:-73.8648, nhs:['belmont','concourse','fordham','highbridge','hunts-point','kingsbridge','morris-park','mott-haven','norwood','pelham-bay','riverdale','south-bronx','throgs-neck','tremont','wakefield'] },
  'staten-island':{ lat:40.5795, lng:-74.1502, nhs:['annadale','eltingville','great-kills','huguenot','new-dorp','princes-bay','st-george','stapleton','tompkinsville','tottenville'] },
}
const BOROUGH_WEIGHTS = [
  ...Array(35).fill('manhattan'),
  ...Array(30).fill('brooklyn'),
  ...Array(20).fill('queens'),
  ...Array(10).fill('bronx'),
  ...Array(5).fill('staten-island'),
]

const STREETS = ['1st Ave','2nd Ave','3rd Ave','Broadway','Lexington Ave','Madison Ave','Park Ave','Amsterdam Ave','Columbus Ave','5th Ave','6th Ave','7th Ave','8th Ave','Atlantic Ave','Flatbush Ave','DeKalb Ave','Myrtle Ave','Bedford Ave','Grand St','Delancey St','Houston St','Bleecker St','14th St','23rd St','34th St','42nd St','57th St','72nd St','86th St','96th St','110th St','125th St']
const PLACES = ['Joes','Corner Spot','La Esquina','The Local','Golden Dragon','Noodle House','Cafe Roma','Taqueria Mexico','Pho Saigon','Sushi Palace','The Bean','Green Leaf','Mamas Kitchen','The Bodega','Blue Moon','Red Hook Coffee','Sunset Diner','Brooklyn Bagels','Astoria Bites','Harlem Soul']
const CITIES = ['Boston','Chicago','LA','Miami','Philly','DC','Atlanta','Portland','Denver','Seattle','Austin','San Francisco','Dallas','Nashville','Detroit']
const HOBBIES = ['reading','hiking','cooking','yoga','running','cycling','photography','painting','chess','volleyball','gardening','skating','surfing','climbing','dancing']
const TRAINS = ['A','C','E','B','D','F','M','N','Q','R','W','1','2','3','4','5','6','7','G','J','Z','L','S']

// ─── Porch post types ───
const PORCH_TYPES = ['recommendation','question','alert','lost-and-found','event','stoop-sale','garage-sale','volunteer','carpool','pet-sighting','welcome','group']

// ─── Porch templates (compact) ───
const PORCH_TEMPLATES = {
  recommendation: [
    { t: 'Best pizza near {nh}?', b: 'Just moved to {nh} and looking for solid pizza. Not fancy, just good. Near {street} if possible.' },
    { t: 'Amazing coffee shop on {street}', b: 'Just found {place} and its incredible. Great vibes, friendly staff. If you are in {nh} definitely check it out.' },
    { t: 'Good mechanic in {nh}?', b: 'Need an honest mechanic. Last place tried to charge me $800 for brake pads. Anyone got a go-to near {street}?' },
    { t: 'Best brunch in {nh}', b: '{place} does an incredible brunch. Bottomless mimosas on weekends. Get there early or you will wait forever.' },
    { t: 'Solid barber in {nh}', b: 'Looking for a good barber who can do a clean fade. Near {street} preferred. What do you all recommend?' },
    { t: 'Great tailor on {street}', b: 'The tailor near {street} is amazing. Quick turnaround, fair prices. Fixed my favorite jacket for $20.' },
    { t: 'Dentist recommendation — {nh}', b: 'New to {nh} and need a good dentist. Preferably someone gentle. Insurance is Aetna. Thanks in advance.' },
    { t: 'Best laundromat in {nh}', b: 'The one on {street} has new machines and AC. Way better than the old one. Just thought you should know.' },
  ],
  question: [
    { t: 'Anyone know when {street} construction ends?', b: 'The noise has been going on for weeks. Cant sleep. Does anyone know the timeline? I called 311 and got nothing.' },
    { t: 'Good gym near {nh}?', b: 'Looking for a gym thats not Planet Fitness but also not $200/month. Something in between near {street}.' },
    { t: 'Package theft — anyone else in {nh}?', b: 'Third package stolen this month. Front door has no camera. Is this happening to others near {street}?' },
    { t: 'Is the {train} train running normal?', b: 'Seems like every morning the {train} is delayed. Is there some ongoing work I dont know about?' },
    { t: 'What happened on {street} this morning?', b: 'Saw 3 fire trucks and an ambulance on {street} around 8am. Hope everyone is OK. Anyone know what happened?' },
    { t: 'Dog friendly restaurants in {nh}?', b: 'We have a small dog and want to eat outside with him. Any spots in {nh} that are cool with well-behaved dogs?' },
  ],
  alert: [
    { t: 'Water main break on {street}', b: 'Huge puddle forming and water pressure is low in the building. If you live near {street} in {nh}, fill up some bottles just in case.' },
    { t: 'Suspicious activity — {nh}', b: 'Heads up: someone has been trying car doors on {street} late at night. Saw them on my Ring camera around 2am. Lock your cars.' },
    { t: 'Power outage — {nh} area', b: 'Power has been out since 6pm on {street} and surrounding blocks. ConEd says they are working on it. Anyone got an ETA?' },
    { t: 'Scam alert — fake parking tickets in {nh}', b: 'Someone is putting fake parking tickets on cars near {street} with a QR code to pay. Its a scam. Real tickets are orange.' },
  ],
  'lost-and-found': [
    { t: 'Lost keys — {nh} area', b: 'Dropped my keys somewhere between {street} and the subway. Silver keyring with a Mets bottle opener. If found please reach out.' },
    { t: 'Found wallet near {street}', b: 'Found a brown leather wallet on the sidewalk near {street} in {nh}. Has ID inside. Trying to return it. DM me your name.' },
    { t: 'Lost phone — {nh} park', b: 'Left my phone on a bench in the park near {street}. Black iPhone in a blue case. Reward if found.' },
    { t: 'Found cat — {nh}', b: 'Found an orange tabby hiding under a car on {street}. Very friendly, no collar. Might be someones pet. Currently at my apartment.' },
  ],
  event: [
    { t: 'Block party this Saturday — {nh}', b: '{street} is closed from 2-8pm. Live music, food vendors, activities for kids. Come hang with the neighborhood.' },
    { t: 'Free yoga in the park — {nh}', b: 'Every Sunday at 9am in the park near {street}. All levels welcome. Bring your own mat. Runs through October.' },
    { t: 'Open mic night — {nh}', b: '{place} is doing open mic every Thursday. Music, comedy, poetry, whatever you got. Sign up starts at 7pm.' },
    { t: 'Community cleanup — {nh}', b: 'Were cleaning up {street} this Saturday morning. Gloves and bags provided. Meet at 10am. Lets keep the neighborhood nice.' },
  ],
  'stoop-sale': [
    { t: 'Stoop sale this Sunday — {street}', b: 'Clearing out the apartment. Furniture, clothes, kitchen stuff, books, records. Everything priced to go. {nh}, starts at 9am.' },
    { t: 'Stoop sale — designer clothes, {nh}', b: 'Designer clothes, shoes, bags. Everything under $50. Saturday 10am-2pm on {street}. Cash only. Come early for the good stuff.' },
    { t: 'Moving sale — everything must go, {nh}', b: 'Bed frame, couch, desk, kitchen supplies, decor. All reasonable prices. {street}. Saturday and Sunday 9am-3pm.' },
  ],
  'garage-sale': [
    { t: 'Garage sale — tools and furniture, {nh}', b: 'Power tools, hand tools, workbench, plus some furniture. Saturday 8am-noon. {street} in {nh}. Cash only.' },
    { t: 'Neighborhood garage sale — {nh}', b: 'Multiple houses on {street} are doing a joint garage sale this weekend. Tons of stuff. Family friendly.' },
  ],
  volunteer: [
    { t: 'Volunteers needed — food pantry, {nh}', b: 'We distribute food every Saturday morning on {street}. Need help sorting and handing out. Even 1 hour helps. All are welcome.' },
    { t: 'Tutoring volunteers — {nh}', b: 'After-school program near {street} needs tutors for middle school kids. Tuesdays and Thursdays 3-5pm. Make a real difference.' },
    { t: 'Park cleanup volunteers — {nh}', b: 'Help us clean up the park near {street}. Saturday mornings. Gloves, bags, and coffee provided. Community service hours available.' },
  ],
  carpool: [
    { t: 'Carpool to {nh} from {nh} — weekdays', b: 'Driving from {nh} to Midtown every morning around 7:30am. Room for 2. Split gas and tolls. DM me.' },
    { t: 'Ride to airport — {nh}', b: 'Need a ride to JFK this Friday morning around 6am. Will pay $40. I live near {street} in {nh}.' },
  ],
  'pet-sighting': [
    { t: 'Loose dog — {nh}', b: 'Small brown dog running loose near {street}. No collar. Looks scared. If this is your dog please come get them.' },
    { t: 'Hawk nesting near {street}', b: 'Theres a red-tailed hawk nesting on the building at {street} and it is awesome. Bring binoculars if you are into that.' },
  ],
  welcome: [
    { t: 'Just moved to {nh}!', b: 'Moved from {city} last week. Loving it so far. Any tips for the neighborhood? Best food, things to do, stuff to avoid? Thanks!' },
    { t: 'Hello from {nh}', b: 'Been here a month and finally feeling settled. This app is great for meeting the neighborhood. Excited to be here.' },
    { t: 'New to {nh} — where should I eat?', b: 'Just arrived from {city}. I eat everything. Whats the must-try spot near {street}? Hit me with your favorites.' },
  ],
  group: [
    { t: 'Running group — {nh}', b: 'Looking to start a morning running group. 3x/week, 3-5 miles. All paces welcome. Meet at {street}. DM me if interested.' },
    { t: 'Book club — {nh}', b: 'Starting a monthly book club. Meet at {place} near {street}. First book TBD by the group. Interested? Reach out.' },
    { t: 'Pickup soccer — Sundays, {nh}', b: 'We play every Sunday at 10am near {street}. Co-ed, all levels. Bring cleats and water. Always need more people.' },
  ],
}

// ─── Listing templates — personals HEAVY ───
// Category weights: personals 25, housing 18, jobs 12, for-sale 10, services 8, gigs 7, tickets 5, pets 5, barter 3, rentals 3, resumes 2
const CATEGORY_WEIGHTS = {
  personals: 25,
  housing: 18,
  jobs: 12,
  'for-sale': 10,
  services: 8,
  gigs: 7,
  tickets: 5,
  pets: 5,
  barter: 3,
  rentals: 3,
  resumes: 2,
}

function pickCategory() {
  const entries = Object.entries(CATEGORY_WEIGHTS)
  const total = entries.reduce((s, [, w]) => s + w, 0)
  let r = Math.random() * total
  for (const [cat, w] of entries) {
    r -= w
    if (r <= 0) return cat
  }
  return 'personals'
}

// Listing templates by category — subcategory, titles, descriptions, price ranges
const LISTING_CATS = {
  personals: [
    { sub: 'activity-partners', items: [
      { t: 'Running partner — Central Park mornings', d: 'Training for the NYC half. 8-9 min pace, 3-4 days/week before work. All levels welcome.', p: [0,0] },
      { t: 'Tennis partner wanted — {nh}', d: 'Intermediate player looking for regular sets at public courts. Weekday evenings or weekends work.', p: [0,0] },
      { t: 'Hiking buddy — weekend day trips', d: 'I have a car. Bear Mountain, Breakneck Ridge, Harriman. 6-10 mile hikes. I pack lunch.', p: [0,0] },
      { t: 'Board game night — {nh}', d: 'Every other Thursday. Catan, Wingspan, Ticket to Ride. 4-6 people. BYOB. DM to join.', p: [0,0] },
      { t: 'Photography walk — {nh}', d: 'Street photography Saturday afternoons. I use a Fuji, you can use your phone. Just want good company.', p: [0,0] },
      { t: 'Climbing partner — Brooklyn Boulders', d: 'Need a belay partner. I go 3x/week evenings. I lead 5.10s. Any level welcome.', p: [0,0] },
      { t: 'Pickup basketball — {nh}', d: 'Saturday mornings at the courts on {street}. Need more regulars. Competitive but friendly. 9am-noon.', p: [0,0] },
      { t: 'Cycling buddy — bridge loops', d: 'Manhattan/Brooklyn/Williamsburg bridge loop 2-3x/week after work. Avg 15-17mph.', p: [0,0] },
      { t: 'Museum buddy — {nh}', d: 'I have a Culture Pass. Want to hit every museum in the city. Coffee after.', p: [0,0] },
      { t: 'Yoga partner — morning classes, {nh}', d: '7am vinyasa M/W/F. Looking for accountability partner. 2 years practicing.', p: [0,0] },
      { t: 'Soccer — looking for players, {nh}', d: 'Pickup soccer Sundays near {street}. Co-ed, all levels. 10am. Bring cleats.', p: [0,0] },
      { t: 'Cooking partner — swap recipes, {nh}', d: 'Cook together once a week. Alternate hosting. I make great pernil and mofongo.', p: [0,0] },
      { t: 'Karaoke crew — Thursday nights', d: 'K-Town every other Thursday. 6-8 people. Very judgment-free. All voices welcome, especially bad ones.', p: [0,0] },
      { t: 'Dance partner — salsa, {nh}', d: 'Salsa classes Tuesdays 8pm near {street}. Need a consistent partner. Beginner-friendly.', p: [0,0] },
      { t: 'Poker night — {nh}, low stakes', d: '$20 buy-in. Texas Hold Em. Every other Saturday. 6-8 people. Snacks and beers.', p: [0,0] },
      { t: 'Language exchange — Spanish/English', d: 'Native English speaker learning Spanish. 30 min each language over coffee weekly in {nh}.', p: [0,0] },
      { t: 'Gym partner — {nh}', d: 'Looking for someone to lift with 3-4x/week around 6pm near {street}. PPL split. Any experience level.', p: [0,0] },
      { t: 'Trivia night — {nh}', d: 'Bar on {street} does trivia Wednesdays. Need someone who knows pop culture. Team of 4 ideal.', p: [0,0] },
      { t: 'Birdwatching — weekend mornings', d: 'Getting into birding. I got binoculars and Merlin app. Early Saturday mornings. Central or Prospect Park.', p: [0,0] },
      { t: 'Thrifting partner — weekends', d: 'Thrift stores and estate sales every weekend. Vintage clothing, furniture, records. {nh} has hidden gems.', p: [0,0] },
    ]},
    { sub: 'missed-connections', items: [
      { t: 'Blue jacket, L train — Lorimer', d: 'You were reading Murakami. We made eye contact. You got off at 1st Ave. I was in the gray hoodie.', p: [0,0] },
      { t: 'Coffee shop — Saturday morning, {nh}', d: 'You had an oat milk latte, I had an Americano. We talked about jazz for 10 minutes.', p: [0,0] },
      { t: 'Dog park — we should walk together', d: 'Your dog played with mine for 20 minutes. Should have asked for your number.', p: [0,0] },
      { t: 'Laundromat on {street}', d: 'You made a joke about your socks never matching. I laughed too hard. Red sneakers, remember?', p: [0,0] },
      { t: 'Bookstore — {nh}, Sunday', d: 'You were in the poetry section. You bought a Neruda collection. So did I, after you left.', p: [0,0] },
      { t: '{train} train — Tuesday morning', d: 'You let me have the last seat. I didnt want to interrupt your music. But I wish I had.', p: [0,0] },
      { t: 'Farmers market — Union Square', d: 'We both reached for the same peach. You laughed and let me have it. Tattoo sleeves.', p: [0,0] },
      { t: 'Bar on {street} — Friday night', d: 'You were reading alone at the bar. Vintage band tee. My friends dragged me away.', p: [0,0] },
      { t: 'Grocery store — {nh}', d: 'You helped me reach the top shelf. We talked in the checkout line. You just moved here. Welcome.', p: [0,0] },
      { t: 'Concert at Brooklyn Steel', d: 'We talked between sets about how underrated the band is. Lost you in the crowd. Denim jacket.', p: [0,0] },
      { t: 'Pizza line — {place}', d: 'We debated best pizza in NYC for 15 minutes. You said Lucalis, I said Di Fara. You were right.', p: [0,0] },
      { t: 'Bodega cat — {street}', d: 'We both stopped to pet the bodega cat. You said this is the real NYC experience. Great laugh.', p: [0,0] },
      { t: 'Ferry to Governors Island', d: 'You were sketching in a notebook. I peeked and it was incredible. You caught me and smiled.', p: [0,0] },
      { t: 'Delayed {train} train — underground', d: 'Stuck for 45 minutes. You shared your gummy bears. Best subway delay ever. Didnt get your name.', p: [0,0] },
      { t: 'Gallery opening — {nh}', d: 'We talked about the abstract piece for too long. You work in design. The wine was bad, the convo was great.', p: [0,0] },
    ]},
    { sub: 'strictly-platonic', items: [
      { t: 'New to {nh} — looking for friends', d: 'Just moved from {city}. 28, into cooking, hiking, live music. Would love to grab a beer.', p: [0,0] },
      { t: 'Mom friends — {nh}', d: 'Stay at home mom, 2 year old. Playground gets lonely. Playdates or adult conversation? Coffee while kids play?', p: [0,0] },
      { t: 'Friend group for 30s — {nh}', d: 'All my friends moved to the suburbs. Looking for 30-somethings who want dinner, brunch, movies.', p: [0,0] },
      { t: 'Creative friends — {nh}', d: 'Writer looking for musicians, painters, filmmakers. Bounce ideas off each other. Or just tacos.', p: [0,0] },
      { t: 'Dog park regulars — be friends?', d: 'Im at the {nh} dog park every evening. Same faces, nobody talks. Lets change that.', p: [0,0] },
      { t: 'Introvert seeking introvert — {nh}', d: 'Best hangout = sitting in same room reading different books. Low-key friendship. Near {street}.', p: [0,0] },
      { t: 'Transplant from {city} — need a crew', d: 'NYC 3 months. Love it but eating alone is old. 25F, yoga, thrifting, shows. Please be my friend.', p: [0,0] },
      { t: 'Weekend brunch crew — {nh}', d: 'Standing brunch date. Every weekend, pick a spot, eat too much, complain about our weeks. No flaking.', p: [0,0] },
      { t: 'Sober friends — {nh}', d: 'Quit drinking a year ago. Social life took a hit. Looking for non-bar activities and real connection.', p: [0,0] },
      { t: 'Night owl friends — {nh}', d: 'Work late. Socialize after 10pm. Late-night food, walks, diners at 1am. My kind of thing.', p: [0,0] },
      { t: 'Concert buddy — {nh}', d: 'Nobody likes my music. Into indie, jazz, R&B. Brooklyn Steel, Bowery Ballroom, Blue Note. DM your fav artist.', p: [0,0] },
      { t: 'Work from home buddy — {nh}', d: 'Remote worker going insane. Looking for someone to co-work at cafes a few times/week. Silence is fine.', p: [0,0] },
      { t: 'New dad — other dads? {nh}', d: '34M, 6 month old. Friends without kids are tired of hearing about sleep schedules. Need dad friends.', p: [0,0] },
      { t: 'Queer friends — {nh}', d: 'Looking for queer friends outside bar/club settings. Movie nights, potlucks, park hangs.', p: [0,0] },
      { t: 'Study buddy — {nh} cafes', d: 'Grad student looking for accountability. Doesnt matter what you study. I buy first coffee.', p: [0,0] },
    ]},
  ],
  housing: [
    { sub: 'apartments', items: [
      { t: 'Sunny 1BR — {nh}, great light', d: 'South-facing. Heat included. Walk-up but worth it. Near {train} train. Available March 1.', p: [180000,280000] },
      { t: 'Spacious 2BR, renovated — {nh}', d: 'New kitchen, stainless appliances. Hardwood throughout. Laundry in building. No broker fee.', p: [250000,380000] },
      { t: 'Studio, exposed brick — {nh}', d: 'Charming walkup with brick. Top floor, quiet. Great closet. Near {train}. Cat-friendly.', p: [150000,200000] },
      { t: 'Large 3BR — W/D in unit, {nh}', d: 'Rare laundry in unit. Full kitchen. Near subway and parks. Family-friendly. Pets welcome.', p: [320000,450000] },
      { t: 'Modern 2BR — rooftop, {nh}', d: 'Doorman, gym, rooftop views. Central AC, in-unit W/D. Walk to {train}. Pet-friendly.', p: [350000,480000] },
      { t: 'Rent-stabilized 1BR — {nh}', d: 'Below market. Heat included. Quiet building, good super. Near {street}. Long-term lease.', p: [140000,180000] },
      { t: 'Alcove studio — doorman, {nh}', d: 'Separate sleeping alcove feels like 1BR. Elevator, laundry, live-in super. Near {train}.', p: [165000,210000] },
    ]},
    { sub: 'rooms-shared', items: [
      { t: 'Room in 3BR — {nh}', d: 'Private room. 2 chill roommates. Shared kitchen and bath. Near {train}. Utilities split.', p: [95000,140000] },
      { t: 'Private room — all utils included, {nh}', d: 'Furnished. WiFi, electric, heat included. No smoking. Month-to-month.', p: [110000,160000] },
      { t: 'Master BR in 2BR — {nh}', d: 'Biggest room. One roommate, 28F professional. Near {street}. Clean and respectful.', p: [120000,160000] },
      { t: 'LGBTQ+ friendly room — {nh}', d: 'Welcoming household, 3rd roommate needed. Near {train}. We have a cat. Utils included.', p: [100000,130000] },
    ]},
    { sub: 'sublets', items: [
      { t: 'Summer sublet 1BR — {nh}', d: 'June-Aug. Fully furnished, AC. Great location near {train}. Gym and laundry in building.', p: [180000,260000] },
      { t: '3-month sublet — {nh}', d: 'Leaving for work March-May. Cute studio near {street}. Everything included. Bring clothes.', p: [150000,200000] },
    ]},
  ],
  jobs: [
    { sub: 'restaurant-hospitality', items: [
      { t: 'Line Cook — {nh} restaurant', d: '$18-22/hr + meal. Fast-paced. Experience required. Start immediately.', p: [0,0] },
      { t: 'Server/Bartender — {nh}', d: '$15/hr + tips ($200-400/night). Wine knowledge a plus. Weekend availability required.', p: [0,0] },
      { t: 'Barista — {nh} coffee shop', d: '$17/hr + tips. Latte art a plus. Morning shifts. Passionate about coffee.', p: [0,0] },
    ]},
    { sub: 'tech-engineering', items: [
      { t: 'Junior Frontend Dev — hybrid', d: '$70-90K. React/Next.js. 1-2 yrs exp. In-office 3 days near {street}. Health + 401k.', p: [0,0] },
      { t: 'Senior Backend Engineer — remote/NYC', d: '$150-180K. Python, PostgreSQL, AWS. 5+ years. Scaling fast. Equity available.', p: [0,0] },
      { t: 'Full Stack — fintech, {nh}', d: '$120-160K. TypeScript, Node, React. Series B startup. Near {train}.', p: [0,0] },
    ]},
    { sub: 'trades-skilled-labor', items: [
      { t: 'Electrician Apprentice — union', d: '$25-35/hr + benefits. Will train. Must be dependable. Steady pay.', p: [0,0] },
      { t: 'Licensed Plumber — experienced', d: '$40-60/hr. 5+ yrs NYC. Residential and commercial. Own tools and van.', p: [0,0] },
    ]},
    { sub: 'retail', items: [
      { t: 'Retail Associate — {nh}', d: '$16-18/hr. Fashion-forward. Part/full-time. Employee discount.', p: [0,0] },
    ]},
    { sub: 'creative-media', items: [
      { t: 'Graphic Designer — agency, {nh}', d: '$55-75K. Adobe Suite, Figma. 2+ years. Brand identity, social media. Hybrid.', p: [0,0] },
      { t: 'Social Media Manager — startup', d: '$50-65K. Instagram, TikTok, LinkedIn. Content + strategy. Remote-first.', p: [0,0] },
    ]},
  ],
  'for-sale': [
    { sub: 'furniture', items: [
      { t: 'Solid wood dining table — seats 6', d: 'Moving, must sell. Real wood. Minor scratches. You haul. Cash only. Near {street}.', p: [10000,25000] },
      { t: 'Mid-century modern couch', d: 'From Article, 2 years old. No stains, no pets. Seats 3. You pick up.', p: [30000,60000] },
      { t: 'Standing desk — electric adjustable', d: 'Uplift V2. 48 inch. Dual motors. Bamboo top. Going back to office.', p: [20000,35000] },
      { t: 'Queen bed frame — {nh}', d: 'Sturdy platform, no box spring needed. No squeaks. Must pick up this weekend.', p: [12000,25000] },
    ]},
    { sub: 'electronics', items: [
      { t: 'MacBook Pro M2 — 16GB', d: 'Battery 98%. AppleCare until 2027. No scratches. Comes with charger and box.', p: [90000,130000] },
      { t: 'PS5 + 2 controllers', d: 'Disc edition. Works perfectly. 3 games. Original box. Dont game anymore.', p: [30000,45000] },
      { t: 'Sony WH-1000XM5', d: 'Best noise cancelling. 6 months old. Original case and box. Gift duplicate.', p: [18000,28000] },
    ]},
    { sub: 'bikes', items: [
      { t: 'Trek FX3 hybrid — great commuter', d: 'Carbon fork, disc brakes. One season. Fits 5\'8"-6\'0".', p: [35000,55000] },
      { t: 'E-bike — 500W, 40mi range', d: 'Pedal assist + throttle. 28mph. Removable battery. 3 months old.', p: [60000,100000] },
    ]},
    { sub: 'free-stuff', items: [
      { t: 'Free couch — you haul, {nh}', d: 'Gray sectional. Some wear but functional. Moving this weekend. Pick up Saturday.', p: [0,0] },
      { t: 'Moving boxes — free, {nh}', d: 'About 30 boxes, packing paper, bubble wrap. First come. On {street}.', p: [0,0] },
      { t: 'Books — 3 boxes free, {nh}', d: 'Fiction, non-fiction, cookbooks. Downsizing. Take some or all. On stoop Saturday.', p: [0,0] },
    ]},
    { sub: 'vinyl-records', items: [
      { t: 'Jazz collection — 40 records', d: 'Coltrane, Monk, Miles, Mingus. All VG+. Lot only. 20 years collecting.', p: [20000,40000] },
      { t: 'Hip hop vinyl — 25 albums', d: 'Nas, Biggie, Tribe, OutKast. Mix of originals and reissues. Meet in {nh}.', p: [15000,25000] },
    ]},
    { sub: 'sneakers-streetwear', items: [
      { t: 'Jordan 4 Bred — sz 10, DS', d: 'Deadstock with SNKRS receipt. Never tried on. Price firm.', p: [22000,30000] },
      { t: 'New Balance 990v6', d: 'Made in USA. Gray. Worn twice. Too narrow. Basically new.', p: [14000,20000] },
    ]},
  ],
  services: [
    { sub: 'cleaning', items: [
      { t: 'Deep cleaning — {nh}', d: 'Licensed, insured, 10 years. Ovens, fridges, baseboards. Move-in/out specials.', p: [15000,30000] },
      { t: 'Weekly apartment cleaning — {nh}', d: 'Same cleaner every week. Consistent and reliable. Supplies included.', p: [10000,18000] },
    ]},
    { sub: 'handyman', items: [
      { t: 'Handyman — no job too small, {nh}', d: 'TV mounting, shelves, minor plumbing, drywall. 15 years. Licensed.', p: [7500,15000] },
      { t: 'Furniture assembly — flat rate', d: 'IKEA, Wayfair. Flat rate per piece. Own tools. Same-day available.', p: [5000,10000] },
    ]},
    { sub: 'moving-hauling', items: [
      { t: '2 movers + truck — $300', d: 'Licensed, insured. No hidden fees. Local NYC. Padding and dollies included.', p: [25000,50000] },
    ]},
    { sub: 'tutoring', items: [
      { t: 'Math tutor — all levels, {nh}', d: 'Columbia grad. Algebra to Calculus. $60/hr. In-person or online.', p: [5000,10000] },
      { t: 'SAT/ACT prep — 1500+ scorer', d: 'Scored 1560. Personalized plans. $80/hr. Results guaranteed.', p: [7000,12000] },
    ]},
    { sub: 'photography', items: [
      { t: 'NYC portrait photographer', d: 'Natural light. Parks, rooftops, streets. 1-hour session, 30+ photos.', p: [15000,30000] },
      { t: 'Headshots — professional, {nh}', d: 'LinkedIn, acting, dating apps. 30-min, 10 retouched photos.', p: [12000,25000] },
    ]},
  ],
  gigs: [
    { sub: 'moving-help', items: [
      { t: 'Help moving Saturday — {nh}', d: 'Moving 2BR to 1BR. Need 2 people. 3 hours. $100 each + pizza.', p: [8000,15000] },
    ]},
    { sub: 'dog-walking', items: [
      { t: 'Dog walker weekdays — {nh}', d: '30-min midday walk Mon-Fri. Friendly goldendoodle. Near {street}.', p: [2000,3000] },
    ]},
    { sub: 'delivery-runs', items: [
      { t: 'Pick up furniture — {nh}', d: 'Need car to pick up dresser. Should take an hour. $75 cash.', p: [5000,10000] },
    ]},
    { sub: 'pet-sitting', items: [
      { t: 'Cat sitter — 5 days, {nh}', d: 'Stop by daily for feeding and litter. Easy cat. $25/day. Near {street}.', p: [2000,3500] },
    ]},
    { sub: 'tech-help', items: [
      { t: 'Smart home setup — {nh}', d: 'Bought smart lights and thermostat. Need someone to set it all up. 2 hours. $60.', p: [4000,8000] },
    ]},
  ],
  tickets: [
    { sub: 'concerts', items: [
      { t: '2 tix — MSG show', d: 'Section 112. Cant make it. Face value. Transfer via Ticketmaster.', p: [10000,25000] },
      { t: 'Brooklyn Steel — sold out, 2 tix', d: 'GA standing. Work conflict. Face value. Instant transfer.', p: [5000,12000] },
    ]},
    { sub: 'sports', items: [
      { t: 'Knicks tix — lower level', d: 'Section 105. Weeknight game. Face value. Transfer via Ticketmaster.', p: [12000,25000] },
      { t: 'Yankees — 2 tickets', d: 'Section 110, row 8. Weekend game. Face value.', p: [15000,35000] },
    ]},
    { sub: 'broadway', items: [
      { t: 'Hamilton — orchestra, 2 seats', d: 'Row M center. Hard to get at face. Will transfer immediately.', p: [20000,40000] },
      { t: 'Wicked — Saturday matinee', d: 'Mezzanine center. Great view. Face value transfer.', p: [12000,25000] },
    ]},
  ],
  pets: [
    { sub: 'adoption', items: [
      { t: 'Sweet tabby needs home — {nh}', d: '3yo, spayed, all shots. Indoor only. Very affectionate. Comes with supplies.', p: [0,0] },
      { t: 'Rescue pit mix — great with kids', d: '2yo, neutered, vaccinated. Gentle giant. Was a stray, now a sweetheart.', p: [0,0] },
    ]},
    { sub: 'pet-sitting', items: [
      { t: 'Cat sitter 1 week — {nh}', d: 'Feed, water, scoop litter, give love. Easy cat. $25/visit.', p: [2000,3500] },
    ]},
    { sub: 'lost-found-pets', items: [
      { t: 'LOST — orange tabby, {nh}', d: 'Indoor cat escaped near {street}. Responds to Mango. Very friendly. Reward.', p: [0,0] },
      { t: 'FOUND — small white dog, {nh}', d: 'Found near {street}. No collar, no chip. Safe at my apartment. Looking for owner.', p: [0,0] },
    ]},
  ],
  barter: [
    { sub: 'goods-for-goods', items: [
      { t: 'Trade: KitchenAid for bike', d: 'Red stand mixer for commuter bike. Also open to other trades. {nh}.', p: [0,0] },
      { t: 'Swap: PS5 for Switch + cash', d: 'PS5 disc for Switch OLED + $100. Meet in {nh}.', p: [0,0] },
    ]},
    { sub: 'skills-for-skills', items: [
      { t: 'Trade: Spanish for guitar lessons', d: 'Native speaker. Want guitar. Weekly. All levels.', p: [0,0] },
      { t: 'Swap: web design for photography', d: 'I build websites. Need product photos. Trade services.', p: [0,0] },
    ]},
  ],
  rentals: [
    { sub: 'tools-equipment', items: [
      { t: 'Power drill rental — $15/day', d: 'DeWalt 20V. Charger and 2 batteries. Pick up in {nh}.', p: [1500,2000] },
    ]},
    { sub: 'cameras-gear', items: [
      { t: 'Sony A7III — $75/day', d: 'Full frame mirrorless. 2 batteries. Proof of ID required. {nh}.', p: [7500,10000] },
    ]},
    { sub: 'party-supplies', items: [
      { t: 'Tables + chairs — event rental', d: '10 tables, 40 chairs. Delivery in {nh}. $50/day.', p: [4000,6000] },
    ]},
  ],
  resumes: [
    { sub: 'software-engineering', items: [
      { t: 'Full Stack Dev — 5 yrs exp', d: 'React, Node, TypeScript, PostgreSQL. Looking for hybrid or remote in NYC.', p: [0,0] },
    ]},
    { sub: 'creative-media', items: [
      { t: 'Graphic Designer — 7 yrs', d: 'Adobe Suite, Figma. Brand identity, print, digital. Portfolio available.', p: [0,0] },
    ]},
  ],
}

// ─── Main backfill ───

async function main() {
  console.log('=== NYC Classifieds Backfill ===\n')

  // 1. Fetch existing seed users
  console.log('Fetching seed users...')
  const usersRes = await fetch(`${SUPABASE_URL}/rest/v1/users?email=like.*%40example.com&verified=eq.true&select=id,name,email&limit=500`, { headers })
  const seedUsers = await usersRes.json()
  console.log(`  Found ${seedUsers.length} seed users\n`)

  if (seedUsers.length === 0) {
    console.error('No seed users found. Run seed-platform.mjs first.')
    process.exit(1)
  }

  // Assign boroughs to users
  const users = seedUsers.map(u => {
    const borough = pick(BOROUGH_WEIGHTS)
    const nh = pick(BOROUGHS[borough].nhs)
    return { ...u, _borough: borough, _nh: nh }
  })

  // 2. Generate backfill dates — 45 days back with growth curve
  const BACKFILL_DAYS = 45
  const today = new Date()

  // Growth curve: day 1 = 30 listings, day 45 = 200+ listings
  function listingsPerDay(dayNum) {
    // Exponential-ish growth: 30 → 200 over 45 days
    return Math.round(30 + (dayNum / BACKFILL_DAYS) * 170 + rb(-10, 10))
  }

  function porchPerDay(dayNum) {
    // Growth: 15 → 120 over 45 days
    return Math.round(15 + (dayNum / BACKFILL_DAYS) * 105 + rb(-5, 5))
  }

  // 3. Generate listings
  console.log('Generating listings...')
  const allListings = []

  for (let dayOffset = BACKFILL_DAYS; dayOffset >= 1; dayOffset--) {
    const date = new Date(today)
    date.setDate(date.getDate() - dayOffset)
    const dayNum = BACKFILL_DAYS - dayOffset + 1

    const count = listingsPerDay(dayNum)
    for (let i = 0; i < count; i++) {
      const user = pick(users)
      const catSlug = pickCategory()
      const catTemplates = LISTING_CATS[catSlug]
      if (!catTemplates) continue

      const subGroup = pick(catTemplates)
      const item = pick(subGroup.items)
      const [minP, maxP] = item.p
      const price = minP === 0 && maxP === 0 ? null : rb(minP, maxP)

      const vars = {
        nh: nhName(user._nh),
        street: pick(STREETS),
        place: pick(PLACES),
        city: pick(CITIES),
        hobby: pick(HOBBIES),
        train: pick(TRAINS),
        biz: `${(user.name||'User').split(' ').pop()}'s ${pick(['Service','Shop','Co','Studio'])}`,
      }

      const b = BOROUGHS[user._borough]
      const lat = b.lat + (Math.random() - 0.5) * 0.02
      const lng = b.lng + (Math.random() - 0.5) * 0.02

      // Stagger time within the day
      const hour = pickHour()
      const min = rb(0, 59)
      const sec = rb(0, 59)
      const ts = new Date(date)
      ts.setHours(hour, min, sec)

      allListings.push({
        user_id: user.id,
        title: fill(item.t, vars).slice(0, 200),
        description: fill(item.d, vars).slice(0, 2000),
        price,
        category_slug: catSlug,
        subcategory_slug: subGroup.sub,
        images: [],
        location: `${nhName(user._nh)}, ${nhName(user._borough)}`,
        lat, lng,
        status: dayOffset > 30 ? pick(['active','active','active','sold','expired']) : 'active',
        expires_at: new Date(ts.getTime() + 30 * 86400000).toISOString(),
        created_at: ts.toISOString(),
      })
    }
  }

  console.log(`  Generated ${allListings.length} listings`)
  console.log('  Inserting...')
  const insertedListings = await supaInsert('listings', allListings)
  console.log(`  Inserted ${insertedListings} listings\n`)

  // 4. Generate porch posts
  console.log('Generating porch posts...')
  const allPorch = []

  for (let dayOffset = BACKFILL_DAYS; dayOffset >= 1; dayOffset--) {
    const date = new Date(today)
    date.setDate(date.getDate() - dayOffset)
    const dayNum = BACKFILL_DAYS - dayOffset + 1

    const count = porchPerDay(dayNum)
    for (let i = 0; i < count; i++) {
      const user = pick(users)
      const postType = pick(PORCH_TYPES)
      const templates = PORCH_TEMPLATES[postType]
      if (!templates || templates.length === 0) continue

      const tmpl = pick(templates)
      const vars = {
        nh: nhName(user._nh),
        street: pick(STREETS),
        place: pick(PLACES),
        city: pick(CITIES),
        hobby: pick(HOBBIES),
        train: pick(TRAINS),
        first: (user.name || 'Friend').split(' ')[0],
      }

      const hour = pickHour()
      const min = rb(0, 59)
      const sec = rb(0, 59)
      const ts = new Date(date)
      ts.setHours(hour, min, sec)

      const pinned = (postType === 'lost-and-found' || postType === 'pet-sighting') && Math.random() < 0.10
      const expH = postType === 'alert' ? 48 : (postType === 'lost-and-found' || postType === 'pet-sighting') ? 72 : 720

      allPorch.push({
        user_id: user.id,
        post_type: postType,
        title: fill(tmpl.t, vars).slice(0, 100),
        body: fill(tmpl.b, vars).slice(0, 500),
        borough_slug: user._borough,
        neighborhood_slug: user._nh,
        pinned,
        expires_at: new Date(ts.getTime() + expH * 3600000).toISOString(),
        created_at: ts.toISOString(),
      })
    }
  }

  console.log(`  Generated ${allPorch.length} porch posts`)
  console.log('  Inserting...')
  const insertedPorch = await supaInsert('porch_posts', allPorch)
  console.log(`  Inserted ${insertedPorch} porch posts\n`)

  // 5. Generate porch replies for recent posts
  console.log('Generating porch replies...')
  const REPLY_TEMPLATES = [
    'facts.', 'W post', '+1', 'this!!!', 'same tbh', 'vouch', 'Bookmarked.',
    'Great recommendation, thanks!', 'Can confirm — went there last week.',
    'Thanks for the heads up!', 'How much does it usually cost?',
    'My neighbor said the same thing.', 'Shared with my building group chat.',
    'This is why I love this neighborhood.', 'Welcome to the neighborhood!',
    'DM me, I have a recommendation.', 'Seconding this 100%.',
    'Good looking out for the community.', 'no because WHY did nobody tell me sooner',
    'ur doing gods work posting this', 'screenshotted this whole thread lol',
    'been here 20 years and still learn new stuff',
    'ok adding this to my list', 'Real recognize real. Good post.',
    'bro THANK YOU', 'say less im going tomorrow',
  ]

  // Fetch recently inserted porch posts (last 14 days worth)
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 14)
  const recentRes = await fetch(
    `${SUPABASE_URL}/rest/v1/porch_posts?created_at=gte.${cutoff.toISOString()}&select=id,user_id,created_at&limit=2000`,
    { headers }
  )
  const recentPosts = await recentRes.json()
  console.log(`  Found ${recentPosts.length} recent posts to reply to`)

  const allReplies = []
  for (const post of recentPosts) {
    // 30-60% of posts get 1-4 replies
    if (Math.random() > 0.45) continue
    const replyCount = rb(1, 4)
    for (let r = 0; r < replyCount; r++) {
      const replyUser = pick(users.filter(u => u.id !== post.user_id))
      if (!replyUser) continue

      const postDate = new Date(post.created_at)
      const replyDate = new Date(postDate.getTime() + rb(600000, 86400000 * 2))

      allReplies.push({
        post_id: post.id,
        user_id: replyUser.id,
        body: pick(REPLY_TEMPLATES),
        helpful_count: Math.random() < 0.3 ? rb(1, 8) : 0,
        created_at: replyDate.toISOString(),
      })
    }
  }

  console.log(`  Generated ${allReplies.length} replies`)
  console.log('  Inserting...')
  const insertedReplies = await supaInsert('porch_replies', allReplies)
  console.log(`  Inserted ${insertedReplies} replies\n`)

  // Summary
  console.log('=== Backfill Complete ===')
  console.log(`  Listings: ${insertedListings}`)
  console.log(`  Porch Posts: ${insertedPorch}`)
  console.log(`  Porch Replies: ${insertedReplies}`)

  // Category breakdown
  const catCounts = {}
  for (const l of allListings) {
    catCounts[l.category_slug] = (catCounts[l.category_slug] || 0) + 1
  }
  console.log('\n  Listing breakdown by category:')
  for (const [cat, count] of Object.entries(catCounts).sort((a,b) => b[1] - a[1])) {
    console.log(`    ${cat}: ${count}`)
  }

  // Day-by-day growth
  console.log('\n  Growth curve (listings/day):')
  for (let d = 1; d <= BACKFILL_DAYS; d += 5) {
    console.log(`    Day ${d}: ~${listingsPerDay(d)}/day`)
  }
}

function pickHour() {
  const weights = {
    0:2,1:1,2:1,3:1,4:1,5:1,
    6:3,7:5,8:6,9:5,10:4,11:5,
    12:8,13:10,14:8,15:5,16:4,17:5,
    18:8,19:10,20:9,21:7,22:4,23:3,
  }
  const entries = Object.entries(weights)
  const total = entries.reduce((s,[,w])=>s+w, 0)
  let r = Math.random() * total
  for (const [h,w] of entries) {
    r -= w
    if (r <= 0) return parseInt(h)
  }
  return 12
}

main().catch(err => { console.error(err); process.exit(1) })
