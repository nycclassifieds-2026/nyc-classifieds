#!/usr/bin/env node
/**
 * MEGA SEED — 2,000 users + 100,000 listings + 25,000 porch posts + 15,000 replies
 * Run: node scripts/seed-mega.mjs
 */

const SUPABASE_URL = 'https://vpeozixllzdwzqniopfn.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZW96aXhsbHpkd3pxbmlvcGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY3MTQwNiwiZXhwIjoyMDg2MjQ3NDA2fQ.U9w4ZqhUiFDHTjH4taLGfH5Y9a2trsEH-BqLV__znq0'

const HEADERS_MIN = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }
const HEADERS_REP = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' }

// ─── Batch insert ───
async function supaInsert(table, rows, returnData = false) {
  const batchSize = 50
  let inserted = 0
  const all = []
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST', headers: returnData ? HEADERS_REP : HEADERS_MIN, body: JSON.stringify(batch),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error(`  ERR ${table} batch ${Math.floor(i/batchSize)}: ${err.slice(0,200)}`)
      continue
    }
    if (returnData) { const data = await res.json(); all.push(...data) }
    inserted += batch.length
    if (inserted % 2000 < 50) process.stdout.write(`  ${inserted}...`)
  }
  return returnData ? all : inserted
}

// ─── Helpers ───
function pick(a) { return a[Math.floor(Math.random()*a.length)] }
function rb(a,b) { return a+Math.floor(Math.random()*(b-a+1)) }
function nhName(s) { return s.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) }
function fill(s, v) { return s.replace(/\{(\w+)\}/g, (_, k) => v[k] || k) }
function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') }

const WORD_SWAPS = [
  [/\bamazing\b/i, ['great','incredible','fantastic','solid']],
  [/\bgreat\b/i, ['amazing','excellent','really good','solid']],
  [/\blooking for\b/i, ['trying to find','searching for','need','want']],
  [/\bperfect\b/i, ['exactly right','ideal','spot on','just right']],
  [/\bfriendly\b/i, ['nice','welcoming','warm','down to earth']],
  [/\breliable\b/i, ['dependable','consistent','trustworthy','solid']],
  [/\bbeautiful\b/i, ['gorgeous','stunning','lovely','pretty']],
  [/\bawesome\b/i, ['great','solid','amazing','the best']],
  [/\bdelicious\b/i, ['so good','fire','amazing','on point']],
  [/\bcheap\b/i, ['affordable','reasonable','budget-friendly','not expensive']],
]
const FILLERS = ['honestly ','ngl ','tbh ','lowkey ','genuinely ','literally ','fr ','deadass ']

function varyText(text) {
  let t = text
  if (Math.random() < 0.3) {
    for (const [re, alts] of WORD_SWAPS) {
      if (Math.random() < 0.25) t = t.replace(re, pick(alts))
    }
  }
  if (Math.random() < 0.15) {
    const sentences = t.split('. ')
    if (sentences.length > 2) {
      const idx = rb(1, sentences.length - 2)
      sentences[idx] = pick(FILLERS) + sentences[idx].charAt(0).toLowerCase() + sentences[idx].slice(1)
      t = sentences.join('. ')
    }
  }
  return t
}

// ─── Hourly weights ───
const HOURLY_WEIGHTS = {0:2,1:1,2:1,3:1,4:1,5:1,6:3,7:5,8:6,9:5,10:4,11:5,12:8,13:10,14:8,15:5,16:4,17:5,18:8,19:10,20:9,21:7,22:4,23:3}
function pickHour() {
  const entries = Object.entries(HOURLY_WEIGHTS)
  const total = entries.reduce((s,[,w])=>s+w, 0)
  let r = Math.random() * total
  for (const [h,w] of entries) { r -= w; if (r <= 0) return parseInt(h) }
  return 12
}
function tsForDate(date) {
  const d = new Date(date)
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  return new Date(day.getTime() + pickHour()*3600000 + rb(0,59)*60000 + rb(0,59)*1000).toISOString()
}

// ─── Geography ───
const BOROUGHS = {
  manhattan:      { lat:40.7831, lng:-73.9712, nhs:['alphabet-city','battery-park-city','carnegie-hill','chelsea','chinatown','east-harlem','east-village','financial-district','flatiron','gramercy','greenwich-village','hamilton-heights','harlem','hells-kitchen','hudson-yards','inwood','kips-bay','koreatown','lenox-hill','lincoln-square','little-italy','lower-east-side','manhattan-valley','meatpacking-district','midtown-east','midtown-west','morningside-heights','murray-hill','noho','nolita','roosevelt-island','soho','stuyvesant-town','sugar-hill','times-square','tribeca','two-bridges','upper-east-side','upper-west-side','washington-heights','west-village'] },
  brooklyn:       { lat:40.6782, lng:-73.9442, nhs:['bay-ridge','bed-stuy','bensonhurst','boerum-hill','borough-park','brighton-beach','brooklyn-heights','brownsville','bushwick','canarsie','carroll-gardens','clinton-hill','cobble-hill','coney-island','crown-heights','downtown-brooklyn','dumbo','dyker-heights','east-new-york','flatbush','fort-greene','greenpoint','kensington','midwood','park-slope','prospect-heights','red-hook','sheepshead-bay','sunset-park','williamsburg'] },
  queens:         { lat:40.7282, lng:-73.7949, nhs:['astoria','bayside','bellerose','briarwood','college-point','corona','douglaston','elmhurst','far-rockaway','flushing','forest-hills','fresh-meadows','glen-oaks','howard-beach','jackson-heights','jamaica','kew-gardens','little-neck','long-island-city','maspeth','middle-village','ozone-park','rego-park','ridgewood','rockaway-beach','st-albans','sunnyside','whitestone','woodhaven','woodside'] },
  bronx:          { lat:40.8448, lng:-73.8648, nhs:['belmont','concourse','fordham','highbridge','hunts-point','kingsbridge','morris-park','mott-haven','norwood','pelham-bay','riverdale','south-bronx','throgs-neck','tremont','wakefield'] },
  'staten-island':{ lat:40.5795, lng:-74.1502, nhs:['annadale','eltingville','great-kills','huguenot','new-dorp','princes-bay','st-george','stapleton','tompkinsville','tottenville'] },
}
const BOROUGH_WEIGHTS = [...Array(35).fill('manhattan'),...Array(30).fill('brooklyn'),...Array(20).fill('queens'),...Array(10).fill('bronx'),...Array(5).fill('staten-island')]

// ─── Demographics ───
const NAMES = {
  hispanic: { first:['Carlos','Maria','Luis','Rosa','Miguel','Carmen','Jose','Ana','Diego','Sofia','Alejandro','Isabella','Fernando','Valentina','Ricardo','Lucia','Gabriel','Elena','Javier','Camila','Eduardo','Daniela','Roberto','Adriana','Marcos','Patricia','Hector','Yolanda','Raul','Marisol','Pedro','Gloria','Oscar','Beatriz','Manuel','Silvia','Jorge','Alicia'], last:['Rodriguez','Santos','Garcia','Martinez','Lopez','Rivera','Cruz','Gomez','Diaz','Morales','Torres','Vargas','Castillo','Herrera','Reyes','Flores','Medina','Ramirez','Ortiz','Delgado','Mendoza','Soto','Vega','Salazar','Guerrero','Acosta'] },
  black: { first:['Marcus','Aaliyah','Terrence','Keisha','Andre','Tamika','Malik','Jasmine','DeShawn','Imani','Jamal','Ebony','Kwame','Tanya','Dante','Aisha','Cornell','Simone','Rashid','Monique','Darius','Latoya','Malcolm','Nia','Elijah','Zara','Isaiah','Destiny','Kendrick','Brianna','Xavier','Kiara','Tyrone','LaShonda'], last:['Williams','Johnson','Brown','Davis','Wilson','Jackson','Thomas','Taylor','Moore','Harris','Robinson','Walker','Allen','Young','King','Wright','Hill','Scott','Green','Adams','Carter','Mitchell','Campbell','Parker','Turner','Cooper','Bailey','Howard','Brooks','Reed'] },
  asian: { first:['Wei','Mei','Jin','Soo-Min','Chen','Li','Min-Jun','Jia','Hiroshi','Yuki','Kenji','Sakura','Takeshi','Yuna','Akira','Haruki'], last:['Chen','Wang','Li','Zhang','Liu','Yang','Kim','Park','Choi','Jeon','Lee','Wu','Huang','Lin','Xu','Lam','Tan','Ng','Tran','Nguyen','Pham','Vo'] },
  south_asian: { first:['Raj','Priya','Deepak','Ananya','Ravi','Nisha','Vikram','Sunita','Arjun','Leela','Amir','Fatima','Sanjay','Meera','Dev','Kavitha','Rohit','Anjali','Aarav','Diya'], last:['Patel','Singh','Sharma','Gupta','Kumar','Shah','Mohammed','Hassan','Ali','Ibrahim','Ahmed','Chowdhury','Khan','Dasgupta','Nair','Rao','Reddy','Joshi','Malhotra','Chatterjee'] },
  caribbean: { first:['Winston','Marcia','Desmond','Claudette','Errol','Beverley','Lennox','Sonia','Clive','Donna','Fitzroy','Pauline','Trevor','Joan','Neville','Sharon'], last:['Campbell','Stewart','Brown','Williams','Thomas','Henry','Clarke','Francis','Charles','Baptiste','Pierre','Jean','Toussaint','Dupont','Joseph'] },
  middle_eastern: { first:['Omar','Layla','Karim','Nadia','Tariq','Yasmin','Hassan','Leila','Samir','Dina','Khalid','Rania','Fadi','Amira','Zain','Hana'], last:['Mohammed','Hassan','Ali','Ibrahim','Ahmed','Khalil','Mansour','Haddad','Khoury','Abadi','Saleh','Nasser','Farah','Habib','Said','Elias'] },
  eastern_euro: { first:['Dmitri','Natasha','Pavel','Katarina','Ivan','Olga','Andrei','Svetlana','Nikolai','Tatiana','Sergei','Elena','Boris','Irina','Viktor','Marina','Alexei','Anya','Mikhail','Yulia'], last:['Volkov','Petrov','Ivanov','Kuznetsov','Popov','Kowalski','Nowak','Wojcik','Szabo','Kovacs','Horvat','Bogdan','Kravchenko','Sokolov','Morozov'] },
  italian: { first:['Tony','Gina','Sal','Vinny','Angela','Frankie','Dominic','Carmela','Anthony','Lucia','Joey','Marco','Teresa','Giovanni','Sophia'], last:['Rossi','Colombo','Romano','Ricci','Russo','Esposito','Bianchi','Moretti','Ferraro','Barbieri','DeLuca','Santoro','Marini','Conti','Leone'] },
  irish: { first:['Liam','Siobhan','Connor','Bridget','Declan','Erin','Brendan','Fiona','Niall','Ciara','Cormac','Aoife','Ronan','Sinead','Kieran','Nora','Seamus','Maeve'], last:['Murphy','Kelly','OBrien','Sullivan','Walsh','Fitzgerald','Byrne','Ryan','Gallagher','Doyle','Brennan','Quinn','Burke','Lynch','McCarthy'] },
  white_other: { first:['Michael','Sarah','James','Jennifer','David','Amanda','Brian','Megan','Kevin','Katie','Patrick','Nicole','Tim','Lauren','Sean','Emily','Chris','Rachel','Matt','Heather','Dan','Kristin','Jake','Allison','Ryan','Stephanie','Mark','Ashley','Tom','Colleen'], last:['Miller','Anderson','Clark','Lewis','Hall','Baker','Nelson','Carter','Mitchell','Perez','Roberts','Turner','Phillips','Campbell','Parker','Evans','Edwards','Collins','Stewart','Morris'] },
}
const DEMO_WEIGHTS = [...Array(29).fill('hispanic'),...Array(24).fill('black'),...Array(14).fill('asian'),...Array(7).fill('south_asian'),...Array(4).fill('caribbean'),...Array(3).fill('middle_eastern'),...Array(3).fill('eastern_euro'),...Array(6).fill('italian'),...Array(4).fill('irish'),...Array(6).fill('white_other')]

const STREETS = ['1st Ave','2nd Ave','3rd Ave','Broadway','Lexington Ave','Madison Ave','Park Ave','Amsterdam Ave','Columbus Ave','5th Ave','6th Ave','7th Ave','8th Ave','Atlantic Ave','Flatbush Ave','DeKalb Ave','Myrtle Ave','Bedford Ave','Grand St','Delancey St','Houston St','Bleecker St','14th St','23rd St','34th St','42nd St','57th St','72nd St','86th St','96th St','110th St','125th St','145th St','Fordham Rd','Tremont Ave','Jerome Ave','Ditmars Blvd','Steinway St','Jamaica Ave','Hillside Ave','Metropolitan Ave','Vernon Blvd','Queens Blvd','Northern Blvd','Roosevelt Ave','Victory Blvd','Bay St','Hylan Blvd']
const PLACES = ['Joes','Corner Spot','La Esquina','The Local','Golden Dragon','Noodle House','Cafe Roma','Taqueria Mexico','Pho Saigon','Sushi Palace','The Bean','Green Leaf','Mamas Kitchen','The Bodega','Blue Moon','Red Hook Coffee','Sunset Diner','Brooklyn Bagels','Astoria Bites','Harlem Soul','The Halal Cart','Dumpling House','Empanada Mama','Peking Duck House','Russ & Daughters']
const CITIES = ['Boston','Chicago','LA','Miami','Philly','DC','Atlanta','Portland','Denver','Seattle','Austin','San Francisco','Dallas','Minneapolis','Nashville','Detroit','Charlotte','New Orleans','Pittsburgh','Baltimore']
const HOBBIES = ['hiking','cooking','photography','running','reading','cycling','yoga','climbing','music','gaming','art','basketball','soccer','film','writing','coding','gardening','chess','dancing','boxing']
const TRAINS = ['A','C','E','B','D','F','M','N','Q','R','W','1','2','3','4','5','6','7','G','J','Z','L']
const AVATAR_STYLES = ['avataaars','personas','adventurer','big-ears','lorelei','notionists','open-peeps','thumbs','bottts','fun-emoji','micah','miniavs']
const BIZ_CATS = ['Auto Shop','Bakery','Bar & Lounge','Barbershop','Beauty Salon','Bookstore','Cafe','Catering','Childcare','Cleaning Service','Clothing Store','Construction','Consulting','Creative Agency','Deli & Bodega','Dental Office','Dog Walker','Electrician','Fitness Studio','Florist','Food Truck','Handyman','IT Services','Landscaping','Law Firm','Locksmith','Moving Company','Music Studio','Nail Salon','Painter','Pest Control','Pet Grooming','Photographer','Plumber','Real Estate','Restaurant','Roofing','Security','Tailor','Yoga Studio']

function makeVars(borough, nh, firstName, lastName) {
  return {
    nh: nhName(nh), street: pick(STREETS), street2: pick(STREETS), place: pick(PLACES),
    city: pick(CITIES), hobby: pick(HOBBIES), hobby2: pick(HOBBIES), train: pick(TRAINS),
    first: firstName, last: lastName,
    biz: `${lastName}'s ${pick(['Service','Shop','Co','Studio','Solutions'])}`,
  }
}

// ─── Category weights ───
const CATEGORY_WEIGHTS = { personals:22, housing:16, jobs:12, 'for-sale':10, services:8, gigs:7, community:6, tickets:5, pets:5, barter:3, rentals:3, resumes:3 }
function pickCategory() {
  const entries = Object.entries(CATEGORY_WEIGHTS)
  const total = entries.reduce((s,[,w])=>s+w, 0)
  let r = Math.random() * total
  for (const [cat,w] of entries) { r -= w; if (r <= 0) return cat }
  return 'personals'
}

// ─── LISTING TEMPLATES ───
// { sub, items: [{ t, d, p:[minCents,maxCents] }] }
const LISTINGS = {
  personals: [
    { sub:'activity-partners', items:[
      { t:'Running partner — {nh}', d:'Training for the NYC half. 8-9 min pace, 3-4 days/week before work. All levels welcome.', p:[0,0] },
      { t:'Tennis partner wanted — {nh}', d:'Intermediate player looking for regular sets at public courts. Weekday evenings or weekends work.', p:[0,0] },
      { t:'Hiking buddy — weekend day trips', d:'I have a car. Bear Mountain, Breakneck Ridge, Harriman. 6-10 mile hikes. I pack lunch.', p:[0,0] },
      { t:'Board game night — {nh}', d:'Every other Thursday. Catan, Wingspan, Ticket to Ride. 4-6 people. BYOB. DM to join.', p:[0,0] },
      { t:'Photography walk — {nh}', d:'Street photography Saturday afternoons. I use a Fuji, you can use your phone. Just want good company.', p:[0,0] },
      { t:'Climbing partner — {nh}', d:'Need a belay partner. I go 3x/week evenings. I lead 5.10s. Any level welcome.', p:[0,0] },
      { t:'Pickup basketball — {nh}', d:'Saturday mornings at the courts on {street}. Need more regulars. Competitive but friendly. 9am-noon.', p:[0,0] },
      { t:'Cycling buddy — bridge loops', d:'Manhattan/Brooklyn/Williamsburg bridge loop 2-3x/week after work. Avg 15-17mph.', p:[0,0] },
      { t:'Museum buddy — {nh}', d:'I have a Culture Pass. Want to hit every museum in the city. Coffee after.', p:[0,0] },
      { t:'Yoga partner — morning classes, {nh}', d:'7am vinyasa M/W/F. Looking for accountability partner. 2 years practicing.', p:[0,0] },
      { t:'Soccer — looking for players, {nh}', d:'Pickup soccer Sundays near {street}. Co-ed, all levels. 10am. Bring cleats.', p:[0,0] },
      { t:'Cooking partner — {nh}', d:'Cook together once a week. Alternate hosting. I make great pernil and mofongo. Teach me what you know.', p:[0,0] },
      { t:'Karaoke crew — Thursday nights', d:'K-Town every other Thursday. 6-8 people. Very judgment-free. All voices welcome especially bad ones.', p:[0,0] },
      { t:'Dance partner — salsa, {nh}', d:'Salsa classes Tuesdays 8pm near {street}. Need a consistent partner. Beginner-friendly.', p:[0,0] },
      { t:'Poker night — {nh}, low stakes', d:'$20 buy-in. Texas Hold Em. Every other Saturday. 6-8 people. Snacks and beers.', p:[0,0] },
      { t:'Language exchange — Spanish/English', d:'Native English speaker learning Spanish. 30 min each language over coffee weekly in {nh}.', p:[0,0] },
      { t:'Gym partner — {nh}', d:'Looking for someone to lift with 3-4x/week around 6pm near {street}. PPL split. Any experience level.', p:[0,0] },
      { t:'Trivia night — {nh}', d:'Bar on {street} does trivia Wednesdays. Need someone who knows pop culture. Team of 4 ideal.', p:[0,0] },
      { t:'Birdwatching — weekend mornings', d:'Getting into birding. I got binoculars and Merlin app. Early Saturday mornings. Central or Prospect Park.', p:[0,0] },
      { t:'Thrifting partner — weekends', d:'Thrift stores and estate sales every weekend. Vintage clothing, furniture, records. {nh} has hidden gems.', p:[0,0] },
      { t:'Book club — {nh}', d:'Monthly. Contemporary fiction. We meet at a cafe. 5-8 people who will actually read the book.', p:[0,0] },
      { t:'Chess in the park — {nh}', d:'I play almost every day after work at the tables near {street}. Getting better but still getting destroyed by the regulars lol.', p:[0,0] },
      { t:'Swim buddy — {nh}', d:'I go to the pool at the rec center on {street}. Looking for a lane buddy mornings before work around 6.', p:[0,0] },
      { t:'Boxing gym partner — {nh}', d:'Going to the boxing gym on {street} 3x a week but my friends think im crazy. Need someone to train with.', p:[0,0] },
      { t:'Morning walking buddy — {nh}', d:'6am. 3-4 miles. {nh} area near {street}. We can talk or not. Rain or shine.', p:[0,0] },
    ]},
    { sub:'missed-connections', items:[
      { t:'Blue jacket, L train — {nh}', d:'You were reading Murakami. We made eye contact. You got off at 1st Ave. I was in the gray hoodie.', p:[0,0] },
      { t:'Coffee shop — Saturday morning, {nh}', d:'You had an oat milk latte, I had an Americano. We talked about jazz for 10 minutes.', p:[0,0] },
      { t:'Dog park — {nh}', d:'Your dog played with mine for 20 minutes. Should have asked for your number.', p:[0,0] },
      { t:'Laundromat on {street}', d:'You made a joke about your socks never matching. I laughed too hard. Red sneakers, remember?', p:[0,0] },
      { t:'Bookstore — {nh}, Sunday', d:'You were in the poetry section. You bought a Neruda collection. So did I, after you left.', p:[0,0] },
      { t:'{train} train — Tuesday morning', d:'You let me have the last seat. I didnt want to interrupt your music. But I wish I had.', p:[0,0] },
      { t:'Farmers market — Union Square', d:'We both reached for the same peach. You laughed and let me have it. Tattoo sleeves.', p:[0,0] },
      { t:'Bar on {street} — Friday night', d:'You were reading alone at the bar. Vintage band tee. My friends dragged me away.', p:[0,0] },
      { t:'Grocery store — {nh}', d:'You helped me reach the top shelf. We talked in the checkout line. You just moved here. Welcome.', p:[0,0] },
      { t:'Concert at Brooklyn Steel', d:'We talked between sets about how underrated the band is. Lost you in the crowd. Denim jacket.', p:[0,0] },
      { t:'Pizza line — {place}', d:'We debated best pizza in NYC for 15 minutes. You said Lucalis, I said Di Fara. You were right.', p:[0,0] },
      { t:'Bodega cat — {street}', d:'We both stopped to pet the bodega cat. You said this is the real NYC experience. Great laugh.', p:[0,0] },
      { t:'Rooftop bar — {nh}', d:'You asked me to take your photo with the sunset. I said something dumb and you laughed anyway.', p:[0,0] },
      { t:'Halal cart on {street}', d:'Midnight. You made a joke about the hot sauce. We talked about {nh} for a few minutes. Purple jacket.', p:[0,0] },
      { t:'Gym on {street} — every morning', d:'We are on adjacent treadmills every single morning at 6am. Im the one without a water bottle.', p:[0,0] },
    ]},
    { sub:'strictly-platonic', items:[
      { t:'New to {nh} — looking for friends', d:'Just moved from {city}. 28, into cooking, hiking, live music. Would love to grab a beer.', p:[0,0] },
      { t:'Mom friends — {nh}', d:'Stay at home mom, 2 year old. Playground gets lonely. Playdates or adult conversation?', p:[0,0] },
      { t:'Friend group for 30s — {nh}', d:'All my friends moved to the suburbs. Looking for 30-somethings who want dinner, brunch, movies.', p:[0,0] },
      { t:'Creative friends — {nh}', d:'Writer looking for musicians, painters, filmmakers. Bounce ideas off each other. Or just tacos.', p:[0,0] },
      { t:'Dog park regulars — be friends?', d:'Im at the {nh} dog park every evening. Same faces, nobody talks. Lets change that.', p:[0,0] },
      { t:'Introvert seeking introvert — {nh}', d:'Best hangout = sitting in same room reading different books. Low-key friendship. Near {street}.', p:[0,0] },
      { t:'Transplant from {city} — need a crew', d:'NYC 3 months. Love it but eating alone is old. 25F, yoga, thrifting, shows. Please be my friend.', p:[0,0] },
      { t:'Weekend brunch crew — {nh}', d:'Standing brunch date. Every weekend, pick a spot, eat too much, complain about our weeks. No flaking.', p:[0,0] },
      { t:'Sober friends — {nh}', d:'Quit drinking a year ago. Social life took a hit. Looking for non-bar activities and real connection.', p:[0,0] },
      { t:'Night owl friends — {nh}', d:'Work late. Socialize after 10pm. Late-night food, walks, diners at 1am. My kind of thing.', p:[0,0] },
      { t:'Concert buddy — {nh}', d:'Nobody likes my music. Into indie, jazz, R&B. Brooklyn Steel, Bowery Ballroom, Blue Note.', p:[0,0] },
      { t:'Work from home buddy — {nh}', d:'Remote worker going insane. Looking for someone to co-work at cafes a few times/week.', p:[0,0] },
      { t:'New dad — other dads? {nh}', d:'34M, 6 month old. Friends without kids are tired of hearing about sleep schedules. Need dad friends.', p:[0,0] },
      { t:'Queer friends — {nh}', d:'Looking for queer friends outside bar/club settings. Movie nights, potlucks, park hangs.', p:[0,0] },
      { t:'Study buddy — {nh} cafes', d:'Grad student looking for accountability. Doesnt matter what you study. I buy first coffee.', p:[0,0] },
      { t:'honestly just lonely — {nh}', d:'I work from home, live alone, some days I dont talk to anyone. 31F. Lets just hang out sometimes.', p:[0,0] },
      { t:'Retired teacher, {nh}', d:'Taught 35 years. Just retired. Miss the energy. Anyone want to grab lunch, walk, play cards?', p:[0,0] },
      { t:'sunday coffee walk — {nh}', d:'Coffee from the spot on {street} then walk around the neighborhood for an hour. Every Sunday.', p:[0,0] },
      { t:'Nerds — {nh}', d:'D&D. Anime. Comic books. Building PCs. If you dont judge me we should hang. Snacks provided.', p:[0,0] },
      { t:'International potluck — {nh}', d:'Monthly dinner. Everyone brings a dish from home. Different country every month.', p:[0,0] },
    ]},
  ],
  housing: [
    { sub:'apartments', items:[
      { t:'Sunny 1BR — {nh}, great light', d:'South-facing. Heat included. Walk-up but worth it. Near {train} train. Available March 1.', p:[180000,280000] },
      { t:'Spacious 2BR, renovated — {nh}', d:'New kitchen, stainless appliances. Hardwood throughout. Laundry in building. No broker fee.', p:[250000,380000] },
      { t:'Studio, exposed brick — {nh}', d:'Charming walkup with brick. Top floor, quiet. Great closet. Near {train}. Cat-friendly.', p:[150000,200000] },
      { t:'Large 3BR — W/D in unit, {nh}', d:'Rare laundry in unit. Full kitchen. Near subway and parks. Family-friendly. Pets welcome.', p:[320000,450000] },
      { t:'Modern 2BR — rooftop, {nh}', d:'Doorman, gym, rooftop views. Central AC, in-unit W/D. Walk to {train}. Pet-friendly.', p:[350000,480000] },
      { t:'Rent-stabilized 1BR — {nh}', d:'Below market. Heat included. Quiet building, good super. Near {street}. Long-term lease.', p:[140000,180000] },
      { t:'4BR brownstone — {nh}', d:'Huge. Original details with updated kitchen. Backyard access. Near {street}. This will go fast.', p:[400000,550000] },
      { t:'Jr 1BR — {nh}', d:'Separate kitchen. Bright and clean. Laundry in basement. 5 min to {train}.', p:[155000,195000] },
    ]},
    { sub:'rooms-shared', items:[
      { t:'Room in 3BR — {nh}', d:'Private room. 2 chill roommates. Shared kitchen and bath. Near {train}. Utilities split.', p:[95000,140000] },
      { t:'Private room — all utils included, {nh}', d:'Furnished. WiFi, electric, heat included. No smoking. Month-to-month.', p:[110000,160000] },
      { t:'Master BR in 2BR — {nh}', d:'Biggest room. One roommate, 28F professional. Near {street}. Clean and respectful.', p:[120000,160000] },
      { t:'LGBTQ+ friendly room — {nh}', d:'Welcoming household, 3rd roommate needed. Near {train}. We have a cat. Utils included.', p:[100000,130000] },
      { t:'Furnished room — short term ok, {nh}', d:'Bed desk dresser. 3 month minimum. Working professionals. Near {street}.', p:[110000,150000] },
    ]},
    { sub:'sublets', items:[
      { t:'Summer sublet 1BR — {nh}', d:'June-Aug. Fully furnished, AC. Great location near {train}. Gym and laundry in building.', p:[180000,260000] },
      { t:'3-month sublet — {nh}', d:'Leaving for work March-May. Cute studio near {street}. Everything included. Bring clothes.', p:[150000,200000] },
      { t:'Furnished 1BR sublet — {nh}', d:'April through September. New building. Elevator. Doorman. All my furniture stays.', p:[200000,300000] },
    ]},
    { sub:'parking-storage', items:[
      { t:'Indoor parking — {nh}', d:'Covered indoor garage spot near {street}. 24/7 access. Fits sedan or small SUV.', p:[25000,45000] },
      { t:'Storage unit — {nh}', d:'5x10 climate controlled. Clean facility, security cameras. Month to month.', p:[15000,25000] },
    ]},
  ],
  jobs: [
    { sub:'restaurant-hospitality', items:[
      { t:'Line Cook — {nh} restaurant', d:'$18-22/hr + meal. Fast-paced. Experience required. Start immediately.', p:[0,0] },
      { t:'Server/Bartender — {nh}', d:'$15/hr + tips ($200-400/night). Wine knowledge a plus. Weekend availability required.', p:[0,0] },
      { t:'Barista — {nh} coffee shop', d:'$17/hr + tips. Latte art a plus. Morning shifts. Passionate about coffee.', p:[0,0] },
      { t:'Restaurant Manager — {nh}', d:'$55-65K + bonus. 3+ years managing. Staffing, ordering, customer issues.', p:[0,0] },
      { t:'Prep Cook — {nh}', d:'$16-18/hr. 6am-2pm. Chopping, portioning, prepping. Be reliable.', p:[0,0] },
    ]},
    { sub:'tech-engineering', items:[
      { t:'Junior Frontend Dev — hybrid', d:'$70-90K. React/Next.js. 1-2 yrs exp. In-office 3 days near {street}. Health + 401k.', p:[0,0] },
      { t:'Senior Backend Engineer — remote/NYC', d:'$150-180K. Python, PostgreSQL, AWS. 5+ years. Scaling fast. Equity available.', p:[0,0] },
      { t:'Full Stack — fintech, {nh}', d:'$120-160K. TypeScript, Node, React. Series B startup. Near {train}.', p:[0,0] },
      { t:'Data Analyst — healthcare', d:'$85-110K. SQL, Python, Tableau. Help us make sense of patient data. Hybrid.', p:[0,0] },
      { t:'IT Support — {nh}', d:'$55-70K. Small company, 40 employees, no IT person. Its a mess. Help.', p:[0,0] },
    ]},
    { sub:'trades-skilled-labor', items:[
      { t:'Electrician Apprentice — union', d:'$25-35/hr + benefits. Will train. Must be dependable. Steady pay.', p:[0,0] },
      { t:'Licensed Plumber — experienced', d:'$40-60/hr. 5+ yrs NYC. Residential and commercial. Own tools and van.', p:[0,0] },
      { t:'HVAC Tech — commercial', d:'$30-45/hr. EPA certified. Company vehicle provided. Benefits after 90 days.', p:[0,0] },
      { t:'Carpenter — custom work, {nh}', d:'$28-40/hr. Custom closets, shelving, trim. Quality over speed. Need references.', p:[0,0] },
      { t:'Painter — residential', d:'$25-35/hr. Interior/exterior. Must be clean and careful. High end apartments.', p:[0,0] },
    ]},
    { sub:'healthcare', items:[
      { t:'Home Health Aide — {nh}', d:'$17-20/hr. PCA or HHA certification required. Flexible schedule.', p:[0,0] },
      { t:'Medical Assistant — {nh}', d:'$18-22/hr. Bilingual preferred. Vitals, intake, EHR. Friendly clinic.', p:[0,0] },
      { t:'Dental Hygienist — {nh}', d:'$45-55/hr. Private practice. Modern equipment. 4 days/week, no weekends.', p:[0,0] },
    ]},
    { sub:'retail', items:[
      { t:'Retail Associate — {nh}', d:'$16-18/hr. Fashion-forward. Part/full-time. Employee discount.', p:[0,0] },
      { t:'Store Manager — {nh}', d:'$50-60K. 2+ years retail management. Inventory, staff, customer experience.', p:[0,0] },
    ]},
    { sub:'creative-media', items:[
      { t:'Graphic Designer — agency, {nh}', d:'$55-75K. Adobe Suite, Figma. 2+ years. Brand identity, social media. Hybrid.', p:[0,0] },
      { t:'Social Media Manager — startup', d:'$50-65K. Instagram, TikTok, LinkedIn. Content + strategy. Remote-first.', p:[0,0] },
      { t:'Video Editor — {nh}', d:'$60-80K. Premiere Pro, After Effects. Brands and docs. Send your reel.', p:[0,0] },
    ]},
    { sub:'education-teaching', items:[
      { t:'After-school Tutor — {nh}', d:'$25-40/hr. K-8 homework and test prep. 3-6pm weekdays. Background check required.', p:[0,0] },
      { t:'ESL Teacher — {nh}', d:'$30-40/hr. Adult immigrants. Evening classes. TESOL preferred.', p:[0,0] },
      { t:'Music Teacher — {nh}', d:'$40-60/hr. Piano and/or guitar. In-home lessons. Must be patient with beginners.', p:[0,0] },
    ]},
    { sub:'accounting-finance', items:[
      { t:'Staff Accountant — {nh}', d:'$65-80K. CPA preferred. Small firm near {street}. QuickBooks, tax prep, bookkeeping.', p:[0,0] },
      { t:'Bookkeeper — part-time, {nh}', d:'$30-40/hr. 15-20 hrs/week. Small businesses. QuickBooks Online. Remote OK.', p:[0,0] },
    ]},
    { sub:'admin-office', items:[
      { t:'Office Manager — {nh}', d:'$50-60K. Small office near {street}. Scheduling, supplies, phones, sanity.', p:[0,0] },
      { t:'Receptionist — {nh}', d:'$18-22/hr. Medical office. Bilingual a plus. Mon-Fri 9-5.', p:[0,0] },
    ]},
    { sub:'delivery-logistics', items:[
      { t:'Delivery Driver — {nh}', d:'$20-25/hr + tips. Must have own vehicle. Flexible hours. Mostly local.', p:[0,0] },
      { t:'Warehouse Associate — {nh}', d:'$18-22/hr. Picking, packing, shipping. Full-time. No experience needed.', p:[0,0] },
    ]},
  ],
  'for-sale': [
    { sub:'furniture', items:[
      { t:'Solid wood dining table — seats 6', d:'Moving, must sell. Real wood. Minor scratches. You haul. Cash only. Near {street}.', p:[10000,25000] },
      { t:'Mid-century modern couch', d:'From Article, 2 years old. No stains, no pets. Seats 3. You pick up.', p:[30000,60000] },
      { t:'Standing desk — electric adjustable', d:'Uplift V2. 48 inch. Dual motors. Bamboo top. Going back to office.', p:[20000,35000] },
      { t:'Queen bed frame — {nh}', d:'Sturdy platform, no box spring needed. No squeaks. Must pick up this weekend.', p:[12000,25000] },
      { t:'Couch — FREE, you haul, {nh}', d:'Gray sectional. Some wear but functional. Moving this weekend. Pick up Saturday.', p:[0,0] },
      { t:'IKEA Kallax 4x4 — white', d:'Assembled. Moving. Great for books/vinyl. You disassemble and haul.', p:[4000,8000] },
      { t:'Dresser — 6 drawer, {nh}', d:'Solid wood. All drawers work smoothly. Dark finish. Elevator in building.', p:[5000,12000] },
    ]},
    { sub:'electronics', items:[
      { t:'MacBook Pro M2 — 16GB', d:'Battery 98%. AppleCare until 2027. No scratches. Comes with charger and box.', p:[90000,130000] },
      { t:'PS5 + 2 controllers', d:'Disc edition. Works perfectly. 3 games. Original box. Dont game anymore.', p:[30000,45000] },
      { t:'Sony WH-1000XM5', d:'Best noise cancelling. 6 months old. Original case and box. Gift duplicate.', p:[18000,28000] },
      { t:'Samsung 55" 4K TV', d:'1 year old. Great picture. Wall mount or stand included. You pick up in {nh}.', p:[20000,35000] },
      { t:'iPhone 14 Pro — unlocked', d:'256GB. Midnight Purple. Case since day one. Zero scratches. Battery 91%.', p:[50000,75000] },
      { t:'iPad Air — Apple Pencil included', d:'WiFi 256GB. Used for drawing mostly. Getting a laptop instead.', p:[35000,50000] },
    ]},
    { sub:'bikes', items:[
      { t:'Trek FX3 hybrid — great commuter', d:'Carbon fork, disc brakes. One season. Fits 5\'8"-6\'0".', p:[35000,55000] },
      { t:'E-bike — 500W, 40mi range', d:'Pedal assist + throttle. 28mph. Removable battery. 3 months old.', p:[60000,100000] },
      { t:'Vintage road bike — {nh}', d:'80s Bianchi. Steel frame. New tires and chain. Classic ride.', p:[25000,40000] },
    ]},
    { sub:'free-stuff', items:[
      { t:'Free couch — you haul, {nh}', d:'Gray sectional. Some wear but functional. Moving this weekend. Pick up Saturday.', p:[0,0] },
      { t:'Moving boxes — free, {nh}', d:'About 30 boxes, packing paper, bubble wrap. First come. On {street}.', p:[0,0] },
      { t:'Books — 3 boxes free, {nh}', d:'Fiction, non-fiction, cookbooks. Downsizing. Take some or all. On stoop Saturday.', p:[0,0] },
      { t:'Baby clothes — free, {nh}', d:'Newborn to 18 months. Clean. Bags of onesies, pajamas, jackets. On {street}.', p:[0,0] },
    ]},
    { sub:'vinyl-records', items:[
      { t:'Jazz collection — 40 records', d:'Coltrane, Monk, Miles, Mingus. All VG+. Lot only. 20 years collecting.', p:[20000,40000] },
      { t:'Hip hop vinyl — 25 albums', d:'Nas, Biggie, Tribe, OutKast. Mix of originals and reissues. Meet in {nh}.', p:[15000,25000] },
    ]},
    { sub:'sneakers-streetwear', items:[
      { t:'Jordan 4 Bred — sz 10, DS', d:'Deadstock with SNKRS receipt. Never tried on. Price firm.', p:[22000,30000] },
      { t:'New Balance 990v6', d:'Made in USA. Gray. Worn twice. Too narrow. Basically new.', p:[14000,20000] },
    ]},
    { sub:'clothing-accessories', items:[
      { t:'Winter coat — North Face, {nh}', d:'700 fill down. Black. Worn one season. Too warm for me.', p:[12000,20000] },
      { t:'Vintage leather jacket', d:'80s biker jacket. Worn in perfectly. Fits M/L. Meet in {nh}.', p:[15000,30000] },
    ]},
    { sub:'instruments', items:[
      { t:'Yamaha keyboard — 88 keys', d:'Weighted keys. Great for beginners. Comes with stand and pedal. {nh}.', p:[20000,40000] },
      { t:'Acoustic guitar — {nh}', d:'Martin D-15. Mahogany. Plays beautifully. Comes with hard case.', p:[50000,90000] },
      { t:'Fender Strat — MIM', d:'Mexican Strat. Sunburst. Plays great. Includes gig bag. Near {street}.', p:[40000,65000] },
    ]},
    { sub:'home-decor', items:[
      { t:'Large mirror — gold frame, {nh}', d:'5 feet tall. Statement piece. Perfect condition. You haul.', p:[8000,15000] },
      { t:'Rug — 8x10, {nh}', d:'Persian-style. Clean, no stains. Moving and it wont fit. Beautiful colors.', p:[10000,25000] },
    ]},
    { sub:'kitchen-dining', items:[
      { t:'KitchenAid stand mixer — red', d:'Artisan 5qt. Used maybe 10 times. All attachments. Moving.', p:[15000,25000] },
      { t:'Cast iron collection — {nh}', d:'Lodge skillet, Dutch oven, griddle. Well seasoned. Take all 3.', p:[8000,15000] },
    ]},
    { sub:'sporting-goods', items:[
      { t:'Surfboard — 7ft funboard', d:'Great for Rockaway. Barely used. Fins included. Pick up in {nh}.', p:[20000,35000] },
      { t:'Dumbbells — adjustable, {nh}', d:'Bowflex 552. 5-52.5 lbs each. Like new. Moving.', p:[20000,30000] },
    ]},
  ],
  services: [
    { sub:'cleaning', items:[
      { t:'Deep cleaning — {nh}', d:'Licensed, insured, 10 years. Ovens, fridges, baseboards. Move-in/out specials.', p:[15000,30000] },
      { t:'Weekly apartment cleaning — {nh}', d:'Same cleaner every week. Consistent and reliable. Supplies included.', p:[10000,18000] },
    ]},
    { sub:'handyman', items:[
      { t:'Handyman — no job too small, {nh}', d:'TV mounting, shelves, minor plumbing, drywall. 15 years. Licensed.', p:[7500,15000] },
      { t:'Furniture assembly — flat rate', d:'IKEA, Wayfair. Flat rate per piece. Own tools. Same-day available.', p:[5000,10000] },
    ]},
    { sub:'moving-hauling', items:[
      { t:'2 movers + truck — $300', d:'Licensed, insured. No hidden fees. Local NYC. Padding and dollies included.', p:[25000,50000] },
      { t:'Junk removal — same day, {nh}', d:'We haul anything. Furniture, appliances, construction debris. Call for quote.', p:[10000,30000] },
    ]},
    { sub:'tutoring', items:[
      { t:'Math tutor — all levels, {nh}', d:'Columbia grad. Algebra to Calculus. $60/hr. In-person or online.', p:[5000,10000] },
      { t:'SAT/ACT prep — 1500+ scorer', d:'Scored 1560. Personalized plans. $80/hr. Results guaranteed.', p:[7000,12000] },
    ]},
    { sub:'photography', items:[
      { t:'NYC portrait photographer', d:'Natural light. Parks, rooftops, streets. 1-hour session, 30+ photos.', p:[15000,30000] },
      { t:'Headshots — professional, {nh}', d:'LinkedIn, acting, dating apps. 30-min, 10 retouched photos.', p:[12000,25000] },
    ]},
    { sub:'personal-training', items:[
      { t:'Personal Trainer — {nh}', d:'NASM certified. In-home or park. Weight loss, strength, flexibility. Free consult.', p:[7000,15000] },
    ]},
    { sub:'web-app-dev', items:[
      { t:'Web developer — freelance, {nh}', d:'React, Next.js, WordPress. 8 years experience. Fast turnaround. Portfolio available.', p:[5000,15000] },
      { t:'Shopify expert — {nh}', d:'Setup, customization, migration. 50+ stores built. Flat rate projects.', p:[10000,30000] },
    ]},
    { sub:'auto-repair', items:[
      { t:'Mobile mechanic — {nh}', d:'I come to you. Oil changes, brakes, diagnostics. 15 years experience. Fair prices.', p:[5000,20000] },
    ]},
    { sub:'plumbing', items:[
      { t:'Plumber — emergency available, {nh}', d:'Licensed. Leaks, clogs, installations. Same-day service. No trip charge.', p:[10000,30000] },
    ]},
    { sub:'electrical', items:[
      { t:'Electrician — licensed, {nh}', d:'Outlets, panels, fixtures, rewiring. 20 years. Insured. Free estimates.', p:[10000,25000] },
    ]},
    { sub:'painting', items:[
      { t:'Apartment painter — {nh}', d:'Interior specialist. Clean lines, no drips. References available. Free quote.', p:[15000,40000] },
    ]},
    { sub:'tailoring', items:[
      { t:'Tailor — alterations, {nh}', d:'Hemming, taking in, letting out. 25 years experience. Quick turnaround.', p:[2000,8000] },
    ]},
    { sub:'pet-grooming', items:[
      { t:'Dog grooming — mobile, {nh}', d:'I come to your apartment. Bath, haircut, nails. Gentle with nervous dogs.', p:[5000,12000] },
    ]},
  ],
  gigs: [
    { sub:'moving-help', items:[
      { t:'Help moving Saturday — {nh}', d:'Moving 2BR to 1BR. Need 2 people. 3 hours. $100 each + pizza.', p:[8000,15000] },
    ]},
    { sub:'dog-walking', items:[
      { t:'Dog walker weekdays — {nh}', d:'30-min midday walk Mon-Fri. Friendly goldendoodle. Near {street}.', p:[2000,3000] },
    ]},
    { sub:'delivery-runs', items:[
      { t:'Pick up furniture — {nh}', d:'Need car to pick up dresser from Brooklyn. Should take an hour. $75 cash.', p:[5000,10000] },
    ]},
    { sub:'pet-sitting', items:[
      { t:'Cat sitter — 5 days, {nh}', d:'Stop by daily for feeding and litter. Easy cat. $25/day. Near {street}.', p:[2000,3500] },
    ]},
    { sub:'tech-help', items:[
      { t:'Smart home setup — {nh}', d:'Bought smart lights and thermostat. Need someone to set it all up. 2 hours. $60.', p:[4000,8000] },
    ]},
    { sub:'event-setup', items:[
      { t:'Help setting up party — {nh}', d:'Birthday party Saturday. Need help with decorations and tables. 3 hours. $80.', p:[6000,10000] },
    ]},
    { sub:'bartending', items:[
      { t:'Bartender needed — private party, {nh}', d:'Saturday night. 4 hours. 30 guests. $150 + tips. I provide everything.', p:[12000,20000] },
    ]},
    { sub:'furniture-assembly', items:[
      { t:'IKEA assembly — 3 pieces, {nh}', d:'PAX wardrobe, MALM dresser, KALLAX shelf. Have tools? $100 flat.', p:[8000,12000] },
    ]},
    { sub:'cleaning', items:[
      { t:'Post-party cleanup — {nh}', d:'Sunday morning. Apartment is a disaster. 2-3 hours. $100 cash.', p:[8000,12000] },
    ]},
    { sub:'photography', items:[
      { t:'Photographer for small event — {nh}', d:'Birthday party, 2 hours. 50+ edited photos. Casual vibe. Near {street}.', p:[15000,25000] },
    ]},
  ],
  community: [
    { sub:'events', items:[
      { t:'Block party this Saturday — {nh}', d:'{street} is closed from 2-8pm. Live music, food vendors, activities for kids.', p:[0,0] },
      { t:'Free yoga in the park — {nh}', d:'Every Sunday at 9am near {street}. All levels welcome. Bring your own mat.', p:[0,0] },
      { t:'Open mic night — {nh}', d:'{place} is doing open mic every Thursday. Music, comedy, poetry. Sign up at 7pm.', p:[0,0] },
      { t:'Community cleanup — {nh}', d:'Cleaning up {street} this Saturday morning. Gloves and bags provided. Meet at 10am.', p:[0,0] },
    ]},
    { sub:'local-alerts', items:[
      { t:'Water main break on {street}', d:'Huge puddle forming. Water pressure low. Fill up bottles just in case.', p:[0,0] },
      { t:'Suspicious activity — {nh}', d:'Someone trying car doors on {street} late at night. Saw on Ring camera around 2am. Lock your cars.', p:[0,0] },
      { t:'Scam alert — fake parking tickets, {nh}', d:'Someone putting fake tickets on cars near {street} with a QR code. Real tickets are orange.', p:[0,0] },
      { t:'Power outage — {nh} area', d:'Power out since 6pm on {street}. ConEd says working on it. Anyone got an ETA?', p:[0,0] },
    ]},
    { sub:'recommendations', items:[
      { t:'Best pizza near {nh}?', d:'Just moved to {nh} and looking for solid pizza. Not fancy, just good. Near {street} if possible.', p:[0,0] },
      { t:'Amazing coffee shop on {street}', d:'Just found {place} and its incredible. Great vibes, friendly staff. Definitely check it out.', p:[0,0] },
      { t:'Good mechanic in {nh}?', d:'Need an honest mechanic. Last place tried to charge me $800 for brake pads.', p:[0,0] },
      { t:'Best laundromat in {nh}', d:'The one on {street} has new machines and AC. Way better than the old one.', p:[0,0] },
    ]},
    { sub:'neighborhood-questions', items:[
      { t:'Anyone know when {street} construction ends?', d:'The noise has been going on for weeks. Cant sleep. Does anyone know the timeline?', p:[0,0] },
      { t:'Package theft — anyone else in {nh}?', d:'Third package stolen this month. Is this happening to others near {street}?', p:[0,0] },
      { t:'Is the {train} train running normal?', d:'Seems like every morning the {train} is delayed. Ongoing work?', p:[0,0] },
    ]},
    { sub:'welcome-new-here', items:[
      { t:'Just moved to {nh}!', d:'Moved from {city} last week. Loving it so far. Any tips for the neighborhood?', p:[0,0] },
      { t:'Hello from {nh}', d:'Been here a month and finally feeling settled. This app is great for meeting the neighborhood.', p:[0,0] },
      { t:'New to {nh} — where should I eat?', d:'Just arrived from {city}. I eat everything. Whats the must-try spot near {street}?', p:[0,0] },
    ]},
    { sub:'groups', items:[
      { t:'Running group — {nh}', d:'Morning running group. 3x/week, 3-5 miles. All paces welcome. Meet at {street}.', p:[0,0] },
      { t:'Book club — {nh}', d:'Monthly book club. Meet at {place} near {street}. First book TBD by group.', p:[0,0] },
      { t:'Pickup soccer — Sundays, {nh}', d:'Every Sunday at 10am near {street}. Co-ed, all levels. Bring cleats and water.', p:[0,0] },
    ]},
    { sub:'shoutouts', items:[
      { t:'Shoutout to {place} in {nh}', d:'Been going here for years and they never disappoint. Staff remembers your order.', p:[0,0] },
      { t:'Thank you to the person on {street}', d:'You helped me carry my groceries up 4 flights. Faith in humanity restored.', p:[0,0] },
    ]},
    { sub:'stoop-sales', items:[
      { t:'Stoop sale this Sunday — {street}', d:'Clearing out the apartment. Furniture, clothes, books, records. Starts at 9am.', p:[0,0] },
      { t:'Moving sale — everything must go, {nh}', d:'Bed frame, couch, desk, kitchen supplies. {street}. Saturday and Sunday 9am-3pm.', p:[0,0] },
    ]},
    { sub:'volunteers', items:[
      { t:'Volunteers needed — food pantry, {nh}', d:'Every Saturday morning on {street}. Need help sorting and handing out. Even 1 hour helps.', p:[0,0] },
      { t:'Tutoring volunteers — {nh}', d:'After-school program near {street} needs tutors. Tuesdays and Thursdays 3-5pm.', p:[0,0] },
    ]},
    { sub:'garage-sales', items:[
      { t:'Garage sale — tools and furniture, {nh}', d:'Power tools, hand tools, workbench, plus furniture. Saturday 8am-noon. {street}. Cash only.', p:[0,0] },
    ]},
    { sub:'carpool-rideshare', items:[
      { t:'Carpool to Midtown from {nh}', d:'Driving every morning around 7:30am. Room for 2. Split gas and tolls.', p:[0,0] },
    ]},
    { sub:'lost-found', items:[
      { t:'Lost keys — {nh} area', d:'Dropped my keys between {street} and the subway. Silver keyring with a Mets bottle opener.', p:[0,0] },
      { t:'Found wallet near {street}', d:'Found a brown leather wallet on the sidewalk near {street} in {nh}. Has ID inside. DM me.', p:[0,0] },
    ]},
  ],
  tickets: [
    { sub:'concerts', items:[
      { t:'2 tix — MSG show', d:'Section 112. Cant make it. Face value. Transfer via Ticketmaster.', p:[10000,25000] },
      { t:'Brooklyn Steel — sold out, 2 tix', d:'GA standing. Work conflict. Face value. Instant transfer.', p:[5000,12000] },
      { t:'Bowery Ballroom — tonight', d:'Cant go. 2 tickets. Face value. Transfer immediately.', p:[4000,8000] },
    ]},
    { sub:'sports', items:[
      { t:'Knicks tix — lower level', d:'Section 105. Weeknight game. Face value. Transfer via Ticketmaster.', p:[12000,25000] },
      { t:'Yankees — 2 tickets', d:'Section 110, row 8. Weekend game. Face value.', p:[15000,35000] },
      { t:'Mets — field level, 2 seats', d:'Great seats. Dodgers game. Face value transfer.', p:[10000,25000] },
    ]},
    { sub:'broadway', items:[
      { t:'Hamilton — orchestra, 2 seats', d:'Row M center. Hard to get at face. Will transfer immediately.', p:[20000,40000] },
      { t:'Wicked — Saturday matinee', d:'Mezzanine center. Great view. Face value transfer.', p:[12000,25000] },
    ]},
    { sub:'comedy', items:[
      { t:'Comedy Cellar — 2 spots tonight', d:'Cant make it. 9pm show. Best comedy club in the city. Face value.', p:[3000,6000] },
      { t:'Gotham Comedy — Saturday', d:'4 tickets. Headliner is great. Transfer via app.', p:[4000,8000] },
    ]},
  ],
  pets: [
    { sub:'adoption', items:[
      { t:'Sweet tabby needs home — {nh}', d:'3yo, spayed, all shots. Indoor only. Very affectionate. Comes with supplies.', p:[0,0] },
      { t:'Rescue pit mix — great with kids', d:'2yo, neutered, vaccinated. Gentle giant. Was a stray, now a sweetheart.', p:[0,0] },
      { t:'2 bonded cats — {nh}', d:'Must go together. 4yo siblings. Indoor. Litter trained. Moving and cant take them.', p:[0,0] },
    ]},
    { sub:'pet-sitting', items:[
      { t:'Cat sitter 1 week — {nh}', d:'Feed, water, scoop litter, give love. Easy cat. $25/visit.', p:[2000,3500] },
      { t:'Dog sitter — weekend, {nh}', d:'Friday night to Sunday. Small dog. $50/night. Walks 3x/day.', p:[4000,6000] },
    ]},
    { sub:'lost-found-pets', items:[
      { t:'LOST — orange tabby, {nh}', d:'Indoor cat escaped near {street}. Responds to Mango. Very friendly. Reward.', p:[0,0] },
      { t:'FOUND — small white dog, {nh}', d:'Found near {street}. No collar, no chip. Safe at my apartment. Looking for owner.', p:[0,0] },
    ]},
    { sub:'dog-walking', items:[
      { t:'Dog walker needed — {nh}', d:'2 walks/day. Medium mutt. Near {street}. $20/walk. Long-term preferred.', p:[1500,2500] },
    ]},
    { sub:'grooming', items:[
      { t:'Cat grooming — gentle, {nh}', d:'Long hair cat needs grooming. Your place or mine. Must be patient.', p:[4000,8000] },
    ]},
  ],
  barter: [
    { sub:'goods-for-goods', items:[
      { t:'Trade: KitchenAid for bike', d:'Red stand mixer for commuter bike. Also open to other trades. {nh}.', p:[0,0] },
      { t:'Swap: PS5 for Switch + cash', d:'PS5 disc for Switch OLED + $100. Meet in {nh}.', p:[0,0] },
      { t:'Trade: vinyl collection for turntable', d:'50+ records for a decent turntable. All genres. Meet in {nh}.', p:[0,0] },
    ]},
    { sub:'skills-for-skills', items:[
      { t:'Trade: Spanish for guitar lessons', d:'Native speaker. Want guitar. Weekly. All levels.', p:[0,0] },
      { t:'Swap: web design for photography', d:'I build websites. Need product photos. Trade services.', p:[0,0] },
      { t:'Trade: cooking lessons for yoga', d:'I cook Italian. Want to learn yoga. Weekly swap in {nh}.', p:[0,0] },
    ]},
    { sub:'goods-for-skills', items:[
      { t:'Trade: MacBook for tutoring', d:'MacBook Air M1 for 20 hours of math tutoring. Meet in {nh}.', p:[0,0] },
      { t:'Trade: furniture for moving help', d:'Nice desk + chair for help moving next weekend. {nh}.', p:[0,0] },
    ]},
  ],
  rentals: [
    { sub:'tools-equipment', items:[
      { t:'Power drill rental — $15/day', d:'DeWalt 20V. Charger and 2 batteries. Pick up in {nh}.', p:[1500,2000] },
      { t:'Pressure washer rental — {nh}', d:'Electric. Great for decks and sidewalks. $25/day. Pickup only.', p:[2000,3000] },
    ]},
    { sub:'cameras-gear', items:[
      { t:'Sony A7III — $75/day', d:'Full frame mirrorless. 2 batteries. Proof of ID required. {nh}.', p:[7500,10000] },
      { t:'Drone rental — DJI Mini 3', d:'4K video. 38 min flight time. $50/day. Tutorial included. {nh}.', p:[4000,6000] },
    ]},
    { sub:'party-supplies', items:[
      { t:'Tables + chairs — event rental', d:'10 tables, 40 chairs. Delivery in {nh}. $50/day.', p:[4000,6000] },
      { t:'Speaker rental — parties, {nh}', d:'JBL Partybox 310. Loud. $35/day. Pick up near {street}.', p:[3000,4000] },
    ]},
    { sub:'sports-equipment', items:[
      { t:'Camping gear rental — {nh}', d:'Tent (4 person), sleeping bags, stove. $40/weekend. Everything you need.', p:[3000,5000] },
      { t:'Kayak rental — {nh}', d:'2 person inflatable kayak. $30/day. Pump and paddles included.', p:[2500,4000] },
    ]},
  ],
  resumes: [
    { sub:'software-engineering', items:[
      { t:'Full Stack Dev — 5 yrs exp', d:'React, Node, TypeScript, PostgreSQL. Looking for hybrid or remote in NYC.', p:[0,0] },
      { t:'Frontend Engineer — 3 yrs', d:'React, Next.js, TypeScript. E-commerce and SaaS experience. Portfolio available.', p:[0,0] },
    ]},
    { sub:'creative-media', items:[
      { t:'Graphic Designer — 7 yrs', d:'Adobe Suite, Figma. Brand identity, print, digital. Portfolio available.', p:[0,0] },
      { t:'Video Editor — 4 yrs', d:'Premiere, After Effects, DaVinci. Commercials, music videos, social. Reel available.', p:[0,0] },
    ]},
    { sub:'healthcare', items:[
      { t:'Registered Nurse — 6 yrs', d:'Med-surg and ICU. BLS, ACLS certified. Looking for full-time in {nh} area.', p:[0,0] },
      { t:'Physical Therapist — 4 yrs', d:'Orthopedic and sports PT. DPT degree. Seeking outpatient clinic.', p:[0,0] },
    ]},
    { sub:'trades-skilled-labor', items:[
      { t:'Licensed Electrician — 10 yrs', d:'Residential and commercial. Available for full-time or contract. References.', p:[0,0] },
    ]},
    { sub:'restaurant-hospitality', items:[
      { t:'Executive Chef — 12 yrs', d:'Fine dining and casual. Menu development, team leadership. Seeking new challenge.', p:[0,0] },
      { t:'Hotel Front Desk — 3 yrs', d:'Bilingual. Night audit experience. Guest services. Available immediately.', p:[0,0] },
    ]},
    { sub:'accounting-finance', items:[
      { t:'CPA — 8 yrs public/private', d:'Tax, audit, advisory. Big 4 experience. Seeking controller or senior role.', p:[0,0] },
    ]},
    { sub:'marketing-advertising', items:[
      { t:'Marketing Manager — 5 yrs', d:'B2B SaaS. Demand gen, content, events. HubSpot certified. Data-driven.', p:[0,0] },
    ]},
    { sub:'education-teaching', items:[
      { t:'Special Ed Teacher — 6 yrs', d:'K-5 certified. IEP development. Bilingual (Spanish). Seeking full-time.', p:[0,0] },
    ]},
  ],
}

// ─── PORCH TEMPLATES ───
const PORCH_TYPES = ['recommendation','question','alert','lost-and-found','event','stoop-sale','garage-sale','volunteer','carpool','pet-sighting','welcome','group']
const PORCH = {
  recommendation: [
    { t:'Best pizza in {nh} — hands down', b:'If you havent tried {place} on {street} you are missing out. Their margherita is perfect. Cash only.' },
    { t:'Amazing dentist in {nh}', b:'Dr. {last} on {street} is incredible. No wait, gentle, takes most insurance.' },
    { t:'Best coffee for remote work — {nh}', b:'The cafe on {street} has great wifi, outlets everywhere, and they dont rush you.' },
    { t:'Great tailor on {street}', b:'The tailor near {street} is amazing. Quick turnaround, fair prices. Fixed my jacket for $20.' },
    { t:'{place} on {street} is ELITE', b:'ngl the food at {place} is unmatched rn. went three times this week. {nh} is blessed fr fr' },
    { t:'Best bodega breakfast in {nh}', b:'The bodega on {street} makes a bacon egg and cheese that changed my life. $5. No cap.' },
    { t:'Shoutout to {place}', b:'Been going here for years and they never disappoint. Staff remembers your order.' },
    { t:'Great vet in {nh}', b:'Dr. {last} at {street} Animal Hospital. Gentle with my anxious dog, transparent pricing.' },
    { t:'Best dumplings near {nh}', b:'{place} on {street}. 8 dumplings for $3.50. Pork and chive. Get the spicy sauce.' },
    { t:'Locksmith saved me — {nh}', b:'Locked out at midnight. {last} Locksmith came in 20 minutes, $60, no BS upcharge.' },
  ],
  question: [
    { t:'Anyone know when {street} construction ends?', b:'The noise has been going on for weeks. Cant sleep. Does anyone know the timeline?' },
    { t:'Good gym near {nh}?', b:'Looking for a gym thats not Planet Fitness but also not $200/month. Near {street}.' },
    { t:'Package theft — anyone else in {nh}?', b:'Third package stolen this month. Front door has no camera. Anyone else near {street}?' },
    { t:'Is the {train} train running normal?', b:'Seems like every morning the {train} is delayed. Is there ongoing work?' },
    { t:'What happened on {street} this morning?', b:'Saw 3 fire trucks and an ambulance around 8am. Hope everyone is OK.' },
    { t:'Dog friendly restaurants in {nh}?', b:'We have a small dog and want to eat outside. Any spots cool with well-behaved dogs?' },
    { t:'Best internet provider in {nh}?', b:'Optimum is trash. Is Fios available on {street}? What do you all use?' },
    { t:'Parking situation near {street}?', b:'About to move to {nh}. I have a car. How bad is alternate side? Any tips?' },
  ],
  alert: [
    { t:'Water main break on {street}', b:'Huge puddle forming and water pressure is low. Fill up bottles just in case.' },
    { t:'Suspicious activity — {nh}', b:'Someone trying car doors on {street} late at night. Saw on Ring camera around 2am. Lock your cars.' },
    { t:'Power outage — {nh} area', b:'Power out since 6pm on {street}. ConEd says working on it.' },
    { t:'Scam alert — fake parking tickets in {nh}', b:'Someone putting fake tickets on cars near {street} with a QR code. Real tickets are orange.' },
    { t:'Flooding on {street}', b:'The drain is clogged again and {street} is a lake. Be careful driving through {nh}.' },
  ],
  'lost-and-found': [
    { t:'Lost keys — {nh} area', b:'Dropped my keys between {street} and the subway. Silver keyring with a Mets bottle opener.' },
    { t:'Found wallet near {street}', b:'Found a brown leather wallet on the sidewalk in {nh}. Has ID inside. DM me your name.' },
    { t:'Lost phone — {nh} park', b:'Left my phone on a bench near {street}. Black iPhone in a blue case. Reward if found.' },
    { t:'Found cat — {nh}', b:'Found an orange tabby hiding under a car on {street}. Very friendly, no collar.' },
    { t:'Lost dog — {nh}', b:'Small brown dog ran out the door near {street}. Answers to Biscuit. Please call if you see him.' },
  ],
  event: [
    { t:'Block party this Saturday — {nh}', b:'{street} closed from 2-8pm. Live music, food vendors, activities for kids.' },
    { t:'Free yoga in the park — {nh}', b:'Every Sunday at 9am near {street}. All levels welcome. Bring your own mat.' },
    { t:'Open mic night — {nh}', b:'{place} doing open mic every Thursday. Music, comedy, poetry. Sign up at 7pm.' },
    { t:'Community cleanup — {nh}', b:'Cleaning up {street} this Saturday morning. Gloves and bags provided. 10am.' },
    { t:'Outdoor movie night — {nh}', b:'Projecting a movie in the park near {street} Friday at 8pm. Bring blankets.' },
  ],
  'stoop-sale': [
    { t:'Stoop sale this Sunday — {street}', b:'Clearing out. Furniture, clothes, books, records. {nh}, starts at 9am.' },
    { t:'Stoop sale — designer clothes, {nh}', b:'Designer clothes, shoes, bags. Everything under $50. Saturday 10am-2pm on {street}.' },
    { t:'Moving sale — everything must go', b:'Bed frame, couch, desk, kitchen supplies. {street}. Sat and Sun 9am-3pm.' },
  ],
  'garage-sale': [
    { t:'Garage sale — tools and furniture, {nh}', b:'Power tools, hand tools, workbench, plus furniture. Saturday 8am-noon. {street}. Cash only.' },
    { t:'Neighborhood garage sale — {nh}', b:'Multiple houses on {street} doing a joint sale this weekend. Tons of stuff.' },
  ],
  volunteer: [
    { t:'Volunteers needed — food pantry, {nh}', b:'Every Saturday morning on {street}. Need help sorting and handing out. Even 1 hour helps.' },
    { t:'Tutoring volunteers — {nh}', b:'After-school program near {street} needs tutors. Tuesdays and Thursdays 3-5pm.' },
    { t:'Park cleanup — {nh}', b:'Help us clean up near {street}. Saturday mornings. Gloves, bags, coffee provided.' },
  ],
  carpool: [
    { t:'Carpool to Midtown from {nh}', b:'Driving every morning around 7:30am. Room for 2. Split gas and tolls.' },
    { t:'Ride to airport — {nh}', b:'Need a ride to JFK this Friday morning around 6am. Will pay $40. Near {street}.' },
  ],
  'pet-sighting': [
    { t:'Loose dog — {nh}', b:'Small brown dog running loose near {street}. No collar. Looks scared.' },
    { t:'Hawk nesting near {street}', b:'Red-tailed hawk nesting on the building at {street}. Bring binoculars.' },
    { t:'Raccoon family — {nh}', b:'Spotted a family of raccoons behind the building on {street}. Cute but careful with trash.' },
  ],
  welcome: [
    { t:'Just moved to {nh}!', b:'Moved from {city} last week. Loving it so far. Any tips for the neighborhood?' },
    { t:'Hello from {nh}', b:'Been here a month and finally feeling settled. Excited to be here.' },
    { t:'New to {nh} — where should I eat?', b:'Just arrived from {city}. I eat everything. Hit me with your favorites near {street}.' },
  ],
  group: [
    { t:'Running group — {nh}', b:'Morning running group. 3x/week, 3-5 miles. All paces welcome. Meet at {street}.' },
    { t:'Book club — {nh}', b:'Monthly. Meet at {place} near {street}. First book TBD by group.' },
    { t:'Pickup soccer — Sundays, {nh}', b:'Every Sunday at 10am near {street}. Co-ed, all levels. Bring cleats.' },
    { t:'Walking group — {nh}', b:'Mornings before work. 6:30am from {street}. 2-3 miles. All welcome.' },
  ],
}

// ─── REPLY TEMPLATES ───
const REPLIES_SHORT = [
  'facts.', 'W post', '+1', 'this!!!', 'same tbh', 'vouch', 'Bookmarked.', 'yooo this',
  'say less', 'need this', 'following', 'bump', 'real', 'hard agree', 'period.', 'louder.',
  'ong', 'no fr', 'bless', 'clutch info', 'saved this', 'screenshotted lol',
]
const REPLIES_MEDIUM = [
  'Can confirm — went there last week.', 'Thanks for the heads up!',
  'My neighbor said the same thing.', 'Shared with my building group chat.',
  'This is why I love this neighborhood.', 'Welcome to the neighborhood!',
  'DM me, I have a recommendation.', 'Seconding this 100%.',
  'Good looking out for the community.', 'Adding this to my list.',
  'bro THANK YOU', 'ur doing gods work posting this',
  'been here 20 years and still learn new stuff', 'Real recognize real.',
  'ok wait this is exactly what I needed', 'just sent this to my roommate',
  'how did I not know about this until now', 'ok going this weekend for sure',
  'this neighborhood really is the best sometimes', 'appreciate you posting this',
  'I literally walked past this every day and never noticed',
]
const REPLIES_LONG = [
  'honestly this is exactly what I needed to hear. been living in this neighborhood for 3 years and never knew about this. going this weekend for sure',
  'my grandma has been going there for 30 years and she would be so happy to see this post. gonna show her right now',
  'I used to work there actually — the owners are amazing people. they treat their employees well too which says a lot',
  'ok so I finally went based on this recommendation and WOW. you were not lying. the food was incredible and the service was even better',
  'this is the kind of post that makes this app worth having. real neighborhood info from real people. not some yelp review from a tourist',
  'I moved here from {city} 6 months ago and posts like this are literally the only reason I feel connected to the neighborhood',
  'not me literally running out the door right now to check this out. I will report back',
  'been meaning to find something like this. thank you for doing the homework for the rest of us lol',
  'the person who runs that place is a gem. they remembered my name after one visit. thats NYC at its best',
  'ok this thread is gold. saving the whole thing. yall are the best neighbors fr',
]
const REPLIES_DISAGREE = [
  'respectfully disagree — I went there and it was mid', 'idk about that one, had a totally different experience',
  'nah the spot on {street} is way better imo', 'I mean its fine but its not THAT good',
  'different experience here unfortunately. service was slow and food was cold',
  'ehh went there twice and both times were underwhelming. maybe I went on an off day',
]
const REPLIES_QUESTION = [
  'how much does it usually cost?', 'what time do they close?', 'is it kid-friendly?',
  'do they take reservations?', 'cash only or do they take card?', 'is there a wait usually?',
  'do they deliver?', 'is it accessible?', 'do they have outdoor seating?',
  'whats the best thing on the menu?', 'are they open on weekends?', 'is parking easy there?',
]

function pickReply() {
  const r = Math.random()
  if (r < 0.25) return pick(REPLIES_SHORT)
  if (r < 0.55) return pick(REPLIES_MEDIUM)
  if (r < 0.75) return pick(REPLIES_LONG)
  if (r < 0.88) return pick(REPLIES_DISAGREE)
  return pick(REPLIES_QUESTION)
}

// ─── Coverage tracker ───
function createCoverage() {
  const allNhs = []
  for (const [b, data] of Object.entries(BOROUGHS)) {
    for (const nh of data.nhs) allNhs.push({ borough: b, nh })
  }
  let remaining = [...allNhs].sort(() => Math.random() - 0.5)
  return {
    next() {
      if (remaining.length === 0) remaining = [...allNhs].sort(() => Math.random() - 0.5)
      return remaining.pop()
    }
  }
}

// ════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════
async function main() {
  const startTime = Date.now()
  console.log('═══════════════════════════════════════')
  console.log('  NYC CLASSIFIEDS — MEGA SEED')
  console.log('  2,000 users + 100,000 listings')
  console.log('  25,000 porch + 15,000 replies')
  console.log('═══════════════════════════════════════\n')

  // ── 1. CREATE 2,000 USERS ──
  console.log('1. Creating 2,000 users...')
  const userRows = []
  for (let i = 0; i < 2000; i++) {
    const demo = pick(DEMO_WEIGHTS)
    const pool = NAMES[demo]
    if (!pool) continue
    const first = pick(pool.first)
    const last = pick(pool.last)
    const name = `${first} ${last}`
    const email = `${first.toLowerCase()}.${last.toLowerCase()}${rb(100,9999)}@example.com`
    const borough = pick(BOROUGH_WEIGHTS)
    const b = BOROUGHS[borough]
    const nh = pick(b.nhs)
    const lat = b.lat + (Math.random() - 0.5) * 0.02
    const lng = b.lng + (Math.random() - 0.5) * 0.02
    const isBiz = Math.random() < 0.15
    const style = pick(AVATAR_STYLES)
    const bizName = isBiz ? `${last}'s ${pick(['Shop','Studio','Services','Co','Solutions','Place','Kitchen','Works'])}` : null
    const bizCat = isBiz ? pick(BIZ_CATS) : null
    const row = {
      email, name, pin: '$2b$10$placeholder',
      address: `${rb(1,999)} ${pick(STREETS)}, New York, NY`,
      lat, lng,
      selfie_url: `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(name+'-'+i)}&size=200`,
      selfie_geolat: lat, selfie_geolon: lng,
      verified: true,
      account_type: isBiz ? 'business' : 'personal',
      business_name: bizName,
      business_slug: bizName ? slug(bizName + '-' + nh) : null,
      business_category: bizCat,
      business_description: bizCat ? `Local ${bizCat.toLowerCase()} serving ${nhName(nh)} and surrounding neighborhoods.` : null,
    }
    row._borough = borough
    row._nh = nh
    row._first = first
    row._last = last
    userRows.push(row)
  }

  // Insert users and get IDs back
  const cleanUsers = userRows.map(({ _borough, _nh, _first, _last, ...u }) => u)
  const insertedUsers = await supaInsert('users', cleanUsers, true)
  console.log(`\n  Created ${insertedUsers.length} users`)

  // Map IDs back
  const users = userRows.map((u, i) => ({
    id: insertedUsers[i]?.id,
    borough: u._borough,
    nh: u._nh,
    first: u._first,
    last: u._last,
    lat: u.lat,
    lng: u.lng,
  })).filter(u => u.id)
  console.log(`  ${users.length} users mapped with IDs\n`)

  // Also fetch existing seed users
  console.log('  Fetching existing seed users...')
  const existingRes = await fetch(`${SUPABASE_URL}/rest/v1/users?email=like.*%40example.com&verified=eq.true&select=id,name,email&limit=2000`, { headers: HEADERS_REP })
  const existingUsers = await existingRes.json()
  const allSeedUsers = [
    ...users,
    ...existingUsers.filter(u => !users.find(nu => nu.id === u.id)).map(u => {
      const b = pick(BOROUGH_WEIGHTS)
      return { id: u.id, borough: b, nh: pick(BOROUGHS[b].nhs), first: (u.name||'User').split(' ')[0], last: (u.name||'User').split(' ').pop(), lat: BOROUGHS[b].lat, lng: BOROUGHS[b].lng }
    })
  ]
  console.log(`  Total seed users available: ${allSeedUsers.length}\n`)

  // ── 2. CREATE 100,000 LISTINGS ──
  console.log('2. Generating 100,000 listings over 90 days...')
  const BACKFILL_DAYS = 90
  const today = new Date()
  const nhCoverage = createCoverage()
  const catKeys = Object.keys(LISTINGS)
  const catWeightEntries = Object.entries(CATEGORY_WEIGHTS)
  const catWeightTotal = catWeightEntries.reduce((s,[,w])=>s+w, 0)

  // Growth curve: ~200/day → ~2000/day over 90 days ≈ 100k total
  function listingsPerDay(dayNum) {
    return Math.round(200 + (dayNum / BACKFILL_DAYS) * 1800 + rb(-20, 20))
  }

  let totalListings = 0
  for (let dayOffset = BACKFILL_DAYS; dayOffset >= 1; dayOffset--) {
    const date = new Date(today)
    date.setDate(date.getDate() - dayOffset)
    const dayNum = BACKFILL_DAYS - dayOffset + 1
    const count = listingsPerDay(dayNum)
    const batch = []

    for (let i = 0; i < count; i++) {
      // Use coverage tracker for ~40% of listings to ensure spread
      let borough, nh
      if (i % 5 < 2) {
        const target = nhCoverage.next()
        borough = target.borough; nh = target.nh
      } else {
        borough = pick(BOROUGH_WEIGHTS); nh = pick(BOROUGHS[borough].nhs)
      }

      const user = pick(allSeedUsers)
      const catSlug = pickCategory()
      const catTemplates = LISTINGS[catSlug]
      if (!catTemplates) continue
      const subGroup = pick(catTemplates)
      const item = pick(subGroup.items)
      const [minP, maxP] = item.p
      const price = minP === 0 && maxP === 0 ? null : rb(minP, maxP)
      const vars = makeVars(borough, nh, user.first, user.last)
      const b = BOROUGHS[borough]
      const lat = b.lat + (Math.random() - 0.5) * 0.02
      const lng = b.lng + (Math.random() - 0.5) * 0.02
      const ts = tsForDate(date)
      const tsDate = new Date(ts)

      batch.push({
        user_id: user.id,
        title: fill(item.t, vars).slice(0, 200),
        description: varyText(fill(item.d, vars)).slice(0, 2000),
        price,
        category_slug: catSlug,
        subcategory_slug: subGroup.sub,
        images: [],
        location: `${nhName(nh)}, ${nhName(borough)}`,
        lat, lng,
        status: dayOffset > 30 ? pick(['active','active','active','sold','expired']) : 'active',
        expires_at: new Date(tsDate.getTime() + 30 * 86400000).toISOString(),
        created_at: ts,
      })
    }

    const ins = await supaInsert('listings', batch)
    totalListings += ins
    if (dayNum % 10 === 0) console.log(`\n  Day ${dayNum}: ${count} generated, ${totalListings} total inserted`)
  }
  console.log(`\n  Total listings inserted: ${totalListings}\n`)

  // ── 3. CREATE 25,000 PORCH POSTS ──
  console.log('3. Generating 25,000 porch posts over 90 days...')
  function porchPerDay(dayNum) {
    return Math.round(50 + (dayNum / BACKFILL_DAYS) * 450 + rb(-10, 10))
  }

  const allPorchIds = []
  let totalPorch = 0
  for (let dayOffset = BACKFILL_DAYS; dayOffset >= 1; dayOffset--) {
    const date = new Date(today)
    date.setDate(date.getDate() - dayOffset)
    const dayNum = BACKFILL_DAYS - dayOffset + 1
    const count = porchPerDay(dayNum)
    const batch = []

    for (let i = 0; i < count; i++) {
      let borough, nh
      if (i % 4 === 0) {
        const target = nhCoverage.next()
        borough = target.borough; nh = target.nh
      } else {
        borough = pick(BOROUGH_WEIGHTS); nh = pick(BOROUGHS[borough].nhs)
      }
      const user = pick(allSeedUsers)
      const postType = pick(PORCH_TYPES)
      const templates = PORCH[postType]
      if (!templates || templates.length === 0) continue
      const tmpl = pick(templates)
      const vars = makeVars(borough, nh, user.first, user.last)
      const ts = tsForDate(date)
      const pinned = (postType === 'lost-and-found' || postType === 'pet-sighting') && Math.random() < 0.10
      const expH = postType === 'alert' ? 48 : (postType === 'lost-and-found' || postType === 'pet-sighting') ? 72 : 720

      batch.push({
        user_id: user.id,
        post_type: postType,
        title: fill(tmpl.t, vars).slice(0, 100),
        body: varyText(fill(tmpl.b, vars)).slice(0, 500),
        borough_slug: borough,
        neighborhood_slug: nh,
        pinned,
        expires_at: new Date(new Date(ts).getTime() + expH * 3600000).toISOString(),
        created_at: ts,
      })
    }

    // Insert with return=representation to get IDs for replies
    const inserted = await supaInsert('porch_posts', batch, dayOffset <= 30) // only get IDs for last 30 days
    if (Array.isArray(inserted)) {
      allPorchIds.push(...inserted.map(p => ({ id: p.id, user_id: p.user_id, created_at: p.created_at, post_type: p.post_type })))
      totalPorch += inserted.length
    } else {
      totalPorch += inserted
    }
    if (dayNum % 10 === 0) console.log(`\n  Day ${dayNum}: ${count} generated, ${totalPorch} total porch posts`)
  }
  console.log(`\n  Total porch posts: ${totalPorch}`)
  console.log(`  Posts with IDs (for replies): ${allPorchIds.length}\n`)

  // ── 4. CREATE 15,000+ PORCH REPLIES ──
  console.log('4. Generating 15,000+ porch replies...')
  const replyRows = []

  if (allPorchIds.length > 0) {
    // ~50% of posts get 1-5 replies
    for (const post of allPorchIds) {
      if (Math.random() > 0.50) continue
      const replyCount = rb(1, 5)
      for (let r = 0; r < replyCount; r++) {
        const replyUser = pick(allSeedUsers.filter(u => u.id !== post.user_id))
        if (!replyUser) continue
        let body = pickReply()
        body = body.replace('{street}', pick(STREETS)).replace('{city}', pick(CITIES)).replace('{first}', replyUser.first)
        const postDate = new Date(post.created_at)
        const replyDate = new Date(postDate.getTime() + rb(600000, 86400000 * 2)) // 10 min to 2 days later
        replyRows.push({
          post_id: post.id,
          user_id: replyUser.id,
          body,
          helpful_count: Math.random() < 0.3 ? rb(1, 10) : 0,
          created_at: replyDate.toISOString(),
        })
      }
      if (replyRows.length >= 16000) break
    }
  }

  console.log(`  Generated ${replyRows.length} replies`)
  console.log('  Inserting...')
  const totalReplies = await supaInsert('porch_replies', replyRows)
  console.log(`\n  Total replies inserted: ${totalReplies}\n`)

  // ── SUMMARY ──
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log('═══════════════════════════════════════')
  console.log('  MEGA SEED COMPLETE')
  console.log(`  Users:        ${insertedUsers.length}`)
  console.log(`  Listings:     ${totalListings}`)
  console.log(`  Porch Posts:  ${totalPorch}`)
  console.log(`  Replies:      ${totalReplies}`)
  console.log(`  Time:         ${elapsed}s`)
  console.log('═══════════════════════════════════════')
}

main().catch(err => { console.error(err); process.exit(1) })
