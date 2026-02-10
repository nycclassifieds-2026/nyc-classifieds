#!/usr/bin/env node
/**
 * Seed NYC Classifieds with 500 users, 1500+ posts, realistic NYC content.
 * Run: node scripts/seed-platform.mjs
 */

const SUPABASE_URL = 'https://vpeozixllzdwzqniopfn.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZW96aXhsbHpkd3pxbmlvcGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY3MTQwNiwiZXhwIjoyMDg2MjQ3NDA2fQ.U9w4ZqhUiFDHTjH4taLGfH5Y9a2trsEH-BqLV__znq0'

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
}

async function supaInsert(table, rows) {
  const batchSize = 50
  const all = []
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
    const data = await res.json()
    all.push(...data)
    if (i % 200 === 0 && i > 0) process.stdout.write(`  ${all.length}...`)
  }
  return all
}

// ─── Helpers ───
function pick(a) { return a[Math.floor(Math.random()*a.length)] }
function pickN(a,n) { return [...a].sort(()=>Math.random()-.5).slice(0,n) }
function rb(a,b) { return a+Math.floor(Math.random()*(b-a+1)) }
function rDate(daysBack) {
  const ms = Date.now() - Math.random()*daysBack*86400000
  return new Date(ms).toISOString()
}
function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') }

// ─── Geography ───

const BOROUGHS = {
  manhattan:      { lat:40.7831, lng:-73.9712, nhs:['alphabet-city','battery-park-city','carnegie-hill','chelsea','chinatown','east-harlem','east-village','financial-district','flatiron','gramercy','greenwich-village','hamilton-heights','harlem','hells-kitchen','hudson-yards','inwood','kips-bay','koreatown','lenox-hill','lincoln-square','little-italy','lower-east-side','manhattan-valley','meatpacking-district','midtown-east','midtown-west','morningside-heights','murray-hill','noho','nolita','roosevelt-island','soho','stuyvesant-town','sugar-hill','times-square','tribeca','two-bridges','upper-east-side','upper-west-side','washington-heights','west-village'] },
  brooklyn:       { lat:40.6782, lng:-73.9442, nhs:['bay-ridge','bed-stuy','bensonhurst','boerum-hill','borough-park','brighton-beach','brooklyn-heights','brownsville','bushwick','canarsie','carroll-gardens','clinton-hill','cobble-hill','coney-island','crown-heights','downtown-brooklyn','dumbo','dyker-heights','east-new-york','flatbush','fort-greene','greenpoint','kensington','midwood','park-slope','prospect-heights','red-hook','sheepshead-bay','sunset-park','williamsburg'] },
  queens:         { lat:40.7282, lng:-73.7949, nhs:['astoria','bayside','bellerose','briarwood','college-point','corona','douglaston','elmhurst','far-rockaway','flushing','forest-hills','fresh-meadows','glen-oaks','howard-beach','jackson-heights','jamaica','kew-gardens','little-neck','long-island-city','maspeth','middle-village','ozone-park','rego-park','ridgewood','rockaway-beach','st-albans','sunnyside','whitestone','woodhaven','woodside'] },
  bronx:          { lat:40.8448, lng:-73.8648, nhs:['belmont','concourse','fordham','highbridge','hunts-point','kingsbridge','morris-park','mott-haven','norwood','pelham-bay','riverdale','south-bronx','throgs-neck','tremont','wakefield'] },
  'staten-island':{ lat:40.5795, lng:-74.1502, nhs:['annadale','eltingville','great-kills','huguenot','new-dorp','princes-bay','st-george','stapleton','tompkinsville','tottenville'] },
}

const BOROUGH_DIST = [
  ...Array(150).fill('manhattan'),
  ...Array(150).fill('brooklyn'),
  ...Array(100).fill('queens'),
  ...Array(60).fill('bronx'),
  ...Array(40).fill('staten-island'),
]

// ─── Demographics (reflecting actual NYC) ───

const NAMES = {
  hispanic: {
    first: ['Carlos','Maria','Luis','Rosa','Miguel','Carmen','Jose','Ana','Diego','Sofia','Alejandro','Isabella','Fernando','Valentina','Ricardo','Lucia','Gabriel','Elena','Javier','Camila','Eduardo','Daniela','Roberto','Adriana','Marcos','Patricia','Hector','Yolanda','Raul','Marisol','Pedro','Gloria','Oscar','Beatriz','Manuel','Silvia','Jorge','Alicia'],
    last: ['Rodriguez','Santos','Garcia','Martinez','Lopez','Rivera','Cruz','Gomez','Diaz','Morales','Torres','Vargas','Castillo','Herrera','Reyes','Flores','Medina','Ramirez','Ortiz','Delgado','Mendoza','Soto','Vega','Salazar','Guerrero','Acosta'],
  },
  black: {
    first: ['Marcus','Aaliyah','Terrence','Keisha','Andre','Tamika','Malik','Jasmine','DeShawn','Imani','Jamal','Ebony','Kwame','Tanya','Dante','Aisha','Cornell','Simone','Rashid','Monique','Darius','Latoya','Malcolm','Nia','Elijah','Zara','Isaiah','Destiny','Kendrick','Brianna','Xavier','Kiara','Tyrone','LaShonda'],
    last: ['Williams','Johnson','Brown','Davis','Wilson','Jackson','Thomas','Taylor','Moore','Harris','Robinson','Walker','Allen','Young','King','Wright','Hill','Scott','Green','Adams','Carter','Mitchell','Campbell','Parker','Turner','Cooper','Bailey','Howard','Brooks','Reed'],
  },
  asian: {
    first: ['Wei','Mei','Jin','Soo-Min','Chen','Li','Min-Jun','Jia','Hiroshi','Yuki','Kenji','Sakura','Takeshi','Yuna','Akira','Haruki'],
    last: ['Chen','Wang','Li','Zhang','Liu','Yang','Kim','Park','Choi','Jeon','Lee','Wu','Huang','Lin','Xu','Lam','Tan','Ng','Tran','Nguyen','Pham','Vo'],
  },
  south_asian: {
    first: ['Raj','Priya','Deepak','Ananya','Ravi','Nisha','Vikram','Sunita','Arjun','Leela','Amir','Fatima','Sanjay','Meera','Dev','Kavitha','Rohit','Anjali','Aarav','Diya'],
    last: ['Patel','Singh','Sharma','Gupta','Kumar','Shah','Mohammed','Hassan','Ali','Ibrahim','Ahmed','Chowdhury','Khan','Dasgupta','Nair','Rao','Reddy','Joshi','Malhotra','Chatterjee'],
  },
  caribbean: {
    first: ['Winston','Marcia','Desmond','Claudette','Errol','Beverley','Lennox','Sonia','Clive','Donna','Fitzroy','Pauline','Trevor','Joan','Neville','Sharon'],
    last: ['Campbell','Stewart','Brown','Williams','Thomas','Henry','Clarke','Francis','Charles','Baptiste','Pierre','Jean','Toussaint','Dupont','Joseph','St. Louis'],
  },
  middle_eastern: {
    first: ['Omar','Layla','Karim','Nadia','Tariq','Yasmin','Hassan','Leila','Samir','Dina','Khalid','Rania','Fadi','Amira','Zain','Hana'],
    last: ['Mohammed','Hassan','Ali','Ibrahim','Ahmed','Khalil','Mansour','Haddad','Khoury','Abadi','Saleh','Nasser','Farah','Habib','Said','Elias'],
  },
  eastern_euro: {
    first: ['Dmitri','Natasha','Pavel','Katarina','Ivan','Olga','Andrei','Svetlana','Nikolai','Tatiana','Sergei','Elena','Boris','Irina','Viktor','Marina','Alexei','Anya','Mikhail','Yulia'],
    last: ['Volkov','Petrov','Ivanov','Kuznetsov','Popov','Kowalski','Nowak','Wojcik','Szabo','Kovacs','Horvat','Bogdan','Kravchenko','Sokolov','Morozov'],
  },
  italian: {
    first: ['Tony','Gina','Sal','Vinny','Angela','Frankie','Dominic','Carmela','Anthony','Lucia','Joey','Marco','Teresa','Giovanni','Sophia'],
    last: ['Rossi','Colombo','Romano','Ricci','Russo','Esposito','Bianchi','Moretti','Ferraro','Barbieri','DeLuca','Santoro','Marini','Conti','Leone'],
  },
  irish: {
    first: ['Liam','Siobhan','Connor','Bridget','Declan','Erin','Brendan','Fiona','Niall','Ciara','Cormac','Aoife','Ronan','Sinead','Kieran','Nora','Seamus','Maeve'],
    last: ['Murphy','Kelly','OBrien','Sullivan','Walsh','Fitzgerald','Byrne','Ryan','Gallagher','Doyle','Brennan','Quinn','Burke','Lynch','McCarthy'],
  },
  white_other: {
    first: ['Michael','Sarah','James','Jennifer','David','Amanda','Brian','Megan','Kevin','Katie','Patrick','Nicole','Tim','Lauren','Sean','Emily','Chris','Rachel','Matt','Heather','Dan','Kristin','Jake','Allison','Ryan','Stephanie','Mark','Ashley','Tom','Colleen'],
    last: ['Miller','Anderson','Clark','Lewis','Hall','Baker','Nelson','Carter','Mitchell','Perez','Roberts','Turner','Phillips','Campbell','Parker','Evans','Edwards','Collins','Stewart','Morris'],
  },
}

// Demographic distribution: reflects NYC ~29% Hispanic, 24% Black, 14% Asian, 7% SA, 4% Caribbean, 3% ME, 3% EEuro, 6% Italian, 4% Irish, 6% White other
const DEMO_WEIGHTS = [
  ...Array(29).fill('hispanic'),
  ...Array(24).fill('black'),
  ...Array(14).fill('asian'),
  ...Array(7).fill('south_asian'),
  ...Array(4).fill('caribbean'),
  ...Array(3).fill('middle_eastern'),
  ...Array(3).fill('eastern_euro'),
  ...Array(6).fill('italian'),
  ...Array(4).fill('irish'),
  ...Array(6).fill('white_other'),
]

// ─── Business names ───

const BIZ_TEMPLATES = [
  // [pattern, categories]
  ['{last} Auto Repair', 'Auto Shop'],
  ['{last}\'s Dry Cleaning', 'Dry Cleaner'],
  ['{first}\'s Braids & Beauty', 'Beauty Salon'],
  ['{last}\'s Pizza', 'Restaurant'],
  ['{last} Hardware', 'General Contractor'],
  ['{last} Tax Services', 'Consulting'],
  ['{last} Plumbing', 'Plumber'],
  ['{first}\'s Bakery', 'Bakery'],
  ['{last} & Sons Construction', 'Construction'],
  ['{first}\'s Barbershop', 'Barbershop'],
  ['{last} Law Firm', 'Law Firm'],
  ['{last} Dental', 'Dental Office'],
  ['{first}\'s Nail Salon', 'Nail Salon'],
  ['{last} Electric', 'Electrician'],
  ['{last} Landscaping', 'Landscaping'],
  ['{first}\'s Flowers', 'Florist'],
  ['{last} Home Inspections', 'Home Inspector'],
  ['{last} Insurance Group', 'Insurance'],
  ['{first}\'s Pet Grooming', 'Pet Grooming'],
  ['{last} Moving Co', 'Moving Company'],
  ['{first}\'s Cafe', 'Cafe'],
  ['{last} Realty', 'Real Estate'],
  ['{first}\'s Food Truck', 'Food Truck'],
  ['{last} HVAC', 'Handyman'],
  ['{first}\'s Yoga Studio', 'Yoga Studio'],
  ['{last} Locksmith', 'Locksmith'],
  ['{first}\'s Catering', 'Catering'],
  ['{last} Photography', 'Photographer'],
  ['{first}\'s Cleaning Service', 'Cleaning Service'],
  ['{last} IT Solutions', 'IT Services'],
  ['{first}\'s Tailoring', 'Tailor'],
  ['{last} Fitness', 'Fitness Studio'],
  ['{last} Roofing', 'Roofing'],
  ['{last} Security', 'Security'],
  ['{first}\'s Deli', 'Deli & Bodega'],
  ['{last} Accounting', 'Consulting'],
  ['{first}\'s Dog Walking', 'Dog Walker'],
  ['{last} Painting Co', 'Painter'],
  ['{last} Pest Control', 'Pest Control'],
  ['{first}\'s Music Studio', 'Music Studio'],
]

// ─── Streets ───
const STREETS = ['1st Ave','2nd Ave','3rd Ave','Broadway','Lexington Ave','Madison Ave','Park Ave','Amsterdam Ave','Columbus Ave','5th Ave','6th Ave','7th Ave','8th Ave','Atlantic Ave','Flatbush Ave','DeKalb Ave','Myrtle Ave','Bedford Ave','Grand St','Delancey St','Houston St','Bleecker St','14th St','23rd St','34th St','42nd St','57th St','72nd St','86th St','96th St','110th St','125th St','145th St','Fordham Rd','Tremont Ave','Jerome Ave','Ditmars Blvd','Steinway St','Jamaica Ave','Hillside Ave','Metropolitan Ave','Vernon Blvd','Queens Blvd','Northern Blvd','Roosevelt Ave','Victory Blvd','Bay St','Hylan Blvd']

const PLACES = ['Joes','Corner Spot','La Esquina','The Local','Golden Dragon','Noodle House','Cafe Roma','Taqueria Mexico','Pho Saigon','Sushi Palace','The Bean','Green Leaf','Mamas Kitchen','The Bodega','Blue Moon','Red Hook Coffee','Sunset Diner','Brooklyn Bagels','Astoria Bites','Harlem Soul','The Halal Cart','Dumpling House','Empanada Mama','Peking Duck House','Russ & Daughters']
const CITIES = ['Boston','Chicago','LA','Miami','Philly','DC','Atlanta','Portland','Denver','Seattle','Austin','San Francisco','Dallas','Minneapolis','Nashville','Detroit','Charlotte','New Orleans','Pittsburgh','Baltimore']
const HOBBIES = ['hiking','cooking','photography','running','reading','cycling','yoga','climbing','music','gaming','art','basketball','soccer','film','writing','coding','gardening','chess','dancing','boxing']
const MOVIES = ['Do The Right Thing','Goodfellas','The Warriors','Saturday Night Fever','Coming to America','Spider-Man Into the Spider-Verse','West Side Story','Taxi Driver','Ghostbusters','King Kong','Moonstruck','The French Connection']
const BOOKS = ['A Tree Grows in Brooklyn','The Great Gatsby','Invisible Man','The Goldfinch','Motherless Brooklyn','Americanah','Open City','Bonfire of the Vanities','A Visit from the Goon Squad','Oscar Wao']
const TRAINS = ['A','C','E','B','D','F','M','N','Q','R','W','1','2','3','4','5','6','7','G','J','Z','L']

function nhName(s) { return s.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) }
function fill(s,v) { return s.replace(/\{(\w+)\}/g,(_,k)=>v[k]||k) }

// ════════════════════════════════════════════════
// PORCH POST TEMPLATES
// ════════════════════════════════════════════════

const PORCH = {
  recommendation: [
    { t:'Best pizza in {nh} — hands down', b:'If you havent tried {place} on {street} you are missing out. Their margherita is perfect. Thin crust, fresh mozz, basil from their garden. Cash only.' },
    { t:'Amazing dentist in {nh}', b:'Dr. {last} on {street} is incredible. No wait, gentle, takes most insurance. My whole family goes there now.' },
    { t:'Great daycare in {nh}', b:'Little Stars on {street} has been amazing for our toddler. Clean, structured, and the staff genuinely care. Waitlist is worth it.' },
    { t:'Best coffee shop for remote work in {nh}', b:'The cafe on {street} has great wifi, outlets everywhere, and they dont rush you. Oat milk latte is incredible.' },
    { t:'Tailor recommendation — {nh}', b:'{last} Tailoring on {street}. Hemmed my pants perfectly for $12. Quick turnaround, fair prices, been there 20 years.' },
    { t:'Best laundromat in {nh}', b:'Clean Spin on {street}. Machines actually work, its clean, and the drop-off service is $1/lb. Game changer.' },
    { t:'Amazing Thai food — {nh}', b:'Just discovered {place} on {street}. The pad see ew is the best Ive had outside Thailand. Spice level is legit. BYOB too.' },
    { t:'Best bodega breakfast in {nh}', b:'The bodega on {street} makes a bacon egg and cheese that changed my life. Fresh roll, perfect egg. $5. No cap.' },
    { t:'Shoutout to {place} in {nh}', b:'Been going here for years and they never disappoint. Staff remembers your order. This is what makes NYC special.' },
    { t:'Best dumplings near {nh}', b:'{place} on {street}. 8 dumplings for $3.50. Pork and chive. Get the spicy sauce. Thank me later.' },
    { t:'Locksmith saved me — {nh}', b:'Locked out at midnight. {last} Locksmith came in 20 minutes, $60, no BS upcharge. Saving their number forever.' },
    { t:'Great vet in {nh}', b:'Dr. {last} at {street} Animal Hospital. Gentle with my anxious dog, transparent pricing, took the time to explain everything.' },
  ],
  question: [
    { t:'Good gym near {nh}?', b:'Just moved here. Looking for a no-frills gym with free weights. Not Planet Fitness. Budget around $50-80/month.' },
    { t:'Anyone know a good plumber?', b:'Kitchen sink backed up and Draino isnt cutting it. Need someone reliable who wont overcharge. {nh} area.' },
    { t:'Best grocery store in {nh}?', b:'New to the neighborhood. Where does everyone shop? Looking for good produce and reasonable prices.' },
    { t:'Parking situation in {nh}?', b:'Thinking about getting a car. How bad is street parking around here? Any monthly lots that arent insane?' },
    { t:'Dog-friendly restaurants in {nh}?', b:'Have a well-behaved lab. Looking for places with outdoor seating that welcome dogs.' },
    { t:'Best barber in {nh}?', b:'Need a good fade. Tired of chain places. Who does everyone go to around here?' },
    { t:'Internet provider — {nh}?', b:'Moving to {nh}. Optimum or Fios? Anyone have experience? Need reliable wifi for WFH.' },
    { t:'Where to watch the game in {nh}?', b:'Looking for a sports bar with big screens, decent wings, not too packed. Any spots?' },
    { t:'Cheap eats in {nh}?', b:'Im broke but hungry. What are the best meals under $10 around here? Hit me with your spots.' },
    { t:'Quiet bar in {nh}?', b:'Looking for somewhere I can actually hear my date talk. Not looking for a club scene.' },
    { t:'Where to get fresh fish — {nh}?', b:'Tired of supermarket fish. Is there a proper fish market around {nh}? Trying to cook more at home.' },
    { t:'Good pediatrician in {nh}?', b:'New baby, need a pediatrician taking new patients. Prefer someone who doesnt rush appointments.' },
  ],
  alert: [
    { t:'Package thefts on {street}', b:'Third package stolen this week from our building lobby. Be careful. Delivery drivers leaving packages outside. Talk to your super.' },
    { t:'Fire hydrant open on {street}', b:'Hydrant open on {street} and {street2}. Water flooding the street. 311 called already.' },
    { t:'Car break-ins — {street}, {nh}', b:'Multiple car break-ins on {street} last night. Lock your cars, dont leave valuables visible. NYPD has been notified.' },
    { t:'Road closure — {street}', b:'Film crew has {street} blocked off today and tomorrow. Expect detours and no parking.' },
    { t:'Power outage in {nh}', b:'Power out for 2 hours on {street} and surrounding blocks. Con Ed says 4 hour estimate.' },
    { t:'Flooding on {street} after rain', b:'Street flooding bad near {street} and {street2}. Storm drains clogged. Watch your step, especially at night.' },
    { t:'Construction noise warning — {street}', b:'Building going up at {street}. Expect jackhammering 7am-6pm for the next 2 weeks. Buy earplugs.' },
    { t:'Gas smell on {street} — {nh}', b:'Strong gas smell near {street}. Called Con Ed. They said theyre sending someone. Be careful if you live nearby.' },
  ],
  'lost-and-found': [
    { t:'Found wallet near {street}', b:'Found a brown leather wallet on {street} near the subway. Has ID inside. DM me to identify and claim.' },
    { t:'Lost gold bracelet — {nh} area', b:'Lost my grandmothers gold bracelet between {street} and {street2}. Huge sentimental value. Reward offered.' },
    { t:'Found keys with blue keychain', b:'Found on the bench near {street}. 3 keys + a blue bottle opener keychain. DM to claim.' },
    { t:'Lost dog — brown pit mix, {nh}', b:'Slipped his collar near {street}. Brown and white pit, very friendly, answers to Milo. Please call if seen.' },
    { t:'Found phone on the {train} train', b:'Found an iPhone on the {train} at {street} station. Cracked screen. DM me with lock screen description.' },
    { t:'Lost cat — gray tabby, {nh}', b:'Indoor cat escaped through a window on {street}. Gray tabby, green eyes, white chest. Answers to Luna. Please help.' },
    { t:'Found AirPods case near {place}', b:'Found a white AirPods Pro case outside {place} on {street}. Still has charge. DM to claim.' },
  ],
  event: [
    { t:'Free yoga in the park — {nh}', b:'Every Saturday at 9am at {street} park. All levels welcome. Bring your own mat. 3 years running.' },
    { t:'Block party this Saturday — {street}', b:'{street} between {street2} and {street3} is having a block party. DJ, food, kids activities. 2pm-8pm. Free.' },
    { t:'Open mic night — {nh}', b:'{place} is hosting open mic every Thursday at 8pm. Comedy, poetry, music. Sign up at the bar.' },
    { t:'Farmers market opens this weekend', b:'The {nh} farmers market is back! Sundays 8am-2pm at {street}. Produce, bread, honey, flowers.' },
    { t:'Community garden volunteer day', b:'Help us get the {nh} garden ready for spring. This Saturday 10am-1pm. Tools provided.' },
    { t:'Free outdoor movie — {nh}', b:'Showing {movie} this Friday at sundown in the park. Bring blankets and snacks.' },
    { t:'Salsa night — {nh}', b:'Free salsa lessons + dancing at {place} every Wednesday 7-10pm. Beginners welcome. No partner needed.' },
    { t:'Kids art class — free, {nh}', b:'The community center on {street} is offering free art classes for kids 5-12. Saturdays 11am.' },
  ],
  'stoop-sale': [
    { t:'Stoop sale Saturday — {street}, {nh}', b:'Clothes, books, kitchen stuff, furniture. Everything must go. Starting 9am. Cash or Venmo.' },
    { t:'Moving sale — everything cheap', b:'Leaving NYC. Furniture, electronics, clothes, art. {street}, {nh}. Saturday and Sunday 8am-4pm.' },
    { t:'Multi-family stoop sale — {street}', b:'4 apartments clearing out. Tons of stuff. Kids clothes, vinyl, plants, tools. Sunday starting 10am.' },
    { t:'Vintage stoop sale — {nh}', b:'Vintage clothing, records, mid-century decor, rare books. {street} this Saturday. Early birds welcome.' },
  ],
  'garage-sale': [
    { t:'Garage sale — tools and sports gear', b:'Clearing out. Power tools, bikes, camping gear, furniture. {street}, {nh}. Saturday 8am-2pm.' },
    { t:'Estate sale — everything must go', b:'Entire household. Furniture, kitchenware, art, antiques. {street}, {nh}. Friday-Sunday.' },
  ],
  volunteer: [
    { t:'Soup kitchen needs volunteers — {nh}', b:'The {nh} Community Kitchen needs help Saturdays 8am-12pm. Serving 200+ meals. No experience needed.' },
    { t:'Tutoring volunteers — after school', b:'{nh} after school program needs math and reading tutors. Tues/Thurs 3-5pm. Make a difference.' },
    { t:'Park cleanup this weekend', b:'Help clean up the park near {street}. Bags and gloves provided. Meet at main entrance 10am Saturday.' },
    { t:'Senior center needs visitors', b:'The {nh} Senior Center needs people to visit elderly residents. Even 1 hour/week helps so much.' },
    { t:'Dog shelter needs walkers — {nh}', b:'Animal Care Center near {street} needs volunteer dog walkers. Mornings or afternoons. Rewarding work.' },
  ],
  carpool: [
    { t:'Daily carpool — {nh} to Midtown', b:'I drive to Midtown East every weekday. Leave 7:30am, return 6pm. Split gas and tolls. 1-2 spots.' },
    { t:'Weekend carpool to Costco', b:'Going to Costco this Saturday. Room for 2 people and groceries. Split gas.' },
    { t:'Carpool to NJ — weekly', b:'Commute to Jersey City Mon-Fri from {nh}. Looking for someone going same direction.' },
  ],
  'pet-sighting': [
    { t:'Gray cat spotted — {street}, {nh}', b:'Small gray cat with white paws near {street} for 3 days. No collar. Friendly but wont let you grab it.' },
    { t:'Loose dog — {nh} area', b:'Medium brown dog running loose near {street} and {street2}. No collar. Looks scared.' },
    { t:'Parakeet on fire escape — {street}', b:'Green parakeet on a fire escape on {street}. Seems tame, might be someones pet. Been there 2 days.' },
  ],
  welcome: [
    { t:'Just moved to {nh} — hello!', b:'Moved from {city} last week. Living near {street}. Would love recommendations for food, drinks, and things to do!' },
    { t:'New to {nh} — looking for friends', b:'Relocated for work, dont know anyone. Late 20s, into {hobby} and {hobby2}. Anyone want to grab coffee?' },
    { t:'Back in {nh} after 5 years', b:'Used to live here, moved away, now Im back. So much has changed. What are the new spots?' },
    { t:'Family moved to {nh}', b:'Just moved with my partner and 2 kids. Looking for family-friendly spots, playgrounds, and parent groups.' },
  ],
  group: [
    { t:'{nh} running group — all levels', b:'We run 3x/week. Tues/Thurs 6:30am, Saturday 8am. All paces welcome. Meet at {street} park.' },
    { t:'Book club starting in {nh}', b:'Monthly. Meeting at {place}. First book: {book}. All welcome. DM to join the group chat.' },
    { t:'{nh} parents group', b:'Parents of kids under 5. Playground meetups, babysitting swaps, hand-me-downs. DM to join.' },
    { t:'Photography walks — {nh}', b:'Weekly photo walks Sundays 10am. Any camera, any level. Just show up and shoot.' },
    { t:'{nh} poker night', b:'Friendly low-stakes poker. $20 buy-in. Every other Friday. Currently 6 regulars, room for 2 more.' },
  ],
}

// ════════════════════════════════════════════════
// LISTING TEMPLATES
// ════════════════════════════════════════════════

const LISTINGS = {
  'for-sale': [
    { sub:'furniture', t:['Solid wood dining table — seats 6','Mid-century modern couch','IKEA Kallax shelf, white','Vintage leather armchair','Queen bed frame + headboard','Standing desk, adjustable','Bookshelf, dark walnut','Glass coffee table','6-drawer dresser','Futon couch/bed'], p:[150,400,60,200,180,250,80,75,120,100], d:['Moving, must sell. Cash only, you haul.','2 years old, no stains. Comfortable.','Assembled but moving. Great condition.','Real leather, some patina.','Sturdy, no squeaks. No mattress.','Electric motor, 28-48 inches.','From West Elm, paid $300.','Modern style. Fits any room.','All drawers work smoothly.','Folds into bed. Great for guests.'] },
    { sub:'electronics', t:['MacBook Pro M2, 16GB','PS5 + 2 controllers','Samsung 55" 4K TV','AirPods Pro 2nd gen, sealed','iPad Air 5th gen','Sony WH-1000XM5','Nintendo Switch OLED + games','Dell 27" 4K monitor','Bose soundbar + sub','iPhone 14 Pro, unlocked'], p:[1100,380,300,180,400,250,280,220,350,650], d:['Barely used. Battery health 98%.','Original box. Works perfectly.','Smart TV, wall mounted.','Sealed box. Gift duplicate.','WiFi model + Apple Pencil.','Best noise cancelling. 6 months old.','Mario Kart + Zelda included.','IPS, USB-C. Great for WFH.','Powerful bass. Sounds amazing.','No scratches. Case always on.'] },
    { sub:'clothing-accessories', t:['North Face puffer, size M','Vintage Levis 501s, 32x32','Nike AF1s, size 10, DS','Winter coat lot — 5 coats','Timberland boots, size 11','Patagonia fleece, like new','Dr. Martens 1460, size 9'], p:[120,65,110,150,100,75,90], d:['700 fill. Warm. Bought a new one.','Straight leg, actual vintage.','Deadstock, never worn. All white.','All medium. Downsizing closet.','Worn one winter. Waterproofed.','Better Sweater, barely worn.','Already broken in.'] },
    { sub:'bikes', t:['Trek FX3 hybrid','Specialized Allez road bike','Brompton folding 6-speed','E-bike, 500W hub motor','Giant Escape 3','Fixie, matte black'], p:[500,600,1200,800,280,250], d:['Disc brakes, carbon fork.','Shimano 105. Fast and light.','Folds in 20 seconds.','28mph top speed. 40 mile range.','Ridden maybe 5 times.','Clean build. Flip flop hub.'] },
    { sub:'free-stuff', t:['Free couch — you haul','Moving boxes, come grab','Old TV, works fine','Books — 3 boxes','Plant collection, 8 plants','Kitchen stuff — pots, pans'], p:[0,0,0,0,0,0], d:['Gray sectional. Some wear. Pick up Sunday.','About 30 boxes. First come first served.','42 inch, not smart. Has HDMI.','Moving, cant take them.','Spider plant, pothos, snake plant etc.','Clearing kitchen. Take what you need.'] },
    { sub:'vinyl-records', t:['Jazz collection — 40 records','Hip hop vinyl lot — 25 albums','Beatles White Album, OG pressing','Wu-Tang 36 Chambers, sealed','90s R&B collection — 15 records'], p:[300,200,150,45,120], d:['Coltrane, Monk, Davis. All VG+.','Nas, Biggie, Tribe, De La Soul.','Some jacket wear, vinyl plays great.','Get On Down pressing. Sealed.','TLC, Aaliyah, SWV. Great condition.'] },
    { sub:'sneakers-streetwear', t:['Jordan 4 Bred, sz 10, DS','New Balance 990v6','Dunks Low Panda, sz 10.5','Adidas Samba OG','Jordan 1 High, sz 11'], p:[250,160,130,95,200], d:['Deadstock with SNKRS receipt.','Made in USA. Best runner.','Basically new. No box.','Classic. Goes with everything.','Barely worn. Comes with box.'] },
  ],
  housing: [
    { sub:'apartments', t:['Sunny 1BR, {nh}, $2,100/mo','Spacious 2BR, renovated, {nh}','Studio, exposed brick, {nh}','Large 3BR, laundry in unit, {nh}','Modern 2BR, rooftop, {nh}','Rent-stabilized 1BR, {nh}','Bright studio, high ceilings, {nh}'], p:[2100,2800,1650,3500,3200,1500,1450], d:['South-facing. Heat included.','New appliances, hardwood throughout.','Top floor walkup. Quiet.','Rare W/D in unit. Near subway.','Gym, rooftop, doorman. Pets OK.','Below market. Dont miss it.','450sqft but great closet.'] },
    { sub:'rooms-shared', t:['Room in 3BR, {nh}, $1,200','Private room, shared bath, {nh}','Master BR in 2BR, {nh}, $1,400','Furnished room, utils incl, {nh}'], p:[1200,950,1400,1300], d:['Chill roommates. Near train.','Quiet apt. Working professionals.','Biggest room, closet space.','Bed, desk, wifi, electric included.'] },
    { sub:'sublets', t:['Summer sublet 1BR, {nh}','3-month studio sublet, {nh}','Furnished 1BR sublet, {nh}'], p:[2000,1600,2200], d:['June-Aug. Fully furnished. AC.','Great location. Leaving for internship.','Everything included. Bring clothes.'] },
  ],
  services: [
    { sub:'cleaning', t:['{biz} Cleaning — {nh}','Deep Clean Experts — {nh}','Move In/Out Cleaning','Weekly Cleaning — Reliable'], p:[120,200,250,100], d:['Licensed, insured. 10 years experience. References.','Ovens, fridges, baseboards. We go deep.','Get your deposit back. Spotless results.','Same cleaner every week. Consistent.'] },
    { sub:'handyman', t:['Handyman — No Job Too Small, {nh}','Fix It All — Licensed, {nh}','Furniture Assembly + Mounting','Small Repairs — {nh}'], p:[75,100,60,70], d:['Shelves, TV mounting, minor plumbing. 15 yrs exp.','Licensed electrician + general handyman.','IKEA, TV mount, pictures. Flat rate.','Faucets, doors, drywall. Quick and clean.'] },
    { sub:'moving-hauling', t:['2 Movers + Truck — $300','Local NYC Moves — {biz}','Junk Removal — Same Day','Piano Moving Specialists'], p:[300,400,150,500], d:['Licensed. Insured. No hidden fees.','Family owned, 20 years. 5 stars.','Furniture, appliances, debris.','Grand, upright, digital. Insured.'] },
    { sub:'tutoring', t:['Math Tutor, All Levels — {nh}','SAT/ACT Prep — 1500+ Scorer','Spanish Lessons — Native Speaker','ESL — Patient, Experienced'], p:[60,80,50,45], d:['Columbia grad. Algebra to Calculus.','Scored 1560. Know all the tricks.','From Mexico City. All levels.','10 years teaching. Your pace.'] },
    { sub:'photography', t:['NYC Portrait Photographer','Event Photography — {nh}','Real Estate Photography','Headshots — Professional'], p:[200,500,150,175], d:['Natural light. Parks, rooftops, streets.','Birthdays, corporate. 48hr delivery.','HDR, wide angle. Same day turnaround.','LinkedIn, acting, dating apps.'] },
  ],
  jobs: [
    { sub:'restaurant-hospitality', t:['Line Cook — {nh} Restaurant','Server/Bartender — Busy {nh} Bar','Barista — Coffee Shop, {nh}','Restaurant Manager — {nh}','Dishwasher — Full Time, {nh}'], p:[0,0,0,0,0], d:['$18-22/hr + tips. Experience required.','$15/hr + tips ($200-400/night).','$17/hr + tips. Latte art a plus.','$55-65K + bonus. 3+ years mgmt.','$16/hr. Benefits after 90 days.'] },
    { sub:'tech-engineering', t:['Junior Frontend Dev — Hybrid','Senior Backend Engineer — {nh}','Data Analyst — Healthcare','DevOps Engineer — Fintech'], p:[0,0,0,0], d:['$70-90K. React/Next.js. 1-2 years.','$150-180K. Python, PostgreSQL, AWS.','$85-110K. SQL, Python, Tableau.','$130-160K. AWS, Terraform, CI/CD.'] },
    { sub:'trades-skilled-labor', t:['Electrician Apprentice — Union','Licensed Plumber — Experienced','HVAC Technician — Commercial','Painter — Residential, {nh}'], p:[0,0,0,0], d:['$25-35/hr + benefits. Will train.','$40-60/hr. 5+ yrs NYC experience.','$30-45/hr. EPA certified.','$25-35/hr. Clean work. References.'] },
    { sub:'healthcare', t:['Home Health Aide — {nh}','Medical Assistant — {nh} Clinic','Mental Health Counselor — Remote'], p:[0,0,0], d:['$17-20/hr. Certified HHA required.','$18-22/hr. Bilingual preferred.','$60-80K. LCSW or LMHC. Telehealth.'] },
    { sub:'retail', t:['Retail Associate — {nh}','Store Manager — Boutique, {nh}','Cashier — Full Time, {nh}'], p:[0,0,0], d:['$16-18/hr. Flexible schedule.','$50-60K. Retail mgmt required.','$16/hr. Benefits. Immediate start.'] },
  ],
  gigs: [
    { sub:'moving-help', t:['Help moving Saturday — {nh}','Furniture disassembly, 2 hrs','Help carry couch up 4 flights'], p:[100,80,50], d:['Moving 2BR to 1BR. Need 2 people.','IKEA bed + desk. Take apart and load.','Sleeper sofa, narrow stairs. Quick.'] },
    { sub:'dog-walking', t:['Dog walker weekdays — {nh}','2 dogs, lunchtime walk','Senior dog — gentle walks'], p:[20,25,20], d:['30 min noon walk Mon-Fri.','Two small dogs. 30 minutes.','Old retriever. Slow pace. Sweet.'] },
    { sub:'delivery-runs', t:['Deliver 5 packages — Manhattan','Pick up furniture — {nh}','Grocery run for elderly neighbor'], p:[75,60,30], d:['All midtown. Small packages. Today.','Pickup here, deliver 10 blocks.','Weekly grocery run. Easy.'] },
  ],
  tickets: [
    { sub:'concerts', t:['2 tix — MSG, Feb 22','Floor seats — Barclays','Brooklyn Steel — sold out show'], p:[150,200,80], d:['Section 112. Cant make it.','Row 5. Selling at face value.','GA standing. Work conflict.'] },
    { sub:'sports', t:['Knicks tix — MSG lower level','Yankees opening day — 2 tix','Nets — section 100'], p:[175,250,120], d:['Section 105. Real seats.','First game of the season.','Center court. Weeknight.'] },
    { sub:'broadway', t:['Hamilton — orchestra, 2 seats','Wicked — Saturday matinee','Off-Broadway — 4 tickets'], p:[300,180,100], d:['Row M center. Cant make date.','Mezzanine, great view.','Intimate Village theater.'] },
  ],
  pets: [
    { sub:'adoption', t:['Sweet tabby needs home','2 kittens, sisters','Rescue lab mix, great w/ kids','Senior cat, calm and loving'], p:[0,0,0,0], d:['3yo, spayed, all shots. Indoor.','8wks, litter trained. Playful.','2yo, neutered, vaccinated.','10yo. Lap cat. Quiet home.'] },
    { sub:'pet-sitting', t:['Cat sitter 1 week — {nh}','Dog boarding — my home, {nh}'], p:[25,45], d:['Feed + litter once daily. Easy.','Fenced yard. Lots of love.'] },
  ],
  barter: [
    { sub:'goods-for-goods', t:['Trade: KitchenAid for bike','Swap: PS5 for Switch + cash','Trade: records for concert tix'], p:[0,0,0], d:['Red stand mixer for commuter bike.','PS5 disc for Switch OLED + $100.','50+ jazz/soul for live music tix.'] },
    { sub:'skills-for-skills', t:['Trade: Spanish for guitar lessons','Swap: photography for web design'], p:[0,0], d:['Native speaker. Want guitar. Weekly.','Pro photographer needs a website.'] },
  ],
  rentals: [
    { sub:'tools-equipment', t:['Power drill rental $15/day','Pressure washer — rent','Table saw — weekend rental'], p:[15,50,75], d:['DeWalt 20V. Charger included.','2000 PSI. Patios, decks.','10 inch. You pickup, you return.'] },
    { sub:'cameras-gear', t:['Sony A7III + lens, $75/day','GoPro Hero 12 — weekend'], p:[75,30], d:['Full frame. 2 batteries.','Waterproof. Mounts included.'] },
  ],
  personals: [
    { sub:'activity-partners', t:['Running partner — Central Park','Tennis partner — weekdays','Hiking buddy — weekends','Board game group — {nh}','Photography walk partner'], p:[0,0,0,0,0], d:['Training for half marathon. 8-9 min pace.','Intermediate. 7am. Public courts.','Day trips. Car available.','Weekly. Catan, Ticket to Ride. All welcome.','Exploring with cameras. Casual.'] },
    { sub:'missed-connections', t:['Blue jacket, L train — Lorimer','Coffee shop conversation — {nh}','Dog park — Tompkins Square'], p:[0,0,0], d:['You were reading Murakami. We made eye contact.','Saturday morning. You had a latte. We talked jazz.','Your corgi is Biscuit. My mutt is Chaos. Walk together?'] },
  ],
  resumes: [
    { sub:'software-engineering', t:['Full Stack Dev — 5 yrs exp','Frontend Engineer — React/Next','Backend Dev — Python/Django'], p:[0,0,0], d:['React, Node, PostgreSQL. Looking for hybrid or remote role in NYC.','3 years React, TypeScript. Portfolio available.','4 years Python, REST APIs, AWS. Open to contract or FTE.'] },
    { sub:'creative-media', t:['Graphic Designer — 7 yrs','Videographer/Editor — Freelance','Content Creator — Social Media'], p:[0,0,0], d:['Adobe Suite, Figma. Brand identity, print, digital.','Final Cut, DaVinci. Events, promos, docs.','Instagram, TikTok, YouTube. Strategy + execution.'] },
  ],
}

// ─── Reply templates ───

const REPLY_POOL = [
  'Great recommendation, thanks for sharing!',
  'This is super helpful. Been looking for exactly this.',
  'Can confirm — went there last week. Legit.',
  '+1 on this. Been going for years.',
  'Thanks for the heads up!',
  'Are they open weekends?',
  'How much does it usually cost?',
  'Do they take walk-ins?',
  'Been meaning to check this out.',
  'My neighbor said the same thing.',
  'Sending this to my partner.',
  'Any alternatives on a budget?',
  'Shared with my building group chat.',
  'This place saved me when I first moved here.',
  'Honestly the best in the borough.',
  'Bookmarked. Thank you.',
  'Does anyone know their hours?',
  'Had a different experience but glad it works for you.',
  'The staff is so friendly there.',
  'Tell them {first} sent you.',
  'This is why I love this neighborhood.',
  'Going this weekend. Thanks.',
  'We need more posts like this.',
  'My family has been going there for years.',
  'Old school NYC. Love it.',
  'Welcome to the neighborhood!',
  'You are going to love it here.',
  'Let me know if you need anything else.',
  'DM me, I have a recommendation.',
  'Seconding this 100%.',
  'Just what I was looking for.',
  'The owner is the nicest person.',
  'Prices went up but still worth it.',
  'Good looking out for the community.',
  'I live on the same block. Welcome!',
  'Can vouch for this. A+ service.',
]

// ═════════════════════════════════════════
// MAIN
// ═════════════════════════════════════════

async function main() {
  console.log('╔══════════════════════════════════════════╗')
  console.log('║   NYC CLASSIFIEDS — PLATFORM SEEDER     ║')
  console.log('╚══════════════════════════════════════════╝\n')

  // ── 1. GENERATE 500 USERS ──
  console.log('1. Generating 500 users...')
  const usedEmails = new Set()
  const rawUsers = []

  for (let i = 0; i < 500; i++) {
    const boroughSlug = BOROUGH_DIST[i]
    const borough = BOROUGHS[boroughSlug]
    const nh = pick(borough.nhs)
    const demo = pick(DEMO_WEIGHTS)
    const namePool = NAMES[demo]
    const first = pick(namePool.first)
    const last = pick(namePool.last)

    let email = `${first.toLowerCase().replace(/[^a-z]/g,'')}.${last.toLowerCase().replace(/[^a-z]/g,'')}${rb(1,999)}@example.com`
    while (usedEmails.has(email)) email = `${first.toLowerCase().replace(/[^a-z]/g,'')}${rb(1,9999)}@example.com`
    usedEmails.add(email)

    const isBusiness = i >= 400 // last 100 are business accounts
    const avatarSeed = `${first}-${last}-${i}`.toLowerCase().replace(/[^a-z0-9]/g,'-')
    const lat = borough.lat + (Math.random()-.5)*.04
    const lng = borough.lng + (Math.random()-.5)*.04

    const user = {
      email,
      name: `${first} ${last}`,
      pin: '000000',
      address: `${rb(1,999)} ${pick(STREETS)}, NYC`,
      lat: Math.round(lat*10000)/10000,
      lng: Math.round(lng*10000)/10000,
      selfie_url: `https://i.pravatar.cc/150?u=${avatarSeed}`,
      verified: true,
      created_at: rDate(rb(7,180)),
      _borough: boroughSlug,
      _nh: nh,
      _first: first,
      _last: last,
      _isBiz: isBusiness,
    }

    if (isBusiness) {
      const tmpl = pick(BIZ_TEMPLATES)
      user._bizName = tmpl[0].replace('{last}',last).replace('{first}',first)
      user._bizCat = tmpl[1]
    }

    rawUsers.push(user)
  }

  // Insert users (strip internal fields)
  const userInserts = rawUsers.map(({ _borough,_nh,_first,_last,_isBiz,_bizName,_bizCat,...u }) => u)
  console.log('   Inserting 500 users...')
  const insertedUsers = await supaInsert('users', userInserts)
  console.log(`   ✓ ${insertedUsers.length} users created\n`)

  // Map IDs back
  const users = rawUsers.map((u, i) => ({ ...u, _id: insertedUsers[i]?.id })).filter(u => u._id)

  // ── 2. PORCH POSTS (1500) — 30-day ramp-up, borough-weighted, all neighborhoods covered ──
  console.log('2. Generating 1500 porch posts...')
  const porchPosts = []
  const types = Object.keys(PORCH)

  // Borough weights for POSTS (different from user distribution)
  const POST_BOROUGH_WEIGHTS = [
    ...Array(35).fill('manhattan'),
    ...Array(30).fill('brooklyn'),
    ...Array(20).fill('queens'),
    ...Array(10).fill('bronx'),
    ...Array(5).fill('staten-island'),
  ]

  // 30-day ramp-up: Day 1-7 ~25/day, Day 8-14 ~40/day, Day 15-21 ~60/day, Day 22-30 ~70/day
  // = 175 + 280 + 420 + 625 = 1500
  const dailyCounts = []
  for (let d = 0; d < 30; d++) {
    if (d < 7) dailyCounts.push(25)
    else if (d < 14) dailyCounts.push(40)
    else if (d < 21) dailyCounts.push(60)
    else dailyCounts.push(Math.round(625/9)) // ~69.4, rounds to fill 625 over 9 days
  }
  // Adjust last day to hit exactly 1500
  const totalSoFar = dailyCounts.reduce((a,b)=>a+b,0)
  dailyCounts[dailyCounts.length-1] += (1500 - totalSoFar)

  // First pass: ensure every neighborhood gets at least 1 post
  const allNeighborhoods = []
  for (const [bSlug, bData] of Object.entries(BOROUGHS)) {
    for (const nh of bData.nhs) {
      allNeighborhoods.push({ borough: bSlug, nh })
    }
  }
  console.log(`   Ensuring coverage for ${allNeighborhoods.length} neighborhoods...`)

  // Reserve 1 post per neighborhood first
  const reservedPosts = []
  for (const { borough, nh } of allNeighborhoods) {
    const usersInBorough = users.filter(u => u._borough === borough)
    const user = usersInBorough.length > 0 ? pick(usersInBorough) : pick(users)
    const type = pick(types)
    const tmpl = pick(PORCH[type])
    const vars = {
      nh: nhName(nh), last: pick(NAMES[pick(DEMO_WEIGHTS)].last),
      street: pick(STREETS), street2: pick(STREETS), street3: pick(STREETS),
      place: pick(PLACES), city: pick(CITIES),
      hobby: pick(HOBBIES), hobby2: pick(HOBBIES),
      movie: pick(MOVIES), book: pick(BOOKS), train: pick(TRAINS),
      first: user._first,
    }
    const pinned = (type==='lost-and-found'||type==='pet-sighting') && Math.random()<0.4
    const expH = type==='alert'?48:(type==='lost-and-found'||type==='pet-sighting')?72:720
    reservedPosts.push({
      user_id: user._id,
      post_type: type,
      title: fill(tmpl.t, vars).slice(0,100),
      body: fill(tmpl.b, vars).slice(0,500),
      borough_slug: borough,
      neighborhood_slug: nh,
      pinned,
      expires_at: new Date(Date.now()+expH*3600000).toISOString(),
      created_at: null, // assigned below
    })
  }

  // Distribute reserved posts across days (spread evenly)
  for (let i = 0; i < reservedPosts.length; i++) {
    const day = Math.floor((i / reservedPosts.length) * 30)
    const hoursAgo = (30 - day) * 24 - Math.random() * 24
    reservedPosts[i].created_at = new Date(Date.now() - hoursAgo * 3600000).toISOString()
  }
  porchPosts.push(...reservedPosts)

  // Remaining posts: 1500 - reserved, distributed by day ramp-up and borough weight
  const remaining = 1500 - reservedPosts.length
  console.log(`   ${reservedPosts.length} reserved for coverage, ${remaining} remaining by ramp-up...`)

  // Track how many we need per day (subtract reserved from daily targets)
  let reservedPerDay = new Array(30).fill(0)
  for (let i = 0; i < reservedPosts.length; i++) {
    const day = Math.floor((i / reservedPosts.length) * 30)
    reservedPerDay[day]++
  }

  for (let day = 0; day < 30; day++) {
    const target = Math.max(0, dailyCounts[day] - reservedPerDay[day])
    for (let p = 0; p < target; p++) {
      const boroughSlug = pick(POST_BOROUGH_WEIGHTS)
      const borough = BOROUGHS[boroughSlug]
      const nh = pick(borough.nhs)
      // Prefer users from same borough when possible
      const candidates = users.filter(u => u._borough === boroughSlug)
      const user = candidates.length > 0 ? pick(candidates) : pick(users)
      const type = pick(types)
      const tmpl = pick(PORCH[type])
      const vars = {
        nh: nhName(nh), last: pick(NAMES[pick(DEMO_WEIGHTS)].last),
        street: pick(STREETS), street2: pick(STREETS), street3: pick(STREETS),
        place: pick(PLACES), city: pick(CITIES),
        hobby: pick(HOBBIES), hobby2: pick(HOBBIES),
        movie: pick(MOVIES), book: pick(BOOKS), train: pick(TRAINS),
        first: user._first,
      }
      const pinned = (type==='lost-and-found'||type==='pet-sighting') && Math.random()<0.4
      const expH = type==='alert'?48:(type==='lost-and-found'||type==='pet-sighting')?72:720
      const hoursAgo = (30 - day) * 24 - Math.random() * 24
      porchPosts.push({
        user_id: user._id,
        post_type: type,
        title: fill(tmpl.t, vars).slice(0,100),
        body: fill(tmpl.b, vars).slice(0,500),
        borough_slug: boroughSlug,
        neighborhood_slug: nh,
        pinned,
        expires_at: new Date(Date.now()+expH*3600000).toISOString(),
        created_at: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
      })
    }
  }

  console.log(`   Inserting ${porchPosts.length} porch posts...`)
  const iPorch = await supaInsert('porch_posts', porchPosts)
  console.log(`   ✓ ${iPorch.length} porch posts\n`)

  // ── 3. LISTINGS (750) — borough-weighted, 30-day spread ──
  console.log('3. Generating 750 listings...')
  const listingRows = []
  const catKeys = Object.keys(LISTINGS)

  for (let i = 0; i < 750; i++) {
    const boroughSlug = pick(POST_BOROUGH_WEIGHTS)
    const borough = BOROUGHS[boroughSlug]
    const nh = pick(borough.nhs)
    const candidates = users.filter(u => u._borough === boroughSlug)
    const user = candidates.length > 0 ? pick(candidates) : pick(users)
    const catSlug = pick(catKeys)
    const subs = LISTINGS[catSlug]
    const subGrp = pick(subs)
    const idx = rb(0, subGrp.t.length-1)
    const vars = {
      nh: nhName(nh), biz: user._bizName || `${user._last}'s ${pick(['Service','Shop','Co'])}`,
      street: pick(STREETS), place: pick(PLACES),
    }
    const day = Math.floor(Math.random() * 30)
    const hoursAgo = (30 - day) * 24 - Math.random() * 24
    listingRows.push({
      user_id: user._id,
      title: fill(subGrp.t[idx], vars).slice(0,200),
      description: fill(subGrp.d[idx], vars),
      price: subGrp.p[idx] || null,
      category_slug: catSlug,
      subcategory_slug: subGrp.sub,
      images: '{}',
      location: `${nhName(nh)}, ${nhName(boroughSlug)}`,
      lat: user.lat, lng: user.lng,
      status: 'active',
      expires_at: new Date(Date.now()+30*86400000).toISOString(),
      created_at: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
    })
  }
  console.log('   Inserting 750 listings...')
  const iList = await supaInsert('listings', listingRows)
  console.log(`   ✓ ${iList.length} listings\n`)

  // ── 4. PORCH REPLIES (2000) ──
  console.log('4. Generating 2000 porch replies...')
  const porchIds = iPorch.map(p=>p.id)
  const replyRows = []
  for (let i = 0; i < 2000; i++) {
    const user = pick(users)
    let body = pick(REPLY_POOL)
    body = body.replace('{first}', user._first)
    replyRows.push({
      post_id: pick(porchIds),
      user_id: user._id,
      body,
      helpful_count: Math.random()<.35 ? rb(1,15) : 0,
      created_at: rDate(rb(0,25)),
    })
  }
  console.log('   Inserting 2000 replies...')
  const iReply = await supaInsert('porch_replies', replyRows)
  console.log(`   ✓ ${iReply.length} replies\n`)

  // ── 5. MESSAGES (400) ──
  console.log('5. Generating 400 messages...')
  const listIds = iList.map(l=>l.id)
  const MSG = ['Hi, is this still available?','What condition is it in?','Can you do less?','When can I pick up?','More photos?','Price negotiable?','Available this weekend?','Where in the neighborhood?','Would you take $'+rb(20,400)+'?','Perfect timing, I need this.','My friend wants one too.','Whats the lowest?','Pickup only?','Can you deliver?','Interested. DMing you.']
  const msgRows = []
  for (let i = 0; i < 400; i++) {
    const s = pick(users), r = pick(users)
    if (s._id===r._id) continue
    msgRows.push({
      listing_id: pick(listIds),
      sender_id: s._id, recipient_id: r._id,
      content: pick(MSG),
      read: Math.random()<.6,
      created_at: rDate(14),
    })
  }
  console.log('   Inserting messages...')
  const iMsg = await supaInsert('messages', msgRows)
  console.log(`   ✓ ${iMsg.length} messages\n`)

  // ── SUMMARY ──
  console.log('╔══════════════════════════════════════════╗')
  console.log('║              SEED COMPLETE               ║')
  console.log('╠══════════════════════════════════════════╣')
  console.log(`║  Users:         ${String(insertedUsers.length).padStart(6)}               ║`)
  console.log(`║  Porch Posts:   ${String(iPorch.length).padStart(6)}               ║`)
  console.log(`║  Listings:      ${String(iList.length).padStart(6)}               ║`)
  console.log(`║  Replies:       ${String(iReply.length).padStart(6)}               ║`)
  console.log(`║  Messages:      ${String(iMsg.length).padStart(6)}               ║`)
  console.log(`║  ─────────────────────────               ║`)
  console.log(`║  TOTAL:         ${String(insertedUsers.length+iPorch.length+iList.length+iReply.length+iMsg.length).padStart(6)}               ║`)
  console.log('╚══════════════════════════════════════════╝')
}

main().catch(e => { console.error('FATAL:', e); process.exit(1) })
