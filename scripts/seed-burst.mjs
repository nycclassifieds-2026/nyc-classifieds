#!/usr/bin/env node
/**
 * Burst seed: 500 actions (porch + listings) with varied tones.
 * Also ensures all seed users have avatar + verified status.
 * Run: node scripts/seed-burst.mjs
 */

const SUPABASE_URL = 'https://vpeozixllzdwzqniopfn.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZW96aXhsbHpkd3pxbmlvcGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY3MTQwNiwiZXhwIjoyMDg2MjQ3NDA2fQ.U9w4ZqhUiFDHTjH4taLGfH5Y9a2trsEH-BqLV__znq0'

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
}

async function supaGet(table, query = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { headers })
  if (!res.ok) { console.error(`GET ${table} failed:`, await res.text()); return [] }
  return res.json()
}

async function supaInsert(table, rows) {
  const batchSize = 50
  let inserted = 0
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST', headers, body: JSON.stringify(batch),
    })
    if (!res.ok) { console.error(`  ERR ${table}:`, (await res.text()).slice(0, 200)); continue }
    inserted += batch.length
    if (i % 100 === 0 && i > 0) process.stdout.write(` ${inserted}...`)
  }
  return inserted
}

async function supaUpdate(table, id, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH', headers, body: JSON.stringify(data),
  })
  return res.ok
}

// ─── Helpers ───
function pick(a) { return a[Math.floor(Math.random() * a.length)] }
function rb(a, b) { return a + Math.floor(Math.random() * (b - a + 1)) }
function nhName(s) { return s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }
function fill(s, v) { return s.replace(/\{(\w+)\}/g, (_, k) => v[k] || k) }

// ─── Geography ───
const BOROUGHS = {
  manhattan:       { lat: 40.7831, lng: -73.9712, nhs: ['alphabet-city','battery-park-city','carnegie-hill','chelsea','chinatown','east-harlem','east-village','financial-district','flatiron','gramercy','greenwich-village','hamilton-heights','harlem','hells-kitchen','hudson-yards','inwood','kips-bay','koreatown','lenox-hill','lincoln-square','little-italy','lower-east-side','manhattan-valley','meatpacking-district','midtown-east','midtown-west','morningside-heights','murray-hill','noho','nolita','roosevelt-island','soho','stuyvesant-town','sugar-hill','times-square','tribeca','two-bridges','upper-east-side','upper-west-side','washington-heights','west-village'] },
  brooklyn:        { lat: 40.6782, lng: -73.9442, nhs: ['bay-ridge','bed-stuy','bensonhurst','boerum-hill','borough-park','brighton-beach','brooklyn-heights','brownsville','bushwick','canarsie','carroll-gardens','clinton-hill','cobble-hill','coney-island','crown-heights','downtown-brooklyn','dumbo','dyker-heights','east-new-york','flatbush','fort-greene','greenpoint','kensington','midwood','park-slope','prospect-heights','red-hook','sheepshead-bay','sunset-park','williamsburg'] },
  queens:          { lat: 40.7282, lng: -73.7949, nhs: ['astoria','bayside','bellerose','briarwood','college-point','corona','douglaston','elmhurst','far-rockaway','flushing','forest-hills','fresh-meadows','glen-oaks','howard-beach','jackson-heights','jamaica','kew-gardens','little-neck','long-island-city','maspeth','middle-village','ozone-park','rego-park','ridgewood','rockaway-beach','st-albans','sunnyside','whitestone','woodhaven','woodside'] },
  bronx:           { lat: 40.8448, lng: -73.8648, nhs: ['belmont','concourse','fordham','highbridge','hunts-point','kingsbridge','morris-park','mott-haven','norwood','pelham-bay','riverdale','south-bronx','throgs-neck','tremont','wakefield'] },
  'staten-island': { lat: 40.5795, lng: -74.1502, nhs: ['annadale','eltingville','great-kills','huguenot','new-dorp','princes-bay','st-george','stapleton','tompkinsville','tottenville'] },
}
const BOROUGH_WEIGHTS = [...Array(35).fill('manhattan'), ...Array(30).fill('brooklyn'), ...Array(20).fill('queens'), ...Array(10).fill('bronx'), ...Array(5).fill('staten-island')]

const STREETS = ['1st Ave','2nd Ave','3rd Ave','Broadway','Lexington Ave','Madison Ave','Park Ave','Amsterdam Ave','Columbus Ave','5th Ave','6th Ave','7th Ave','8th Ave','Atlantic Ave','Flatbush Ave','DeKalb Ave','Myrtle Ave','Bedford Ave','Grand St','Delancey St','Houston St','Bleecker St','14th St','23rd St','34th St','42nd St','57th St','72nd St','86th St','96th St','110th St','125th St','145th St','Fordham Rd','Tremont Ave','Jerome Ave','Ditmars Blvd','Steinway St','Jamaica Ave','Hillside Ave','Metropolitan Ave','Vernon Blvd','Queens Blvd','Northern Blvd','Roosevelt Ave','Victory Blvd','Bay St','Hylan Blvd']
const PLACES = ['Joes','Corner Spot','La Esquina','The Local','Golden Dragon','Noodle House','Cafe Roma','Taqueria Mexico','Pho Saigon','Sushi Palace','The Bean','Green Leaf','Mamas Kitchen','The Bodega','Blue Moon','Red Hook Coffee','Sunset Diner','Brooklyn Bagels','Astoria Bites','Harlem Soul','The Halal Cart','Dumpling House','Empanada Mama','Peking Duck House','Russ & Daughters']
const CITIES = ['Boston','Chicago','LA','Miami','Philly','DC','Atlanta','Portland','Denver','Seattle','Austin','San Francisco','Dallas','Minneapolis','Nashville','Detroit','Charlotte','New Orleans','Pittsburgh','Baltimore']
const HOBBIES = ['hiking','cooking','photography','running','reading','cycling','yoga','climbing','music','gaming','art','basketball','soccer','film','writing','coding','gardening','chess','dancing','boxing']
const MOVIES = ['Do The Right Thing','Goodfellas','The Warriors','Saturday Night Fever','Coming to America','Spider-Man Into the Spider-Verse','West Side Story','Taxi Driver','Ghostbusters','King Kong','Moonstruck','The French Connection']
const BOOKS = ['A Tree Grows in Brooklyn','The Great Gatsby','Invisible Man','The Goldfinch','Motherless Brooklyn','Americanah','Open City','Bonfire of the Vanities','A Visit from the Goon Squad','Oscar Wao']
const TRAINS = ['A','C','E','B','D','F','M','N','Q','R','W','1','2','3','4','5','6','7','G','J','Z','L']

const NAMES = {
  hispanic: { last: ['Rodriguez','Santos','Garcia','Martinez','Lopez','Rivera','Cruz','Gomez','Diaz','Morales','Torres','Vargas'] },
  black: { last: ['Williams','Johnson','Brown','Davis','Wilson','Jackson','Thomas','Taylor','Moore','Harris','Robinson','Walker'] },
  asian: { last: ['Chen','Wang','Li','Zhang','Liu','Yang','Kim','Park','Lee','Wu','Huang','Lin'] },
  white: { last: ['Miller','Anderson','Clark','Lewis','Hall','Baker','Nelson','Carter','Mitchell','Roberts','Murphy','Kelly'] },
}
const DEMO = ['hispanic','black','asian','white']

// ─── Avatar styles — mix it up with DiceBear ───
const AVATAR_STYLES = ['avataaars','personas','adventurer','big-ears','lorelei','notionists','open-peeps','thumbs']

function makeAvatar(name, id) {
  const style = AVATAR_STYLES[id % AVATAR_STYLES.length]
  const seed = encodeURIComponent(name + id)
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&size=200`
}

// ─── Tone engine — way more variety ───
// Each user gets a persistent tone based on their ID
const TONES = [
  'gen_z',           // lowercase, no punctuation, slang heavy
  'millennial',      // casual but punctuated, uses lol/lmao/tbh
  'boomer',          // proper grammar, formal-ish, longer sentences
  'texter',          // super abbreviated, no caps, no apostrophes
  'professional',    // business-like, proper, polished
  'storyteller',     // long, descriptive, personal anecdotes
  'straight_shooter',// blunt, short sentences, no fluff
  'hype',            // ALL CAPS occasional, exclamation marks, energy
  'chill',           // relaxed, uses "...," trailing thoughts
  'parent',          // family-focused, practical, warm
  'old_school_nyc',  // classic NY attitude, direct, colorful
  'poet',            // lyrical, metaphors, artsy
]

function getTone(userId) {
  return TONES[userId % TONES.length]
}

function applyTone(text, tone) {
  switch (tone) {
    case 'gen_z':
      return text.toLowerCase().replace(/\./g, '').replace(/'/g, '').replace(/!+/g, ' fr').replace(/,\s/g, ' ').trim()
    case 'millennial':
      return text.replace(/\.$/, ' lol').replace(/!$/, ' tbh')
    case 'boomer':
      return text.replace(/(^|\. )([a-z])/g, (_, pre, c) => pre + c.toUpperCase())
    case 'texter':
      return text.toLowerCase().replace(/\./g, '').replace(/'/g, '').replace(/you/g, 'u').replace(/are/g, 'r').replace(/to /g, '2 ').replace(/for /g, '4 ')
    case 'professional':
      return text.replace(/(^|\. )([a-z])/g, (_, pre, c) => pre + c.toUpperCase()).replace(/dont/g, "do not").replace(/cant/g, "cannot").replace(/wont/g, "will not")
    case 'storyteller':
      return text // templates are already varied
    case 'straight_shooter':
      return text.replace(/!+/g, '.').replace(/\.\./g, '.')
    case 'hype':
      return Math.random() < 0.3 ? text.toUpperCase() : text.replace(/\.$/, '!!!')
    case 'chill':
      return text.replace(/\./g, '...').replace(/!/g, '...')
    case 'parent':
      return text
    case 'old_school_nyc':
      return text.replace(/\.$/, ', ya know what I mean?')
    case 'poet':
      return text.replace(/\./g, ' —')
    default:
      return text
  }
}

// ─── Template vars ───
function makeVars(user) {
  const demo = pick(DEMO)
  return {
    nh: nhName(user._nh),
    last: pick(NAMES[demo].last),
    first: user.name.split(' ')[0] || 'Friend',
    street: pick(STREETS),
    street2: pick(STREETS),
    street3: pick(STREETS),
    place: pick(PLACES),
    city: pick(CITIES),
    hobby: pick(HOBBIES),
    hobby2: pick(HOBBIES),
    movie: pick(MOVIES),
    book: pick(BOOKS),
    train: pick(TRAINS),
    biz: `${user.name.split(' ').pop()}'s ${pick(['Service','Shop','Co','Studio','Solutions'])}`,
  }
}

// ─── Porch templates (compact — reusing from seed-templates.ts patterns) ───
const PORCH_TYPES = ['recommendation','question','alert','lost-and-found','event','stoop-sale','garage-sale','volunteer','carpool','pet-sighting','welcome','group']
const PORCH_WEIGHTS = [20,20,10,8,12,8,5,5,5,3,2,2] // weighted distribution

function pickWeighted(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r <= 0) return items[i]
  }
  return items[0]
}

// Porch title+body pools per type (trimmed for speed — just the first 5 of each)
const PORCH = {
  recommendation: [
    { t: 'Best pizza in {nh} — hands down', b: 'If you havent tried {place} on {street} you are missing out. Their margherita is perfect. Cash only.' },
    { t: '{place} on {street} is ELITE', b: 'ngl the food at {place} is unmatched rn. if u havent been ur literally sleeping on the best spot in {nh}' },
    { t: 'Amazing dentist in {nh}', b: 'Dr. {last} on {street} is incredible. No wait, gentle, takes most insurance.' },
    { t: 'Best bodega breakfast in {nh}', b: 'The bodega on {street} makes a bacon egg and cheese that changed my life. $5. No cap.' },
    { t: 'Great vet in {nh}', b: 'Dr. {last} at {street} Animal Hospital. Gentle with my anxious dog, transparent pricing.' },
    { t: 'Locksmith saved me — {nh}', b: 'Locked out at midnight. {last} Locksmith came in 20 minutes, $60, no BS upcharge.' },
    { t: 'yall NEED to try {place}', b: 'bro i just had the best meal of my entire life at {place} on {street}. {nh} is blessed fr fr' },
    { t: 'Best coffee shop for remote work in {nh}', b: 'The cafe on {street} has great wifi, outlets everywhere, and they dont rush you.' },
    { t: 'Tailor recommendation — {nh}', b: '{last} Tailoring on {street}. Hemmed my pants perfectly for $12. Been there 20 years.' },
    { t: 'I want to share a wonderful find in {nh}', b: 'After 40 years in this neighborhood, I thought I knew every shop on {street}. But {place} just opened and the quality is outstanding.' },
    { t: 'Hidden gem alert — {nh}', b: '{place}. {street}. Go. Dont ask questions. Just order the special.' },
    { t: 'Best laundromat in {nh}', b: 'Clean Spin on {street}. Machines actually work, its clean, and the drop-off service is $1/lb.' },
    { t: 'PHENOMENAL haircut at {street}', b: '{last} on {street} gave me the best cut I have ever had. $25. Book ahead tho.' },
    { t: '{place} — trust me on this one', b: '{place} on {street} deserves the hype. food was amazing, drinks were strong, and the bill didnt make me cry.' },
    { t: 'Best dumplings near {nh}', b: '{place} on {street}. 8 dumplings for $3.50. Pork and chive. Get the spicy sauce.' },
  ],
  question: [
    { t: 'Good gym near {nh}?', b: 'Just moved here. Looking for a no-frills gym with free weights. Budget $50-80/month.' },
    { t: 'Anyone know a good plumber?', b: 'Kitchen sink backed up. Need someone reliable who wont overcharge. {nh} area.' },
    { t: 'Best grocery store in {nh}?', b: 'New to the neighborhood. Where does everyone shop?' },
    { t: 'Dog-friendly restaurants in {nh}?', b: 'Have a well-behaved lab. Looking for places with outdoor seating that welcome dogs.' },
    { t: 'Best barber in {nh}?', b: 'Need a good fade. Tired of chain places.' },
    { t: 'Cheap eats in {nh}?', b: 'Im broke but hungry. What are the best meals under $10 around here?' },
    { t: 'where the good food at in {nh}??', b: 'just moved here from {city} and i need to find my spots asap. whats the go-to for late night eats??' },
    { t: 'Parking situation in {nh}?', b: 'Thinking about getting a car. How bad is street parking around here?' },
    { t: 'Internet provider — {nh}?', b: 'Moving to {nh}. Optimum or Fios? Need reliable wifi for WFH.' },
    { t: 'Reliable mechanic in {nh}?', b: 'Check engine light has been on for a week. Need someone honest near {street}.' },
    { t: 'Good pediatrician in {nh}?', b: 'New baby, need a pediatrician taking new patients.' },
    { t: 'Any good thrift stores in {nh}?', b: 'Trying to furnish my apartment without going broke.' },
    { t: 'Daycare recs for {nh}??', b: 'FTM going back to work in 3 months and I am PANICKING about childcare.' },
    { t: 'yo who does yall hair in {nh}', b: 'need a braider or stylist thats not gonna have me sitting for 9 hours.' },
    { t: 'tbh where do ppl go out in {nh}', b: 'im 23 and just moved here and i literally have no idea where ppl my age go on weekends.' },
  ],
  alert: [
    { t: 'Package thefts on {street}', b: 'Third package stolen this week. Be careful. Talk to your super.' },
    { t: 'Car break-ins — {street}, {nh}', b: 'Multiple car break-ins on {street} last night. Lock your cars, dont leave valuables visible.' },
    { t: 'Power outage in {nh}', b: 'Power out for 2 hours on {street} and surrounding blocks. Con Ed says 4 hour estimate.' },
    { t: 'RATS. SO MANY RATS. {street}', b: 'the trash situation on {street} and {street2} is out of control rn. rats literally having a block party.' },
    { t: 'Gas smell on {street} — {nh}', b: 'Strong gas smell near {street}. Called Con Ed. Be careful if you live nearby.' },
    { t: 'Flooding on {street} after rain', b: 'Street flooding bad near {street} and {street2}. Storm drains clogged.' },
    { t: 'Construction noise warning — {street}', b: 'Building going up at {street}. Expect jackhammering 7am-6pm for 2 weeks.' },
    { t: 'stolen bike — just happened on {street}', b: 'dude literally just cut my lock on {street} in broad daylight. black trek hybrid. if anyone sees it lmk' },
    { t: 'ICY SIDEWALKS — {nh}', b: 'nobody salted {street} and its a skating rink. be careful.' },
    { t: 'Pothole warning — {street}, {nh}', b: 'Massive pothole opened up on {street}. Almost took out my tire.' },
  ],
  'lost-and-found': [
    { t: 'Found wallet near {street}', b: 'Brown leather wallet on {street} near the subway. Has ID inside. DM me.' },
    { t: 'Lost dog — brown pit mix, {nh}', b: 'Slipped his collar near {street}. Very friendly, answers to Milo. Please call if seen.' },
    { t: 'Lost cat — gray tabby, {nh}', b: 'Indoor cat escaped near {street}. Gray tabby, green eyes. Answers to Luna.' },
    { t: 'Found phone on the {train} train', b: 'Found an iPhone at {street} station. Cracked screen. DM me with description.' },
    { t: 'PLEASE HELP — lost my dog in {nh}', b: 'small white poodle mix, pink collar, answers to Princess. last seen near {street}. reward $200' },
    { t: 'Found keys with blue keychain', b: 'Found on the bench near {street}. 3 keys + blue keychain. DM to claim.' },
    { t: 'Lost gold bracelet — {nh} area', b: 'Lost my grandmothers gold bracelet between {street} and {street2}. Huge sentimental value. Reward.' },
    { t: 'Missing parrot — yes, a parrot', b: 'Green and yellow parrot flew out window on {street}. His name is Mango. He says "hello baby."' },
  ],
  event: [
    { t: 'Block party this Saturday — {street}', b: '{street} between {street2} and {street3}. DJ, food, kids activities. 2pm-8pm. Free.' },
    { t: 'Free yoga in the park — {nh}', b: 'Every Saturday at 9am at {street} park. All levels welcome. Bring your own mat.' },
    { t: 'Open mic night — {nh}', b: '{place} hosting open mic every Thursday at 8pm. Comedy, poetry, music.' },
    { t: 'Farmers market opens this weekend', b: 'The {nh} farmers market is back! Sundays 8am-2pm at {street}.' },
    { t: 'Free outdoor movie — {nh}', b: 'Showing {movie} this Friday at sundown. Bring blankets and snacks.' },
    { t: 'anyone tryna come to this popup??', b: 'theres a sick popup market at {place} on {street} this saturday. local artists, vintage clothes.' },
    { t: 'Salsa night — {nh}', b: 'Free salsa lessons + dancing at {place} every Wednesday 7-10pm. No partner needed.' },
    { t: 'Trivia night @ {place} — {nh}', b: 'Every Tuesday at 8pm. Teams of 2-6. $50 bar tab for winners.' },
    { t: 'Comedy show — {place}, {nh}', b: 'Stand-up comedy at {place} every Friday. $10 cover.' },
    { t: '{nh} Night Market Returns!', b: 'Every Friday evening. 50+ food vendors, live music, crafts. 5pm-11pm. Bring cash.' },
  ],
  'stoop-sale': [
    { t: 'Stoop sale Saturday — {street}, {nh}', b: 'Clothes, books, kitchen stuff, furniture. Everything must go. Cash or Venmo.' },
    { t: 'Moving sale — everything cheap', b: 'Leaving NYC. Furniture, electronics, clothes, art. {street}, {nh}. Saturday and Sunday.' },
    { t: 'MASSIVE stoop sale — {street}', b: 'My wife said if I dont get rid of half my stuff shes leaving. Her loss is your gain.' },
    { t: 'everything $5 or less — stoop sale', b: 'books $1, clothes $2-5, kitchen stuff $3-5, shoes $5. {street} in {nh}. saturday at 10am.' },
    { t: 'Vintage stoop sale — {nh}', b: 'Vintage clothing, records, mid-century decor. {street} this Saturday.' },
  ],
  'garage-sale': [
    { t: 'Garage sale — tools and sports gear', b: 'Clearing out. Power tools, bikes, camping gear. {street}, {nh}. Saturday 8am-2pm.' },
    { t: 'Estate sale — everything must go', b: 'Entire household. Furniture, kitchenware, art, antiques. {street}, {nh}.' },
    { t: 'HUGE garage sale — {nh}', b: '3 car garage full of stuff. Appliances, exercise equipment, tools. {street}.' },
    { t: 'garage sale this sat — {nh}', b: 'got tools, auto parts, fishing gear, old vinyl. {street}. starting at 8am. come thru' },
  ],
  volunteer: [
    { t: 'Soup kitchen needs volunteers — {nh}', b: 'The {nh} Community Kitchen needs help Saturdays 8am-12pm. Serving 200+ meals.' },
    { t: 'Park cleanup this weekend', b: 'Help clean up the park near {street}. Bags and gloves provided. Saturday 10am.' },
    { t: 'Dog shelter needs walkers — {nh}', b: 'Animal Care Center near {street} needs volunteer dog walkers.' },
    { t: 'Community fridge needs stockers — {nh}', b: 'The community fridge on {street} needs people to stock it regularly.' },
  ],
  carpool: [
    { t: 'Daily carpool — {nh} to Midtown', b: 'I drive to Midtown East every weekday. Leave 7:30am. Split gas and tolls.' },
    { t: 'anyone driving to {city} this weekend?', b: 'need a ride. will split gas and tolls. can meet anywhere in {nh}.' },
    { t: 'IKEA run this weekend — who needs a ride?', b: 'Driving to IKEA Saturday from {nh}. Got room. Split gas.' },
    { t: 'Weekend carpool to Costco', b: 'Going to Costco Saturday. Room for 2 people and groceries. Split gas.' },
  ],
  'pet-sighting': [
    { t: 'Gray cat spotted — {street}, {nh}', b: 'Small gray cat with white paws near {street} for 3 days. No collar.' },
    { t: 'Loose dog — {nh} area', b: 'Medium brown dog running loose near {street}. No collar. Looks scared.' },
    { t: 'ORANGE CAT ON {street}', b: 'Big fluffy orange tabby sitting outside {place}. Very friendly. No collar but looks well fed.' },
  ],
  welcome: [
    { t: 'Just moved to {nh} — hello!', b: 'Moved from {city} last week. Near {street}. Would love recommendations!' },
    { t: 'New to {nh} — looking for friends', b: 'Late 20s, into {hobby} and {hobby2}. Anyone want to grab coffee?' },
    { t: 'hiii {nh}!! just moved here!!', b: 'moved from {city} and im SO EXCITED. someone pls tell me the best brunch spots' },
  ],
  group: [
    { t: '{nh} running group — all levels', b: 'We run 3x/week. All paces welcome. Meet at {street} park.' },
    { t: 'Book club starting in {nh}', b: 'Monthly at {place}. First book: {book}. All welcome.' },
    { t: '{nh} Board Game Night', b: 'Every Wednesday at 7pm at {place}. Catan, Ticket to Ride, Codenames. Just come!' },
    { t: 'who tryna start a basketball league in {nh}', b: 'courts on {street} are open saturday mornings. dm me if u wanna play.' },
  ],
}

// ─── Listing templates ───
const LISTINGS = {
  'for-sale': [
    { sub: 'furniture', t: ['Solid wood dining table — seats 6','Mid-century modern couch','IKEA Kallax shelf, white','Vintage leather armchair','Queen bed frame + headboard','Standing desk, adjustable'], p: [15000,40000,6000,20000,18000,25000], d: ['Moving, must sell. Cash only, you haul.','2 years old, no stains.','Great condition.','Real leather, some patina.','Sturdy, no squeaks.','Electric motor, 28-48 inches.'] },
    { sub: 'electronics', t: ['MacBook Pro M2, 16GB','PS5 + 2 controllers','Samsung 55" 4K TV','AirPods Pro 2nd gen, sealed','iPad Air 5th gen','Nintendo Switch OLED + games'], p: [110000,38000,30000,18000,40000,28000], d: ['Barely used. Battery health 98%.','Original box. Works perfectly.','Smart TV, wall mounted.','Sealed box. Gift duplicate.','WiFi model + Apple Pencil.','Mario Kart + Zelda included.'] },
    { sub: 'clothing-accessories', t: ['North Face puffer, size M','Vintage Levis 501s, 32x32','Nike AF1s, size 10, DS','Timberland boots, size 11'], p: [12000,6500,11000,10000], d: ['700 fill. Warm.','Straight leg, actual vintage.','Deadstock, never worn.','Worn one winter.'] },
    { sub: 'bikes', t: ['Trek FX3 hybrid','Specialized Allez road bike','E-bike, 500W hub motor','Fixie, matte black'], p: [50000,60000,80000,25000], d: ['Disc brakes, carbon fork.','Shimano 105. Fast and light.','28mph top speed. 40 mile range.','Clean build. Flip flop hub.'] },
    { sub: 'free-stuff', t: ['Free couch — you haul','Moving boxes, come grab','Books — 3 boxes','Plant collection, 8 plants'], p: [0,0,0,0], d: ['Gray sectional. Pick up Sunday.','About 30 boxes. First come first served.','Moving, cant take them.','Spider plant, pothos, snake plant etc.'] },
    { sub: 'vinyl-records', t: ['Jazz collection — 40 records','Hip hop vinyl lot — 25 albums','90s R&B collection — 15 records'], p: [30000,20000,12000], d: ['Coltrane, Monk, Davis. All VG+.','Nas, Biggie, Tribe, De La Soul.','TLC, Aaliyah, SWV.'] },
    { sub: 'sneakers-streetwear', t: ['Jordan 4 Bred, sz 10, DS','New Balance 990v6','Dunks Low Panda, sz 10.5','Adidas Samba OG'], p: [25000,16000,13000,9500], d: ['Deadstock with SNKRS receipt.','Made in USA. Best runner.','Basically new. No box.','Classic. Goes with everything.'] },
  ],
  housing: [
    { sub: 'apartments', t: ['Sunny 1BR, {nh}, $2,100/mo','Spacious 2BR, renovated, {nh}','Studio, exposed brick, {nh}','Large 3BR, laundry in unit, {nh}','Rent-stabilized 1BR, {nh}'], p: [210000,280000,165000,350000,150000], d: ['South-facing. Heat included.','New appliances, hardwood.','Top floor walkup. Quiet.','Rare W/D in unit.','Below market. Dont miss it.'] },
    { sub: 'rooms-shared', t: ['Room in 3BR, {nh}, $1,200','Private room, shared bath, {nh}','Furnished room, utils incl, {nh}'], p: [120000,95000,130000], d: ['Chill roommates. Near train.','Quiet apt. Working professionals.','Bed, desk, wifi included.'] },
    { sub: 'sublets', t: ['Summer sublet 1BR, {nh}','3-month studio sublet, {nh}'], p: [200000,160000], d: ['June-Aug. Fully furnished.','Great location. Leaving for internship.'] },
  ],
  services: [
    { sub: 'cleaning', t: ['{biz} Cleaning — {nh}','Deep Clean Experts — {nh}','Move In/Out Cleaning'], p: [12000,20000,25000], d: ['Licensed, insured. 10 years experience.','Ovens, fridges, baseboards. We go deep.','Get your deposit back.'] },
    { sub: 'handyman', t: ['Handyman — No Job Too Small, {nh}','Furniture Assembly + Mounting','Small Repairs — {nh}'], p: [7500,6000,7000], d: ['Shelves, TV mounting, minor plumbing.','IKEA, TV mount, pictures. Flat rate.','Faucets, doors, drywall.'] },
    { sub: 'moving-hauling', t: ['2 Movers + Truck — $300','Junk Removal — Same Day'], p: [30000,15000], d: ['Licensed. Insured. No hidden fees.','Furniture, appliances, debris.'] },
    { sub: 'tutoring', t: ['Math Tutor, All Levels — {nh}','SAT/ACT Prep — 1500+ Scorer','Spanish Lessons — Native Speaker'], p: [6000,8000,5000], d: ['Columbia grad. Algebra to Calculus.','Scored 1560.','From Mexico City. All levels.'] },
    { sub: 'photography', t: ['NYC Portrait Photographer','Event Photography — {nh}','Headshots — Professional'], p: [20000,50000,17500], d: ['Natural light. Parks, rooftops.','Birthdays, corporate. 48hr delivery.','LinkedIn, acting, dating apps.'] },
  ],
  jobs: [
    { sub: 'restaurant-hospitality', t: ['Line Cook — {nh} Restaurant','Server/Bartender — {nh} Bar','Barista — Coffee Shop, {nh}'], p: [0,0,0], d: ['$18-22/hr + tips.','$15/hr + tips ($200-400/night).','$17/hr + tips.'] },
    { sub: 'tech-engineering', t: ['Junior Frontend Dev — Hybrid','Senior Backend Engineer — {nh}','Data Analyst — Healthcare'], p: [0,0,0], d: ['$70-90K. React/Next.js.','$150-180K. Python, PostgreSQL, AWS.','$85-110K. SQL, Python, Tableau.'] },
    { sub: 'trades-skilled-labor', t: ['Electrician Apprentice — Union','Licensed Plumber — Experienced','HVAC Technician — Commercial'], p: [0,0,0], d: ['$25-35/hr + benefits.','$40-60/hr. 5+ yrs NYC experience.','$30-45/hr. EPA certified.'] },
    { sub: 'retail', t: ['Retail Associate — {nh}','Store Manager — Boutique, {nh}'], p: [0,0], d: ['$16-18/hr. Flexible schedule.','$50-60K. Retail mgmt required.'] },
  ],
  gigs: [
    { sub: 'moving-help', t: ['Help moving Saturday — {nh}','Furniture disassembly, 2 hrs'], p: [10000,8000], d: ['Need 2 people.','IKEA bed + desk. Take apart.'] },
    { sub: 'dog-walking', t: ['Dog walker weekdays — {nh}','2 dogs, lunchtime walk'], p: [2000,2500], d: ['30 min noon walk Mon-Fri.','Two small dogs. 30 minutes.'] },
    { sub: 'delivery-runs', t: ['Deliver 5 packages — Manhattan','Grocery run for elderly neighbor'], p: [7500,3000], d: ['All midtown. Small packages. Today.','Weekly grocery run. Easy.'] },
  ],
  tickets: [
    { sub: 'concerts', t: ['2 tix — MSG, Feb 22','Floor seats — Barclays'], p: [15000,20000], d: ['Section 112. Cant make it.','Row 5. Face value.'] },
    { sub: 'sports', t: ['Knicks tix — MSG lower level','Yankees opening day — 2 tix'], p: [17500,25000], d: ['Section 105. Real seats.','First game of the season.'] },
    { sub: 'broadway', t: ['Hamilton — orchestra, 2 seats','Wicked — Saturday matinee'], p: [30000,18000], d: ['Row M center.','Mezzanine, great view.'] },
  ],
  pets: [
    { sub: 'adoption', t: ['Sweet tabby needs home','2 kittens, sisters','Rescue lab mix, great w/ kids'], p: [0,0,0], d: ['3yo, spayed, all shots. Indoor.','8wks, litter trained.','2yo, neutered, vaccinated.'] },
  ],
  personals: [
    { sub: 'activity-partners', t: ['Running partner — Central Park','Tennis partner — weekdays','Hiking buddy — weekends'], p: [0,0,0], d: ['Training for half marathon. 8-9 min pace.','Intermediate. 7am. Public courts.','Day trips. Car available.'] },
  ],
  barter: [
    { sub: 'goods-for-goods', t: ['Trade: KitchenAid for bike','Swap: PS5 for Switch + cash'], p: [0,0], d: ['Red stand mixer for commuter bike.','PS5 disc for Switch OLED + $100.'] },
  ],
  resumes: [
    { sub: 'software-engineering', t: ['Full Stack Dev — 5 yrs exp','Frontend Engineer — React/Next'], p: [0,0], d: ['React, Node, PostgreSQL.','3 years React, TypeScript.'] },
    { sub: 'creative-media', t: ['Graphic Designer — 7 yrs','Videographer/Editor — Freelance'], p: [0,0], d: ['Adobe Suite, Figma.','Final Cut, DaVinci.'] },
  ],
}

// ─── Reply pool ───
const REPLIES = [
  'Great recommendation, thanks!', 'This is super helpful.', 'Can confirm — went there last week.',
  '+1 on this.', 'Thanks for the heads up!', 'Are they open weekends?', 'How much does it usually cost?',
  'Been meaning to check this out.', 'Sending this to my partner.', 'Honestly the best in the borough.',
  'Bookmarked. Thank you.', 'The staff is so friendly there.', 'This is why I love this neighborhood.',
  'facts.', 'this is the one fr', 'yoooo I needed this info thank u', 'W post', 'bro THANK YOU',
  'say less im going tomorrow', 'no because WHY did nobody tell me about this sooner',
  'I respectfully disagree but appreciate you sharing.', 'As a longtime resident, I can confirm.',
  'My husband and I will check this out.', 'omg yes yes yes!!', 'ok but have yall tried the one on the next block tho?',
  'Noted. Thanks.', 'lol only in NYC', 'screenshotted this whole thread', 'Anyone want to go together? DM me.',
  'How did I not know about this?? I live 2 blocks away!', 'top tier post right here', 'tysm!!!!',
  'My abuela swears by this place.', 'been here 20 years and I STILL learn new stuff from this app',
  'Welcome to the neighborhood!', 'Let me know if you need anything else.', 'DM me, I have a recommendation.',
]

// ════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════

async function main() {
  console.log('🚀 Burst seed — 500 actions\n')

  // 1. Fetch all seed users
  console.log('1. Fetching seed users...')
  const users = await supaGet('users', 'email=like.*@example.com&select=id,name,email,selfie_url,verified&limit=600')
  console.log(`   Found ${users.length} seed users`)

  if (users.length === 0) {
    console.error('❌ No seed users found! Run seed-platform.mjs first.')
    process.exit(1)
  }

  // 2. Ensure all users have avatar + verified
  console.log('2. Updating profiles — avatars + verified...')
  let updated = 0
  for (const u of users) {
    const needs = {}
    if (!u.selfie_url) needs.selfie_url = makeAvatar(u.name || 'User', u.id)
    if (!u.verified) needs.verified = true
    if (Object.keys(needs).length > 0) {
      await supaUpdate('users', u.id, needs)
      updated++
    }
  }
  console.log(`   Updated ${updated} profiles (${users.length - updated} already had avatar + verified)`)

  // 3. Assign borough/neighborhood to each user
  const seedUsers = users.map(u => {
    const borough = pick(BOROUGH_WEIGHTS)
    const nh = pick(BOROUGHS[borough].nhs)
    return { id: u.id, email: u.email, name: u.name || 'User', _borough: borough, _nh: nh }
  })

  // 4. Generate 500 actions: ~300 porch + ~150 listings + ~50 replies
  const PORCH_TARGET = 300
  const LISTING_TARGET = 150
  const REPLY_TARGET = 50

  console.log(`3. Generating ${PORCH_TARGET} porch posts...`)
  const porchRows = []
  for (let i = 0; i < PORCH_TARGET; i++) {
    const user = pick(seedUsers)
    const type = pickWeighted(PORCH_TYPES, PORCH_WEIGHTS)
    const templates = PORCH[type]
    if (!templates || templates.length === 0) continue
    const tmpl = pick(templates)
    const vars = makeVars(user)
    const tone = getTone(user.id)

    let title = applyTone(fill(tmpl.t, vars).slice(0, 100), tone)
    let body = applyTone(fill(tmpl.b, vars).slice(0, 500), tone)

    const expH = type === 'alert' ? 48 : (type === 'lost-and-found' || type === 'pet-sighting') ? 72 : 720
    const pinned = (type === 'lost-and-found' || type === 'pet-sighting') && Math.random() < 0.4

    // Stagger created_at across last 14 days
    const daysBack = Math.random() * 14
    const created = new Date(Date.now() - daysBack * 86400000).toISOString()

    porchRows.push({
      user_id: user.id,
      post_type: type,
      title,
      body,
      borough_slug: user._borough,
      neighborhood_slug: user._nh,
      pinned,
      expires_at: new Date(Date.now() - daysBack * 86400000 + expH * 3600000).toISOString(),
      created_at: created,
    })
  }
  const porchInserted = await supaInsert('porch_posts', porchRows)
  console.log(`   Inserted ${porchInserted} porch posts`)

  console.log(`4. Generating ${LISTING_TARGET} listings...`)
  const listingRows = []
  for (let i = 0; i < LISTING_TARGET; i++) {
    const user = pick(seedUsers)
    const catKeys = Object.keys(LISTINGS)
    const catSlug = pick(catKeys)
    const subs = LISTINGS[catSlug]
    const subGrp = pick(subs)
    const idx = rb(0, subGrp.t.length - 1)
    const vars = makeVars(user)
    const tone = getTone(user.id)

    let title = applyTone(fill(subGrp.t[idx], vars).slice(0, 200), tone)
    let description = applyTone(fill(subGrp.d[idx], vars), tone)

    const daysBack = Math.random() * 14
    const created = new Date(Date.now() - daysBack * 86400000).toISOString()

    listingRows.push({
      user_id: user.id,
      title,
      description,
      price: subGrp.p[idx] || null,
      category_slug: catSlug,
      subcategory_slug: subGrp.sub,
      images: '{}',
      location: `${nhName(user._nh)}, ${nhName(user._borough)}`,
      lat: BOROUGHS[user._borough].lat + (Math.random() - 0.5) * 0.04,
      lng: BOROUGHS[user._borough].lng + (Math.random() - 0.5) * 0.04,
      status: 'active',
      expires_at: new Date(Date.now() - daysBack * 86400000 + 30 * 86400000).toISOString(),
      created_at: created,
    })
  }
  const listInserted = await supaInsert('listings', listingRows)
  console.log(`   Inserted ${listInserted} listings`)

  // 5. Generate replies to recent porch posts
  console.log(`5. Generating ${REPLY_TARGET} replies...`)
  const recentPosts = await supaGet('porch_posts', 'select=id,user_id&order=created_at.desc&limit=200')
  const replyRows = []
  if (recentPosts.length > 0) {
    for (let i = 0; i < REPLY_TARGET; i++) {
      const post = pick(recentPosts)
      const user = pick(seedUsers.filter(u => u.id !== post.user_id)) || pick(seedUsers)
      const tone = getTone(user.id)
      const body = applyTone(pick(REPLIES), tone)
      const daysBack = Math.random() * 7

      replyRows.push({
        post_id: post.id,
        user_id: user.id,
        body,
        helpful_count: Math.random() < 0.3 ? rb(1, 12) : 0,
        created_at: new Date(Date.now() - daysBack * 86400000).toISOString(),
      })
    }
    const replyInserted = await supaInsert('porch_replies', replyRows)
    console.log(`   Inserted ${replyInserted} replies`)
  }

  console.log(`\n✅ Done! Total: ${porchInserted} porch + ${listInserted} listings + ${replyRows.length} replies = ${porchInserted + listInserted + replyRows.length} actions`)
}

main().catch(console.error)
