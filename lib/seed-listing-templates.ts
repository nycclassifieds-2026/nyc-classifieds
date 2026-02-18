/**
 * Listing seed templates — realistic NYC classified listings for all categories.
 * Personals weighted HEAVY (60+ templates).
 * Used by seed-listings-engine.ts and scripts/seed-backfill.mjs.
 */

import { pick, rb, nhName, fill, BOROUGHS, BOROUGH_WEIGHTS } from './seed-templates'

// ─── Types ───

export interface ListingTemplate {
  title: string
  description: string
  priceRange: [number, number]  // cents — [min, max], 0 = free/negotiable
  images?: string[]
}

export interface SubcategoryTemplates {
  sub: string
  templates: ListingTemplate[]
}

// ─── Category weights for daily distribution ───
// Personals + Housing + Jobs get the heaviest rotation

export const CATEGORY_WEIGHTS: Record<string, number> = {
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
  community: 2,
}

/** Pick a category slug weighted by CATEGORY_WEIGHTS */
export function pickCategory(): string {
  const entries = Object.entries(CATEGORY_WEIGHTS)
  const total = entries.reduce((s, [, w]) => s + w, 0)
  let r = Math.random() * total
  for (const [cat, w] of entries) {
    r -= w
    if (r <= 0) return cat
  }
  return 'personals'
}

// ─── PERSONALS — 65 templates ───

const PERSONALS: SubcategoryTemplates[] = [
  {
    sub: 'activity-partners',
    templates: [
      { title: 'Running partner — Central Park mornings', description: 'Training for the NYC half. Looking for someone who runs 8-9 min pace, ideally 3-4 days a week before work. I usually start at Columbus Circle around 6:30am. All levels welcome but please be consistent.', priceRange: [0, 0] },
      { title: 'Tennis partner wanted — {nh}', description: 'Intermediate player, been hitting at the public courts on weekends. Looking for someone around my level for regular sets. I have extra rackets if you need one. Weekday evenings work too.', priceRange: [0, 0] },
      { title: 'Hiking buddy — weekend day trips', description: 'I have a car and want to explore trails upstate. Bear Mountain, Breakneck Ridge, Harriman. Looking for someone who is down for 6-10 mile hikes. I usually pack lunch and leave early Saturday.', priceRange: [0, 0] },
      { title: 'Board game night — looking for regulars', description: 'I host game night every other Thursday in {nh}. We play Catan, Wingspan, Ticket to Ride, Azul. Usually 4-6 people. Chill vibes, BYOB. DM me if you want in.', priceRange: [0, 0] },
      { title: 'Photography walk — explore {nh} together', description: 'Street photography is better with company. Want to spend a Saturday afternoon walking around {nh} shooting? I use a Fuji X-T4, you can use your phone, I dont care. Just want good conversation.', priceRange: [0, 0] },
      { title: 'Climbing partner — Brooklyn Boulders', description: 'Looking for a regular belay partner. I go 3x/week, usually evenings. I lead 5.10s but happy to climb with any level. Having a consistent partner makes such a difference.', priceRange: [0, 0] },
      { title: 'Pickup basketball — {nh} courts', description: 'We run 5v5 on Saturday mornings at the courts on {street}. Need more regulars. Competitive but friendly. We usually play 9am-noon. Just show up or DM me first.', priceRange: [0, 0] },
      { title: 'Cycling buddy — bridge loops', description: 'I ride the Manhattan/Brooklyn/Williamsburg bridge loop 2-3 times a week after work. Looking for someone to ride with. Avg 15-17mph. Road bike preferred but whatever you got works.', priceRange: [0, 0] },
      { title: 'Museum buddy — {nh} area', description: 'I have a Culture Pass and want to hit every museum in the city. Looking for someone who actually wants to spend time looking at the art, not just take selfies. Coffee after.', priceRange: [0, 0] },
      { title: 'Yoga partner — morning classes', description: 'Going to the 7am vinyasa at the studio on {street} and would love company for accountability. I go M/W/F. Been practicing 2 years, still cant do a handstand lol.', priceRange: [0, 0] },
      { title: 'Soccer — looking for players, {nh}', description: 'Pickup soccer Sundays at the field near {street}. Co-ed, all skill levels. We have about 12 regulars but always need subs. Starts at 10am. Bring cleats and water.', priceRange: [0, 0] },
      { title: 'Book club — fiction, {nh}', description: 'Starting a monthly book club. Contemporary fiction, nothing too heavy. Meet at a cafe, discuss over coffee. Looking for 5-8 people who actually read the book lol.', priceRange: [0, 0] },
      { title: 'Cooking partner — swap recipes + cook together', description: 'I love cooking but hate eating alone. Looking for someone in {nh} who wants to cook together once a week. We alternate hosting. I am Dominican, love making pernil and mofongo.', priceRange: [0, 0] },
      { title: 'Volleyball — looking for team members', description: 'We have a co-ed recreational volleyball team that plays in a league on Wednesday nights. Need 2-3 more players. You dont have to be amazing, just show up and try.', priceRange: [0, 0] },
      { title: 'Karaoke crew — Thursday nights', description: 'We hit up karaoke in K-Town every other Thursday. Group of 6-8, very judgment-free zone. We sing everything from Whitney to Bad Bunny. All voices welcome, especially bad ones.', priceRange: [0, 0] },
      { title: 'Dance partner — salsa classes', description: 'Taking salsa classes at the studio near {street} and need a consistent partner. Beginner-friendly, classes are on Tuesdays at 8pm. I have two left feet but I am committed to learning.', priceRange: [0, 0] },
      { title: 'Walking buddy — early morning {nh}', description: 'I walk 3-4 miles every morning around 6am before work. Would love company. We can talk or just enjoy the quiet. I live near {street}. Rain or shine.', priceRange: [0, 0] },
      { title: 'Poker night — {nh}, low stakes', description: '$20 buy-in, friendly game. We play Texas Hold Em every other Saturday. Usually 6-8 people, some snacks, some beers. Looking for 2 more regulars.', priceRange: [0, 0] },
      { title: 'Language exchange — Spanish/English', description: 'Native English speaker learning Spanish. Looking for someone to practice with over coffee once a week in {nh}. We can do 30 min English, 30 min Spanish.', priceRange: [0, 0] },
      { title: 'Skating buddy — {nh} area', description: 'I rollerblade in the park most weekends. Looking for someone to skate with. I am intermediate, can stop without dying but that is about it. Also down for ice skating in winter.', priceRange: [0, 0] },
      { title: 'Gym partner — {nh}', description: 'Looking for someone to lift with 3-4x/week. I go to the gym on {street} around 6pm. Currently doing PPL. Having a spotter changes everything. Any experience level.', priceRange: [0, 0] },
      { title: 'Trivia night crew — {nh}', description: 'The bar on {street} does trivia on Wednesdays. I am decent at history and geography but need someone who knows pop culture and sports. Team of 4 ideal.', priceRange: [0, 0] },
      { title: 'Birdwatching — Prospect Park/Central Park', description: 'Getting into birding and would love a buddy. I got binoculars and the Merlin app. Early Saturday mornings are best. I have already spotted a red-tailed hawk, trying for an owl next.', priceRange: [0, 0] },
      { title: 'Fishing buddy — shore fishing NYC', description: 'I fish off the piers and at the shore. Sheepshead Bay, Coney Island, sometimes the Hudson. Mostly catch and release. Just want someone to hang with while we wait for the fish to bite.', priceRange: [0, 0] },
      { title: 'Thrifting partner — weekends', description: 'I hit up thrift stores and estate sales every weekend. Looking for someone who likes the hunt. {nh} has some hidden gems. Vintage clothing, furniture, records — I am into it all.', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'missed-connections',
    templates: [
      { title: 'Blue jacket, L train — Lorimer', description: 'You were reading Murakami on the L heading toward Manhattan. We made eye contact a few times. You smiled when you got off at 1st Ave. I was in the gray hoodie. Would love to grab coffee.', priceRange: [0, 0] },
      { title: 'Coffee shop — Saturday morning, {nh}', description: 'You ordered an oat milk latte, I had an Americano. We talked about jazz for 10 minutes and then my friend showed up and you left. I didnt get your name. Come back?', priceRange: [0, 0] },
      { title: 'Dog park — Tompkins Square', description: 'Your corgi is Biscuit. My mutt is Chaos. We talked for 20 minutes while they played. You mentioned you live nearby. I should have asked for your number. Walk together sometime?', priceRange: [0, 0] },
      { title: 'Laundromat on {street} — Wednesday night', description: 'We were both folding laundry and you made a joke about your socks never matching. I laughed way too hard. You have curly hair and a great smile. I was the one in the red sneakers.', priceRange: [0, 0] },
      { title: 'Bookstore — {nh}, Sunday afternoon', description: 'You were in the poetry section, I was pretending to look at fiction but really I was trying to work up the nerve to talk to you. You bought a Neruda collection. So did I, after you left.', priceRange: [0, 0] },
      { title: '{train} train — Tuesday morning rush', description: 'You let me have the last seat and then stood right next to me the whole ride. We both got off at the same stop. You were wearing headphones and I didnt want to interrupt. But I wish I had.', priceRange: [0, 0] },
      { title: 'Farmers market — Union Square', description: 'Saturday. You were buying peaches and we both reached for the same one. You laughed and let me have it. You had tattoo sleeves and were with a friend. I have been thinking about it all week.', priceRange: [0, 0] },
      { title: 'Bar on {street} — Friday night', description: 'You were sitting at the bar alone reading a book. I wanted to ask what you were reading but my friends dragged me to the back. You were wearing a vintage band tee. Long shot but here goes.', priceRange: [0, 0] },
      { title: 'Grocery store — {nh}', description: 'You helped me reach something on the top shelf and made a joke about it. We talked in the checkout line for like 5 minutes. You mentioned you just moved to the neighborhood. Welcome, and DM me.', priceRange: [0, 0] },
      { title: 'Running — along the river, {nh}', description: 'We have been running the same route for weeks. You always wave. I always wave back. I think we should actually talk. I am the one in the orange shoes. Tomorrow same time?', priceRange: [0, 0] },
      { title: 'Concert at Brooklyn Steel — last Thursday', description: 'You were standing next to me during the opener and we talked between sets about how underrated the band is. I lost you when the crowd moved. You were wearing a denim jacket.', priceRange: [0, 0] },
      { title: 'Delayed {train} train — stuck underground', description: 'We were both stuck on the {train} for 45 minutes and you shared your gummy bears with me. Best subway delay of my life. You got off at your stop before I could ask your name.', priceRange: [0, 0] },
      { title: 'Gallery opening — {nh}, Saturday', description: 'We talked about the abstract piece in the corner for way too long. You work in design, I work in education. The wine was bad but the conversation was great. Wish I had stayed longer.', priceRange: [0, 0] },
      { title: 'Pizza line — {place}, {nh}', description: 'Long line, you were behind me. We debated best pizza in NYC for 15 minutes. You said Lucalis, I said Di Fara. You were right. I owe you a slice.', priceRange: [0, 0] },
      { title: 'Bodega cat — we both stopped to pet it', description: 'Corner of {street}. The bodega cat came out and we both crouched down. You said "this is the real NYC experience." You have freckles and an incredible laugh. Come pet the cat again.', priceRange: [0, 0] },
      { title: 'Gym on {street} — morning crew', description: 'We always end up on adjacent treadmills around 6am. I am too awkward to talk to someone with headphones in but you seem really cool. I am the one who always forgets a water bottle.', priceRange: [0, 0] },
      { title: 'Rooftop bar — {nh}, last weekend', description: 'Sunset. You asked me to take a photo of you and your friend with the skyline. I said something dumb and you laughed anyway. You were wearing all black and gold hoops.', priceRange: [0, 0] },
      { title: 'Ferry — headed to Governors Island', description: 'Saturday afternoon ferry. You were sketching in a notebook and I peeked and it was incredible. You caught me looking and smiled. We got off at the same stop and went different ways.', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'strictly-platonic',
    templates: [
      { title: 'New to {nh} — looking for friends', description: 'Just moved here from {city} for work. I dont know anyone in the area. 28M, into cooking, hiking, live music, and terrible horror movies. Would love to grab a beer and meet some people.', priceRange: [0, 0] },
      { title: 'Looking for mom friends — {nh}', description: 'Stay at home mom with a 2 year old. The playground gets lonely. Would love to connect with other parents in {nh} for playdates or just adult conversation. Coffee while the kids play?', priceRange: [0, 0] },
      { title: 'Friend group for 30-somethings — {nh}', description: 'All my friends moved to the suburbs and I refuse. Looking for other 30-somethings in {nh} who want to do dinner, brunch, movies, whatever. Not dating, just genuine friendship.', priceRange: [0, 0] },
      { title: 'Creative friends wanted — {nh}', description: 'Writer looking for other creatives to hang with. Musicians, painters, filmmakers, whatever. I miss having people to bounce ideas off of. Maybe we start a collective. Maybe we just get tacos.', priceRange: [0, 0] },
      { title: 'Dog park regulars — lets be friends', description: 'I am at the {nh} dog park every evening with my pit mix. I see the same faces every day but nobody talks. Let us change that. My dog is friendly and so am I, mostly.', priceRange: [0, 0] },
      { title: 'Introvert seeking introvert — {nh}', description: 'Looking for a friend who understands that sometimes the best hangout is sitting in the same room reading different books. Low-key, no pressure friendship. I live near {street}.', priceRange: [0, 0] },
      { title: 'Recently divorced — rebuilding my social life', description: '42F, recently divorced, realizing most of my friends were couples friends. Starting over socially and not gonna lie its weird. Looking for genuine people in {nh}. I like wine, walks, and being honest.', priceRange: [0, 0] },
      { title: 'Transplant from {city} — need a crew', description: 'Moved to NYC 3 months ago. Love it here but eating at restaurants alone is getting old. 25F, into yoga, thrifting, and going to shows. Please be my friend I am begging.', priceRange: [0, 0] },
      { title: 'Weekend brunch crew — {nh}', description: 'I want a standing brunch date. Every Saturday or Sunday, we pick a spot in {nh}, eat too much, and complain about our weeks. No flaking. DM me if you are reliable and hungry.', priceRange: [0, 0] },
      { title: 'Nerdy friends wanted — {nh}', description: 'Into D&D, anime, comic books, and building PCs. Looking for people who wont judge me for any of that. I host game sessions sometimes. Snacks provided. Just bring your character sheet.', priceRange: [0, 0] },
      { title: 'Senior looking for company — {nh}', description: '68F, widowed, kids live out of state. Looking for someone to walk with, have tea, talk about life. I have lived in {nh} for 40 years and know every story about every block.', priceRange: [0, 0] },
      { title: 'Sober friends — {nh} area', description: 'Looking for friends who are also sober or sober-curious. I quit drinking a year ago and my social life took a hit. Would love to find people who are down for non-bar activities.', priceRange: [0, 0] },
      { title: 'Gym buddy needed — not a trainer, just a friend', description: 'Going to the gym alone is boring. Looking for someone in {nh} who wants to work out together and maybe grab a smoothie after. I go mornings. Any fitness level.', priceRange: [0, 0] },
      { title: 'International friend group — {nh}', description: 'I am from {city} originally and miss having friends from different backgrounds. Want to start a diverse friend group in {nh}. Monthly dinners, everyone brings a dish from home.', priceRange: [0, 0] },
      { title: 'Concert buddy — {nh}', description: 'None of my friends like the same music as me. Into indie, jazz, R&B, some hip hop. Looking for someone to go to shows with. Brooklyn Steel, Bowery Ballroom, Blue Note. DM your favorite artist.', priceRange: [0, 0] },
      { title: 'New dad — looking for other dads, {nh}', description: '34M, first kid is 6 months old. All my friends without kids are tired of hearing about sleep schedules. Looking for other new dads in {nh} to commiserate with. Beer optional but recommended.', priceRange: [0, 0] },
      { title: 'Work from home buddy — {nh}', description: 'Remote worker going insane at home. Looking for someone to co-work with at cafes in {nh} a few times a week. We dont even have to talk. Just the presence of another human helps.', priceRange: [0, 0] },
      { title: 'Night owl friends — {nh}', description: 'I work late and most of my socializing happens after 10pm. Looking for other night owls in {nh} who want to grab late-night food, walk around, or just hang. Diners at 1am are my thing.', priceRange: [0, 0] },
      { title: 'Queer friends wanted — {nh}', description: 'Looking for queer friends in {nh} to hang out with outside of bar/club settings. Movie nights, potlucks, park hangs. Building community one friendship at a time.', priceRange: [0, 0] },
      { title: 'Empty nester — kids left, friends needed', description: '55M, both kids in college. House is too quiet and my wife says I need friends who arent on TV. I like baseball, BBQ, dad jokes, and I am told I give great advice. {nh} preferred.', priceRange: [0, 0] },
      { title: 'Study buddy — {nh} cafes', description: 'Grad student looking for someone to study with. Doesnt matter what you are studying. Just need the accountability of another person. I buy the first round of coffee.', priceRange: [0, 0] },
      { title: 'Movie buddy — arthouse films', description: 'I go to Film Forum and Metrograph alone every weekend and I am tired of having no one to discuss the movie with after. Looking for someone who likes foreign films, docs, and classic cinema.', priceRange: [0, 0] },
    ],
  },
]

// ─── HOUSING — 35 templates ───

const HOUSING: SubcategoryTemplates[] = [
  {
    sub: 'apartments',
    templates: [
      { title: 'Sunny 1BR — {nh}, $2,100/mo', description: 'South-facing, tons of natural light. Heat and hot water included. Walk-up but worth the climb. Close to {train} train. Available March 1.', priceRange: [180000, 280000] },
      { title: 'Spacious 2BR, renovated — {nh}', description: 'New kitchen, stainless appliances, dishwasher. Hardwood throughout. Laundry in building. Near {street}. No broker fee.', priceRange: [250000, 380000] },
      { title: 'Studio, exposed brick — {nh}', description: 'Charming walkup studio with original exposed brick. Top floor, quiet. Great closet space for a studio. Near {train}. Cat-friendly.', priceRange: [150000, 200000] },
      { title: 'Large 3BR — laundry in unit, {nh}', description: 'Rare W/D in unit. Full-size kitchen. Near subway and parks. Family-friendly building. Super lives on-site. Pets welcome.', priceRange: [320000, 450000] },
      { title: 'Modern 2BR — rooftop access, {nh}', description: 'Doorman building, gym, rooftop with skyline views. Central AC, in-unit W/D. Walk to {train}. Pet-friendly. Gross rent, no extras.', priceRange: [350000, 480000] },
      { title: 'Rent-stabilized 1BR — {nh}', description: 'Below market rent. Heat included. Quiet building, good super. Near {street}. Long-term lease available. Dont sleep on this.', priceRange: [140000, 180000] },
      { title: 'Bright studio — high ceilings, {nh}', description: '10-foot ceilings, south-facing windows. 400sqft but feels bigger. Galley kitchen. Near {train} and great restaurants. Available now.', priceRange: [145000, 185000] },
      { title: 'Alcove studio — doorman, {nh}', description: 'Separate sleeping alcove makes this feel like a 1BR. Elevator, laundry, live-in super. Quiet street. Near {train}. No fee.', priceRange: [165000, 210000] },
      { title: '4BR — rare find, {nh}', description: 'Huge 4BR in brownstone. Original details, modern kitchen. Backyard access. Near {street}. Great for families or roommates. Wont last.', priceRange: [400000, 550000] },
      { title: 'Jr 1BR — great starter, {nh}', description: 'Junior 1BR with separate kitchen. Bright, clean, quiet. Laundry in basement. 5 min walk to {train}. Super responsive landlord.', priceRange: [155000, 195000] },
    ],
  },
  {
    sub: 'rooms-shared',
    templates: [
      { title: 'Room in 3BR — {nh}, $1,200/mo', description: 'Private room in shared 3BR apt. 2 chill roommates, both work 9-5. Shared kitchen and bath. Near {train}. Available immediately. Utilities split 3 ways.', priceRange: [95000, 140000] },
      { title: 'Private room — {nh}, all utils included', description: 'Furnished room in quiet apartment. WiFi, electric, heat all included. Shared bath, full kitchen. No smoking. Month-to-month available.', priceRange: [110000, 160000] },
      { title: 'Master BR in 2BR — {nh}', description: 'Biggest room in the apartment, fits a queen easily. One roommate, 28F professional. Clean and respectful. Near {street}. $1,400/mo.', priceRange: [120000, 160000] },
      { title: 'Room available — LGBTQ+ friendly, {nh}', description: 'Welcoming household looking for a 3rd roommate. Private room, shared everything else. Near {train}. We have a cat. $1,100/mo + utils.', priceRange: [100000, 130000] },
      { title: 'Furnished room — short term OK, {nh}', description: 'Fully furnished room with bed, desk, dresser. 3-month minimum. Working professionals only. Clean, quiet building. Near {street}. $1,300/mo.', priceRange: [110000, 150000] },
    ],
  },
  {
    sub: 'sublets',
    templates: [
      { title: 'Summer sublet 1BR — {nh}', description: 'June through August. Fully furnished, AC in every room. Great location near {train}. Building has gym and laundry. My lease, your summer.', priceRange: [180000, 260000] },
      { title: '3-month sublet — {nh} studio', description: 'Leaving for work assignment March-May. Cute studio near {street}. Everything included. Bring your clothes and toothbrush. $1,600/mo.', priceRange: [150000, 200000] },
      { title: 'Furnished 1BR sublet — {nh}', description: 'Available April 1 through September. New building, elevator, doorman. All my furniture stays. Utilities in my name. Near {train}.', priceRange: [200000, 300000] },
      { title: '6-week sublet — {nh}, $1,800/mo', description: 'Going abroad for 6 weeks starting March 15. 1BR with office nook. Fast wifi. Perfect for remote workers. Near {street}.', priceRange: [170000, 220000] },
    ],
  },
  {
    sub: 'parking-storage',
    templates: [
      { title: 'Indoor parking spot — {nh}', description: 'Covered, secure garage. 24/7 access. Camera monitored. Fits standard sedan or small SUV. Monthly rental. Near {street}.', priceRange: [25000, 45000] },
      { title: 'Storage unit — {nh}, climate controlled', description: '5x10 unit. Clean, dry, secure. Good for furniture, boxes, seasonal items. Month to month. Access 7am-10pm daily.', priceRange: [15000, 25000] },
    ],
  },
]

// ─── JOBS — 30 templates ───

const JOBS: SubcategoryTemplates[] = [
  {
    sub: 'restaurant-hospitality',
    templates: [
      { title: 'Line Cook — busy restaurant, {nh}', description: '$18-22/hr + meal. Fast-paced kitchen. Experience on the line required. We do brunch and dinner. Need someone who can handle the rush. Start immediately.', priceRange: [0, 0] },
      { title: 'Server/Bartender — {nh} wine bar', description: '$15/hr + tips ($200-400/night). Knowledge of wine is a plus. Must have serving experience. We are a small team that works hard and has fun. Weekend availability required.', priceRange: [0, 0] },
      { title: 'Barista — coffee shop, {nh}', description: '$17/hr + tips. Latte art is a plus. We train on our beans. Morning shifts available. Looking for someone passionate about coffee who can chat with regulars.', priceRange: [0, 0] },
      { title: 'Restaurant Manager — {nh}', description: '$55-65K + bonus. Need 3+ years managing a restaurant. Handle staffing, ordering, customer issues. We are a neighborhood staple and need someone who cares.', priceRange: [0, 0] },
      { title: 'Prep Cook — {nh}, full time', description: '$16-18/hr. Early morning shifts 6am-2pm. Chopping, portioning, prepping for dinner service. Reliable and fast. No drama.', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'tech-engineering',
    templates: [
      { title: 'Junior Frontend Dev — hybrid, {nh}', description: '$70-90K. React/Next.js. 1-2 years experience. In-office 3 days/week near {street}. Small team, real impact. Health insurance + 401k.', priceRange: [0, 0] },
      { title: 'Senior Backend Engineer — remote/NYC', description: '$150-180K. Python, PostgreSQL, AWS. 5+ years experience. We are scaling fast and need someone who has done it before. Equity available.', priceRange: [0, 0] },
      { title: 'Data Analyst — healthcare startup', description: '$85-110K. SQL, Python, Tableau. Help us make sense of patient data. NYC office with hybrid flexibility. Health + dental + vision.', priceRange: [0, 0] },
      { title: 'Full Stack Engineer — fintech, {nh}', description: '$120-160K. TypeScript, Node, React. Help build the next generation of financial tools. Series B startup. In-office near {train}.', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'trades-skilled-labor',
    templates: [
      { title: 'Electrician Apprentice — union', description: '$25-35/hr + benefits. Will train the right person. Must be dependable and not afraid of hard work. NYC jobs, steady pay. Apply now.', priceRange: [0, 0] },
      { title: 'Licensed Plumber — experienced', description: '$40-60/hr. 5+ years NYC experience. Residential and light commercial. Must have own tools and van. Steady work, good clients.', priceRange: [0, 0] },
      { title: 'HVAC Tech — commercial, {nh}', description: '$30-45/hr. EPA certified. Installing and maintaining systems in commercial buildings. Benefits after 90 days. Company vehicle provided.', priceRange: [0, 0] },
      { title: 'Carpenter — custom woodwork', description: '$28-40/hr. Building custom closets, shelving, trim work. Must have portfolio or references. Quality matters more than speed. {nh} area.', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'healthcare',
    templates: [
      { title: 'Home Health Aide — {nh}', description: '$17-20/hr. PCA or HHA certification required. Compassionate, reliable, patient. Helping seniors stay independent. Flexible scheduling.', priceRange: [0, 0] },
      { title: 'Medical Assistant — {nh} clinic', description: '$18-22/hr. Bilingual preferred. Vital signs, patient intake, EHR data entry. Friendly clinic, good team. Benefits included.', priceRange: [0, 0] },
      { title: 'Dental Hygienist — {nh}', description: '$45-55/hr. Licensed RDH. Private practice, great patients. Modern equipment. 4 days/week. No weekends. Immediate start.', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'retail',
    templates: [
      { title: 'Retail Associate — boutique, {nh}', description: '$16-18/hr. Fashion-forward individuals wanted. Part-time and full-time available. Employee discount. Fun team environment.', priceRange: [0, 0] },
      { title: 'Store Manager — {nh}', description: '$50-60K. 2+ years retail management. Handle inventory, scheduling, and creating a great customer experience. Growing brand.', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'creative-media',
    templates: [
      { title: 'Graphic Designer — agency, {nh}', description: '$55-75K. Adobe Suite, Figma. 2+ years experience. Brand identity, social media, print. Fast-paced agency with cool clients. Hybrid.', priceRange: [0, 0] },
      { title: 'Social Media Manager — startup', description: '$50-65K. Manage Instagram, TikTok, LinkedIn. Content creation + strategy. Must understand analytics. Remote-first with NYC meetups.', priceRange: [0, 0] },
      { title: 'Video Editor — production company, {nh}', description: '$60-80K. Premiere Pro, After Effects. Edit content for brands and docs. Fast turnaround. In-office near {street}. Reel required.', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'education-teaching',
    templates: [
      { title: 'After-school Tutor — {nh}', description: '$25-40/hr. Help K-8 students with homework and test prep. 3-6pm weekdays. Patience and enthusiasm required. Background check.', priceRange: [0, 0] },
      { title: 'ESL Teacher — {nh} community center', description: '$30-40/hr. Teach English to adult immigrants. Evening classes. TESOL certification preferred. Rewarding work, great community.', priceRange: [0, 0] },
    ],
  },
]

// ─── FOR SALE — 35 templates ───

const FOR_SALE: SubcategoryTemplates[] = [
  {
    sub: 'furniture',
    templates: [
      { title: 'Solid wood dining table — seats 6', description: 'Moving out, must sell. Real wood, no veneer. Some minor scratches but solid. You haul. Cash only. Near {street}.', priceRange: [10000, 25000] },
      { title: 'Mid-century modern couch — great condition', description: '2 years old, from Article. No stains, no pet damage. Seats 3. Looks amazing in any living room. You pick up.', priceRange: [30000, 60000] },
      { title: 'IKEA Kallax shelf — white, 4x4', description: 'Assembled, perfect condition. Moving to a smaller place. Great for vinyl, books, or room divider. You disassemble and haul.', priceRange: [4000, 8000] },
      { title: 'Queen bed frame + headboard — {nh}', description: 'Sturdy platform frame, no box spring needed. Headboard included. No squeaks. Mattress not included. Must pick up this weekend.', priceRange: [12000, 25000] },
      { title: 'Standing desk — electric adjustable', description: 'Uplift V2. 48" wide. Dual motors. Goes from 25" to 50". Bamboo top. Selling because I am going back to office. Barely used.', priceRange: [20000, 35000] },
      { title: 'Leather recliner — {nh}', description: 'La-Z-Boy, real leather. Dark brown. Works perfectly. Very comfortable. Moving and it wont fit. Pick up on {street}.', priceRange: [15000, 30000] },
    ],
  },
  {
    sub: 'electronics',
    templates: [
      { title: 'MacBook Pro M2 — 16GB, 512GB', description: 'Battery health 98%. AppleCare until 2027. No scratches, always had a case. Comes with charger and box. Upgrading to M4.', priceRange: [90000, 130000] },
      { title: 'PS5 + 2 controllers', description: 'Disc edition. Works perfectly. Includes 2 controllers and 3 games. Original box. Just dont game anymore. Cash or Venmo.', priceRange: [30000, 45000] },
      { title: 'Samsung 55" 4K TV — wall mounted', description: 'Smart TV, great picture. Used for 1 year. Comes with wall mount or stand. Remote included. Pick up in {nh}.', priceRange: [20000, 35000] },
      { title: 'iPhone 14 Pro — unlocked, 256GB', description: 'No scratches, always had a case and screen protector. Battery health 91%. Unlocked, works on any carrier. Midnight purple.', priceRange: [50000, 75000] },
      { title: 'Sony WH-1000XM5 headphones', description: 'Best noise cancelling headphones. 6 months old. Original case, cable, and box. Selling because I got AirPods Max as a gift.', priceRange: [18000, 28000] },
    ],
  },
  {
    sub: 'bikes',
    templates: [
      { title: 'Trek FX3 hybrid — great commuter', description: 'Carbon fork, disc brakes, 21-speed. Ridden one season. Perfect for commuting or recreational rides. Fits 5\'8"-6\'0".', priceRange: [35000, 55000] },
      { title: 'Brompton folding bike — 6 speed', description: 'Folds in 20 seconds. Perfect for apartment living and the subway. Black edition. Includes bag. Well maintained.', priceRange: [100000, 150000] },
      { title: 'E-bike — 500W, 40mi range', description: 'Pedal assist + throttle. Goes 28mph. Removable battery charges in 4 hours. 3 months old, selling because I got a car.', priceRange: [60000, 100000] },
      { title: 'Fixed gear — matte black', description: 'Clean build. 52cm frame. Flip flop hub. New chain and tires. Great city bike. Low maintenance. Comes with U-lock.', priceRange: [20000, 35000] },
    ],
  },
  {
    sub: 'clothing-accessories',
    templates: [
      { title: 'North Face puffer — size M', description: '700 fill. Warm enough for NYC winters. Black. No rips, no stains. I bought a longer coat so selling this one.', priceRange: [8000, 15000] },
      { title: 'Vintage Levis 501s — 32x32', description: 'Actual vintage, not repro. Perfect fade. Straight leg. One of my favorite pairs but they dont fit anymore.', priceRange: [5000, 10000] },
      { title: 'Nike AF1 — size 10, deadstock', description: 'All white, never worn. Still in box with receipt. Got the wrong size as a gift. Below retail.', priceRange: [8000, 13000] },
      { title: 'Canada Goose parka — size L', description: 'Expedition parka. The warmest coat you will ever own. Worn 2 winters. Some minor wear on cuffs. Cleaned professionally.', priceRange: [35000, 55000] },
    ],
  },
  {
    sub: 'free-stuff',
    templates: [
      { title: 'Free couch — you haul, {nh}', description: 'Gray sectional. Some wear on the cushions but totally functional. We are moving this weekend and cant take it. Pick up Saturday.', priceRange: [0, 0] },
      { title: 'Moving boxes — free, {nh}', description: 'About 30 boxes, various sizes. Some packing paper and bubble wrap too. First come first served. Outside my building on {street}.', priceRange: [0, 0] },
      { title: 'Books — 3 boxes free, {nh}', description: 'Fiction, non-fiction, some cookbooks. Downsizing my collection. Take some or all. On my stoop Saturday morning.', priceRange: [0, 0] },
      { title: 'Plants — rehoming collection, {nh}', description: '8 plants including a 4ft monstera, pothos, snake plant, spider plant. Moving and cant take them. Good homes only please.', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'vinyl-records',
    templates: [
      { title: 'Jazz collection — 40 records', description: 'Coltrane, Monk, Miles Davis, Mingus, Ella. All VG+ or better. Selling as a lot only. 20 years of collecting. Moving overseas.', priceRange: [20000, 40000] },
      { title: 'Hip hop vinyl — 25 albums', description: 'Nas, Biggie, Tribe Called Quest, De La Soul, OutKast. Mix of originals and reissues. All play great. Will sell individually too.', priceRange: [15000, 25000] },
      { title: '90s R&B collection — 15 records', description: 'TLC, Aaliyah, SWV, Brandy, Monica, Erykah Badu. Nostalgic vibes. All in great condition. Meet in {nh}.', priceRange: [8000, 15000] },
    ],
  },
  {
    sub: 'sneakers-streetwear',
    templates: [
      { title: 'Jordan 4 Bred — sz 10, DS', description: 'Deadstock with SNKRS receipt. Never tried on. Ships double boxed or meet in {nh}. Price is firm.', priceRange: [22000, 30000] },
      { title: 'New Balance 990v6 — sz 10.5', description: 'Made in USA. Gray. Worn twice. Too narrow for my wide feet. Basically new. Box included.', priceRange: [14000, 20000] },
      { title: 'Supreme box logo hoodie — M', description: 'FW24. Black on black. Worn once to try on. Receipt in hand. Meet in Manhattan only.', priceRange: [35000, 50000] },
    ],
  },
]

// ─── SERVICES — 25 templates ───

const SERVICES: SubcategoryTemplates[] = [
  {
    sub: 'cleaning',
    templates: [
      { title: 'Deep cleaning — licensed, {nh}', description: 'Licensed and insured. 10 years in NYC. We clean ovens, fridges, baseboards, everything. Move-in/out specials available. Free estimates.', priceRange: [15000, 30000] },
      { title: 'Weekly apartment cleaning — {nh}', description: 'Same cleaner every week. Consistent, reliable, thorough. Supplies included. References available. Serving {nh} and nearby neighborhoods.', priceRange: [10000, 18000] },
      { title: 'Move-out cleaning — get your deposit back', description: 'We specialize in end-of-lease cleanings. Walls, floors, kitchen, bath — spotless. Photos before and after. Book early.', priceRange: [20000, 35000] },
    ],
  },
  {
    sub: 'handyman',
    templates: [
      { title: 'Handyman — no job too small, {nh}', description: 'TV mounting, shelves, curtain rods, minor plumbing, drywall patches. 15 years experience. Licensed. Quick and clean. Call or text.', priceRange: [7500, 15000] },
      { title: 'Furniture assembly — flat rate, {nh}', description: 'IKEA, Wayfair, whatever you got. Flat rate per piece. I bring my own tools. Same-day appointments available. Fast and neat.', priceRange: [5000, 10000] },
      { title: 'General repairs — {nh}', description: 'Faucets, doors, outlets, drywall, painting. Licensed. Free estimates. Honest pricing, no surprises. Serving all 5 boroughs.', priceRange: [7000, 12000] },
    ],
  },
  {
    sub: 'moving-hauling',
    templates: [
      { title: '2 movers + truck — $300 flat rate', description: 'Licensed and insured. No hidden fees. Local NYC moves. Padding, dollies, and straps included. Same-day available. 5-star reviews.', priceRange: [25000, 50000] },
      { title: 'Junk removal — same day, {nh}', description: 'Furniture, appliances, construction debris. We load and haul. Eco-friendly disposal. Free phone estimates. Call now.', priceRange: [10000, 25000] },
    ],
  },
  {
    sub: 'tutoring',
    templates: [
      { title: 'Math tutor — all levels, {nh}', description: 'Columbia grad. Algebra through Calculus. SAT math too. Patient, clear explanations. $60/hr. In-person in {nh} or online. Free intro session.', priceRange: [5000, 10000] },
      { title: 'SAT/ACT prep — 1500+ scorer', description: 'Scored 1560 on the SAT. I know the test inside and out. Personalized study plans. $80/hr. Results guaranteed. Online or in-person.', priceRange: [7000, 12000] },
      { title: 'Piano lessons — all ages, {nh}', description: 'Juilliard-trained. Classical, jazz, pop. Beginners to advanced. In your home or mine. $75/hr. First lesson half-price.', priceRange: [6000, 10000] },
    ],
  },
  {
    sub: 'photography',
    templates: [
      { title: 'NYC portrait photographer — natural light', description: 'Parks, rooftops, streets of NYC. Natural light specialty. 1-hour session, 30+ edited photos. Quick turnaround. Portfolio on request.', priceRange: [15000, 30000] },
      { title: 'Headshots — professional, {nh}', description: 'LinkedIn, acting, dating apps. Studio or outdoor. 30-min session, 10 retouched photos. Same-week delivery. Book online.', priceRange: [12000, 25000] },
      { title: 'Event photography — {nh} area', description: 'Birthdays, corporate events, private parties. 2-4 hour coverage. 48-hour delivery of edited gallery. Serving all boroughs.', priceRange: [30000, 60000] },
    ],
  },
  {
    sub: 'plumbing',
    templates: [
      { title: 'Licensed plumber — {nh}', description: 'NYC licensed. Leaks, clogs, installations, water heaters. Emergency service available. Free estimates. 20 years experience. Fair prices.', priceRange: [10000, 30000] },
    ],
  },
  {
    sub: 'web-app-dev',
    templates: [
      { title: 'Web developer — small business sites', description: 'I build websites for small businesses. Clean, fast, mobile-friendly. Starting at $500. NYC-based, meet in person. Portfolio available.', priceRange: [50000, 150000] },
    ],
  },
  {
    sub: 'personal-training',
    templates: [
      { title: 'Personal trainer — {nh} area', description: 'NASM certified. Weight loss, muscle building, general fitness. Your gym or outdoor. $80/session. Free consultation. Lets get to work.', priceRange: [6000, 12000] },
    ],
  },
  {
    sub: 'pet-grooming',
    templates: [
      { title: 'Mobile dog grooming — {nh}', description: 'I come to you. Full grooming: bath, haircut, nails, ears. All breeds. Gentle handling. $75-120 depending on size. Book a week ahead.', priceRange: [7500, 15000] },
    ],
  },
]

// ─── GIGS — 20 templates ───

const GIGS: SubcategoryTemplates[] = [
  {
    sub: 'moving-help',
    templates: [
      { title: 'Help moving this Saturday — {nh}', description: 'Moving from 2BR to 1BR. Need 2 strong people. Should take about 3 hours. $100 each + pizza. Building has elevator. Near {street}.', priceRange: [8000, 15000] },
      { title: 'Furniture disassembly — 2 hours, {nh}', description: 'Need someone to take apart an IKEA bed and desk so I can move them. Bring your own tools. Quick job, cash on completion.', priceRange: [6000, 10000] },
    ],
  },
  {
    sub: 'dog-walking',
    templates: [
      { title: 'Dog walker needed — weekdays, {nh}', description: '30-min midday walk, Mon-Fri. Friendly goldendoodle. I work from home but have meetings noon-2pm. Reliable people only. Near {street}.', priceRange: [2000, 3000] },
      { title: 'Weekend dog walker — 2 small dogs, {nh}', description: 'Two chihuahua mixes. Leash-trained and friendly. Saturday and Sunday mornings, 30 min each. $20/walk. Must love dogs.', priceRange: [1500, 2500] },
    ],
  },
  {
    sub: 'delivery-runs',
    templates: [
      { title: 'Pick up and deliver — {nh} to {nh}', description: 'Need someone with a car to pick up a dresser from {nh} and bring it to my apartment. Should take an hour. $75 cash.', priceRange: [5000, 10000] },
      { title: 'Grocery run for my mom — {nh}', description: 'My mom lives in {nh} and needs someone to pick up groceries from the store on {street} and bring them to her building. Weekly gig. $30/trip.', priceRange: [2500, 4000] },
    ],
  },
  {
    sub: 'event-setup',
    templates: [
      { title: 'Help set up birthday party — {nh}', description: 'Setting up a party in a rented space on Saturday. Need help carrying supplies, hanging decorations, arranging tables. 2-3 hours. $80 cash.', priceRange: [6000, 10000] },
    ],
  },
  {
    sub: 'cleaning',
    templates: [
      { title: 'Deep clean before guests — {nh}', description: 'In-laws visiting Friday. Need someone Thursday to deep clean my 1BR apartment. Kitchen, bathroom, floors, windows. 3-4 hours. $120 cash.', priceRange: [8000, 15000] },
    ],
  },
  {
    sub: 'tech-help',
    templates: [
      { title: 'Help setting up smart home — {nh}', description: 'I bought a bunch of smart lights and a thermostat and I have no idea what I am doing. Need someone to come set it all up. Should take 2 hours. $60.', priceRange: [4000, 8000] },
      { title: 'Computer help — {nh}', description: 'My laptop is slow and I think I have a virus. Need someone to clean it up, maybe add more RAM. I will pay $50 and provide snacks.', priceRange: [3000, 6000] },
    ],
  },
  {
    sub: 'pet-sitting',
    templates: [
      { title: 'Cat sitter needed — 5 days, {nh}', description: 'Going on vacation. Need someone to stop by once a day to feed and scoop litter. Easy cat, very independent. $25/day. Near {street}.', priceRange: [2000, 3500] },
      { title: 'Dog sitting — my home, 3 days, {nh}', description: 'Need someone to stay at my apartment with my dog while I travel for work. He is chill, loves the couch. $50/night.', priceRange: [4000, 6000] },
    ],
  },
  {
    sub: 'data-entry',
    templates: [
      { title: 'Data entry — remote, flexible hours', description: 'Small business needs help entering inventory into spreadsheet. About 500 items. Can do from home. $15/hr, probably 8-10 hours total. DM for details.', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'photography',
    templates: [
      { title: 'Photographer needed — {nh} event', description: 'Birthday party Saturday evening in {nh}. Need 2 hours of coverage. Casual, not a wedding. Mostly candids and group shots. $150.', priceRange: [10000, 20000] },
    ],
  },
  {
    sub: 'flyer-promo',
    templates: [
      { title: 'Flyer distribution — {nh}', description: 'Need someone to hand out flyers for our new restaurant on {street}. Saturday 11am-3pm. $60 cash. Must be friendly and outgoing.', priceRange: [4000, 8000] },
    ],
  },
]

// ─── TICKETS — 20 templates ───

const TICKETS: SubcategoryTemplates[] = [
  {
    sub: 'concerts',
    templates: [
      { title: '2 tix — MSG, upcoming show', description: 'Section 112, great seats. Cant make it due to work. Selling at face value. Will transfer via Ticketmaster. DM for details.', priceRange: [10000, 25000] },
      { title: 'Brooklyn Steel — sold out show, 2 tix', description: 'GA standing. Have a work conflict. Face value. Instant transfer. DM me.', priceRange: [5000, 12000] },
      { title: 'Radio City — 4 tickets', description: 'Orchestra seats, center. Family emergency, cant go. Selling all 4 together. Below face value. Will transfer immediately.', priceRange: [12000, 25000] },
      { title: 'Bowery Ballroom — sold out, 2 tix', description: 'Best small venue in NYC. Selling at what I paid. GA. This Friday night. DM for artist and details.', priceRange: [4000, 8000] },
    ],
  },
  {
    sub: 'sports',
    templates: [
      { title: 'Knicks tix — MSG, lower level', description: 'Section 105. Real seats, not nosebleeds. Weeknight game. Cant make it. Face value. Transfer via Ticketmaster.', priceRange: [12000, 25000] },
      { title: 'Yankees — 2 tickets, field level', description: 'Section 110, row 8. Weekend game. Great view of the field. Selling because of a schedule conflict. Face value.', priceRange: [15000, 35000] },
      { title: 'Mets — 4 seats, Citi Field', description: 'Section 126. Saturday afternoon game. Perfect for taking the family. Selling all 4 together. Below face value.', priceRange: [8000, 15000] },
      { title: 'Nets — center court, 2 tix', description: 'Section 100. Weeknight game at Barclays. Close enough to hear the sneakers squeak. Face value transfer.', priceRange: [8000, 18000] },
    ],
  },
  {
    sub: 'broadway',
    templates: [
      { title: 'Hamilton — orchestra, 2 seats', description: 'Row M, center. Cannot make the date. These are hard to get at face value. Will transfer immediately. No scalper markup.', priceRange: [20000, 40000] },
      { title: 'Wicked — Saturday matinee, 2 tix', description: 'Mezzanine, center. Great view. Perfect for a weekend outing. Selling at face value. Transfer via the app.', priceRange: [12000, 25000] },
      { title: 'The Lion King — front mezzanine', description: 'Amazing seats. Date fell through. 2 tickets. Will sell below what I paid. Saturday evening show.', priceRange: [15000, 30000] },
      { title: 'Off-Broadway — 4 tickets', description: 'Intimate Village theater. Great reviews. Bought for a group that fell apart. Selling all 4 below face value.', priceRange: [6000, 15000] },
    ],
  },
  {
    sub: 'comedy',
    templates: [
      { title: 'Comedy Cellar — 2 tix, Saturday', description: 'The original room. Saturday late show. You never know who drops in. Selling because plans changed. Face value.', priceRange: [3000, 6000] },
      { title: 'Stand-up show — Brooklyn, 4 tix', description: 'Great lineup at a venue in {nh}. This Friday. Bought for friends who bailed. $20 each, face value.', priceRange: [1500, 3000] },
    ],
  },
]

// ─── PETS — 15 templates ───

const PETS: SubcategoryTemplates[] = [
  {
    sub: 'adoption',
    templates: [
      { title: 'Sweet tabby cat needs a home — {nh}', description: '3 years old, spayed, all shots up to date. Indoor only. Very affectionate, loves laps. Moving and cant take her. Comes with supplies.', priceRange: [0, 0] },
      { title: '2 kittens — sisters, need to stay together', description: '8 weeks old, litter trained, playful. They sleep in a little pile. Would love a home that takes both. Adoption fee covers vet visit.', priceRange: [0, 5000] },
      { title: 'Rescue pit mix — great with kids', description: '2 years old, neutered, fully vaccinated. Gentle giant. Loves belly rubs and fetch. Was a stray, now a sweetheart. Needs a yard or active family.', priceRange: [0, 0] },
      { title: 'Senior cat — calm, loving, {nh}', description: '10 years old. Lap cat. Quiet, never scratches furniture. Previous owner passed away. Deserves a warm home for her golden years.', priceRange: [0, 0] },
      { title: 'Bonded pair of rabbits — {nh}', description: 'Holland lops, 2 years old. Litter trained. Cage, hay, and supplies included. Very sweet. Need a home that will keep them together.', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'pet-sitting',
    templates: [
      { title: 'Cat sitter — 1 week, {nh}', description: 'Need someone to check on my cat daily while I travel. Feed, water, scoop litter, give some love. Easy cat, very low maintenance. $25/visit.', priceRange: [2000, 3500] },
      { title: 'Dog boarding — my home, {nh}', description: 'Experienced dog parent. Your pup stays at my apartment. Fenced park nearby. Walks 3x/day. Treat your dog like family. $45/night.', priceRange: [3500, 5500] },
    ],
  },
  {
    sub: 'dog-walking',
    templates: [
      { title: 'Dog walker available — {nh}', description: 'Reliable, experienced with all breeds. 30 or 60 min walks. Flexible schedule. References available. I send photo updates every walk.', priceRange: [1500, 3000] },
      { title: 'Pack walks — small groups, {nh}', description: 'Max 4 dogs per walk. Social, supervised, fun. Morning and afternoon slots. $18/walk. First walk free to make sure your pup vibes with the group.', priceRange: [1500, 2500] },
    ],
  },
  {
    sub: 'grooming',
    templates: [
      { title: 'Dog grooming — mobile, {nh}', description: 'I come to your building. Full groom: bath, cut, nails, ears, teeth. All sizes. Gentle approach. $75-130 depending on breed/size.', priceRange: [7500, 15000] },
    ],
  },
  {
    sub: 'lost-found-pets',
    templates: [
      { title: 'LOST — orange tabby, {nh}', description: 'Last seen near {street}. Indoor cat who escaped. Responds to "Mango." Very friendly. Please check your yards and fire escapes. Reward offered.', priceRange: [0, 0] },
      { title: 'FOUND — small white dog, {nh}', description: 'Found wandering near {street}. No collar, no chip. Friendly. Currently safe at my apartment. Looking for the owner. Please share.', priceRange: [0, 0] },
      { title: 'LOST — gray pitbull, {nh}', description: 'Got spooked by fireworks and bolted. Wearing a red collar. Very friendly but shy. Last seen on {street}. Please call if you see him.', priceRange: [0, 0] },
    ],
  },
]

// ─── BARTER — 10 templates ───

const BARTER: SubcategoryTemplates[] = [
  {
    sub: 'goods-for-goods',
    templates: [
      { title: 'Trade: KitchenAid mixer for road bike', description: 'Red Artisan stand mixer, barely used. Looking for a decent road bike, 54-56cm frame. Also open to other interesting trades. In {nh}.', priceRange: [0, 0] },
      { title: 'Swap: PS5 for Nintendo Switch + cash', description: 'PS5 disc edition for Switch OLED + $100. Both with controllers and games. Meet in {nh} to inspect.', priceRange: [0, 0] },
      { title: 'Trade: vinyl records for concert tickets', description: '50+ jazz and soul records, all VG+. Will trade for upcoming concert tickets. NYC venues preferred. DM what you have.', priceRange: [0, 0] },
      { title: 'Swap: surfboard for snowboard', description: '6\'2" shortboard in good condition. Looking for an all-mountain snowboard, 155-160cm. Can meet in {nh}.', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'goods-for-skills',
    templates: [
      { title: 'Trade: DSLR camera for headshots', description: 'I have a Canon EOS R with a 50mm lens. Looking for a photographer to shoot my headshots. Equipment for service.', priceRange: [0, 0] },
      { title: 'Free furniture for moving help', description: 'I have a couch, coffee table, and bookshelves. Yours free if you help me move the rest of my stuff. Takes about 3 hours. {nh}.', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'skills-for-skills',
    templates: [
      { title: 'Trade: Spanish lessons for guitar lessons', description: 'Native Spanish speaker. Want to learn guitar. Lets trade an hour each per week. I am in {nh}. All levels welcome.', priceRange: [0, 0] },
      { title: 'Swap: web design for photography', description: 'I build websites. Need product photos for my portfolio. Trade: I build your site, you shoot my headshots/products. Meet in {nh}.', priceRange: [0, 0] },
      { title: 'Trade: cooking lessons for language practice', description: 'I am a trained chef. Will teach you to cook Italian food in exchange for Mandarin conversation practice. Weekly in {nh}.', priceRange: [0, 0] },
      { title: 'Swap: personal training for tattoo work', description: 'Certified personal trainer. Looking for a tattoo artist to trade sessions. I train you, you ink me. {nh} area.', priceRange: [0, 0] },
    ],
  },
]

// ─── RENTALS — 10 templates ───

const RENTALS: SubcategoryTemplates[] = [
  {
    sub: 'tools-equipment',
    templates: [
      { title: 'Power drill rental — $15/day', description: 'DeWalt 20V cordless. Charger and 2 batteries included. Full drill bit set. Pick up in {nh}. $50 deposit, returned when you bring it back.', priceRange: [1500, 2000] },
      { title: 'Pressure washer — weekend rental', description: '2000 PSI. Great for patios, decks, driveways. $50/weekend. I deliver and pick up in {nh}. Easy to use, I show you how.', priceRange: [4000, 6000] },
      { title: 'Table saw — weekend rental', description: '10-inch Dewalt. $75/weekend. You pick up, you return. Must have experience. Located in {nh}.', priceRange: [6000, 8000] },
    ],
  },
  {
    sub: 'cameras-gear',
    templates: [
      { title: 'Sony A7III + 24-70mm — $75/day', description: 'Full frame mirrorless. Comes with 2 batteries, charger, and bag. Proof of ID required. Pick up in {nh}.', priceRange: [7500, 10000] },
      { title: 'GoPro Hero 12 — weekend rental', description: 'Waterproof, 4K. All mounts included. $30/weekend. Great for trips, sports, content. Pick up in {nh}.', priceRange: [2500, 4000] },
    ],
  },
  {
    sub: 'party-supplies',
    templates: [
      { title: 'Folding tables + chairs — event rental', description: '10 tables, 40 chairs. Delivery and pickup included in {nh}. $50/day. Also have tablecloths if needed.', priceRange: [4000, 6000] },
      { title: 'PA system + speakers — weekend', description: 'Perfect for block parties, events, presentations. 2 speakers + mixer + 2 mics. $75/day. Pick up or delivery in {nh}.', priceRange: [6000, 10000] },
    ],
  },
  {
    sub: 'sports-equipment',
    templates: [
      { title: 'Kayak rental — weekend', description: 'Tandem kayak + paddles + life jackets. Fits on car roof rack. $40/day. Pick up in {nh}. ID deposit required.', priceRange: [3000, 5000] },
      { title: 'Camping gear set — full kit', description: 'Tent (sleeps 4), 2 sleeping bags, camp stove, lantern. Everything you need. $35/night. Pick up in {nh}.', priceRange: [2500, 4000] },
    ],
  },
]

// ─── RESUMES — 10 templates ───

const RESUMES: SubcategoryTemplates[] = [
  {
    sub: 'software-engineering',
    templates: [
      { title: 'Full Stack Developer — 5 years experience', description: 'React, Node, TypeScript, PostgreSQL, AWS. Built products from 0 to 100K users. Looking for hybrid or remote roles in NYC. Open to contract or FTE.', priceRange: [0, 0] },
      { title: 'Frontend Engineer — React/Next.js specialist', description: '3 years React and TypeScript. Pixel-perfect UI. Performance optimization. Portfolio and GitHub available. Seeking mid-level role in NYC.', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'creative-media',
    templates: [
      { title: 'Graphic Designer — 7 years, brand + digital', description: 'Adobe Suite, Figma, Sketch. Brand identity, social media, print. Agency and in-house experience. Portfolio available. NYC-based.', priceRange: [0, 0] },
      { title: 'Video Editor — freelance available', description: 'Premiere Pro, DaVinci Resolve, After Effects. Commercial, documentary, social content. 5 years experience. Fast turnaround.', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'healthcare',
    templates: [
      { title: 'Registered Nurse — 8 years experience', description: 'BSN, licensed in NY. ICU and med-surg experience. Seeking hospital or clinic position in NYC. Bilingual English/Spanish.', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'trades-skilled-labor',
    templates: [
      { title: 'Licensed Electrician — 12 years', description: 'NYC master electrician license. Residential and commercial. Panel upgrades, rewiring, inspections. Looking for foreman or project lead role.', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'admin-office',
    templates: [
      { title: 'Executive Assistant — 6 years, finance', description: 'Calendar management, travel, expense reports, event coordination. Advanced Excel and PowerPoint. Discreet and organized. NYC preferred.', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'food-hospitality',
    templates: [
      { title: 'Sous Chef — fine dining experience', description: '8 years in NYC restaurants including Michelin-starred kitchens. Classical French training. Menu development, team leadership. Seeking chef de cuisine role.', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'marketing-advertising',
    templates: [
      { title: 'Marketing Manager — B2B SaaS', description: '5 years B2B marketing. Content strategy, demand gen, analytics. HubSpot, Google Ads, LinkedIn certified. Seeking senior role. NYC or remote.', priceRange: [0, 0] },
    ],
  },
]

// ─── Master export ───

export const LISTING_TEMPLATES: Record<string, SubcategoryTemplates[]> = {
  personals: PERSONALS,
  housing: HOUSING,
  jobs: JOBS,
  'for-sale': FOR_SALE,
  services: SERVICES,
  gigs: GIGS,
  tickets: TICKETS,
  pets: PETS,
  barter: BARTER,
  rentals: RENTALS,
  resumes: RESUMES,
}

/** Pick a random template from a category, filling placeholders */
export function pickListingTemplate(
  categorySlug: string,
  nhSlug: string,
  vars: Record<string, string>,
): { title: string; description: string; price: number; subcategory: string } | null {
  const subs = LISTING_TEMPLATES[categorySlug]
  if (!subs || subs.length === 0) return null

  const subGroup = pick(subs)
  if (subGroup.templates.length === 0) return null

  const tmpl = pick(subGroup.templates)
  const [minP, maxP] = tmpl.priceRange
  const price = minP === 0 && maxP === 0 ? 0 : rb(minP, maxP)

  return {
    title: fill(tmpl.title, vars).slice(0, 200),
    description: fill(tmpl.description, vars).slice(0, 2000),
    price,
    subcategory: subGroup.sub,
  }
}
