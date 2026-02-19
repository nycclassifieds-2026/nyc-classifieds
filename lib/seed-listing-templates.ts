/**
 * Listing seed templates — realistic NYC classified listings for all categories.
 * Personals weighted HEAVY (60+ templates).
 * Used by seed-listings-engine.ts and scripts/seed-backfill.mjs.
 */

import { pick, rb, nhName, fill, varyText, BOROUGHS, BOROUGH_WEIGHTS } from './seed-templates'

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

// ─── PERSONALS — 90+ templates ───

const PERSONALS: SubcategoryTemplates[] = [
  {
    sub: 'activity-partners',
    templates: [
      { title: 'Running partner — Central Park mornings', description: 'Training for the NYC half. 8-9 min pace, 3-4 days a week before work. Columbus Circle 6:30am. Be consistent thats all I ask', priceRange: [0, 0] },
      { title: 'Tennis partner wanted — {nh}', description: 'Intermediate. Been hitting at the public courts on weekends. I have extra rackets if you need one', priceRange: [0, 0] },
      { title: 'Hiking buddy', description: 'I have a car. Bear Mountain, Breakneck Ridge, Harriman. Saturday mornings. I pack lunch. You just gotta show up. 6-10 mile hikes usually', priceRange: [0, 0] },
      { title: 'Board game night in {nh}', description: 'Every other Thursday. Catan, Wingspan, Ticket to Ride, whatever. BYOB. Usually 4-6 of us. DM me', priceRange: [0, 0] },
      { title: 'Photography walk — {nh}', description: 'Saturday afternoon. I shoot on a Fuji, you can use your phone I dont care. Just want someone to walk around with', priceRange: [0, 0] },
      { title: 'need a climbing partner', description: 'Brooklyn Boulders, 3x/week evenings. I lead 5.10s. Need a belay partner. any level is fine just be consistent please I keep getting ghosted lol', priceRange: [0, 0] },
      { title: 'Pickup basketball — {street}', description: 'Saturday mornings 9am. 5v5. Need more regulars. Competitive but nobody fights about calls. Just show up', priceRange: [0, 0] },
      { title: 'Cycling — bridge loops', description: 'Manhattan/Brooklyn/Williamsburg bridge loop after work. 15-17mph average. Road bike preferred. 2-3x a week', priceRange: [0, 0] },
      { title: 'Museum buddy', description: 'I have a Culture Pass and im trying to hit every museum this year. Need someone who actually looks at the art. Coffee after', priceRange: [0, 0] },
      { title: 'morning yoga — {street}', description: '7am vinyasa M/W/F. Need an accountability partner. 2 years in, still cant do a handstand', priceRange: [0, 0] },
      { title: 'soccer sundays — {nh}', description: 'Pickup at the field near {street}. Co-ed. 10am. We have 12 regulars but always short. Bring cleats', priceRange: [0, 0] },
      { title: 'Book club — {nh}', description: 'Monthly. Contemporary fiction. We meet at a cafe. Looking for like 5-8 people who will actually read the book and not just show up for wine (ok fine the wine is also a draw)', priceRange: [0, 0] },
      { title: 'Cooking partner — {nh}', description: 'I love cooking but eating alone is depressing. Alternate hosting once a week. Im Dominican, I make a mean pernil. Teach me what you know and ill teach you', priceRange: [0, 0] },
      { title: 'volleyball players needed', description: 'Co-ed rec league. Wednesday nights. We need like 2-3 more people. You dont have to be good just dont be a no show', priceRange: [0, 0] },
      { title: 'Karaoke — K-Town every other Thursday', description: 'Group of 6-8. No judgment. We do Whitney, Bad Bunny, Backstreet Boys, everything. Bad voices especially welcome', priceRange: [0, 0] },
      { title: 'salsa partner — {nh}', description: 'Taking classes near {street}, Tuesdays 8pm. I have two left feet but im committed. Beginner friendly', priceRange: [0, 0] },
      { title: 'Morning walking buddy', description: '6am. 3-4 miles. {nh} area near {street}. We can talk or not. Rain or shine. I go every single day', priceRange: [0, 0] },
      { title: 'Poker night — {nh}', description: '$20 buy-in. Hold Em. Every other Saturday. Snacks, beers. Need 2 more. Friendly game, nobody is getting rich', priceRange: [0, 0] },
      { title: 'Language exchange', description: 'English speaker learning Spanish. Coffee once a week in {nh}. 30 min your language, 30 min mine. Simple', priceRange: [0, 0] },
      { title: 'rollerblade with me?', description: 'I skate in the park most weekends. I can stop without dying and thats about it. Intermediate I guess. Also down for ice skating when it gets cold', priceRange: [0, 0] },
      { title: 'Gym partner — {nh}', description: 'Need a spotter. Gym on {street}, 6pm. PPL split. Any experience level. Having someone there changes everything honestly', priceRange: [0, 0] },
      { title: 'Trivia team — {nh}', description: 'Bar on {street}, Wednesdays. I know history and geography. Need someone who knows pop culture because I am useless at it', priceRange: [0, 0] },
      { title: 'Birding buddy', description: 'Just getting into it. Got binoculars and the Merlin app. Saturday mornings. Already spotted a red-tailed hawk, going for an owl next', priceRange: [0, 0] },
      { title: 'Fishing — shore/pier', description: 'Sheepshead Bay, Coney Island, sometimes Hudson. Mostly catch and release. Just want company while we wait', priceRange: [0, 0] },
      { title: 'Thrift store buddy', description: 'I hit up thrift stores and estate sales every weekend. Need a partner for the hunt', priceRange: [0, 0] },
      { title: 'anyone play ping pong near {nh}', description: 'I just want to play ping pong regularly. Im not great but im getting better. The tables near {street} work. Evenings or weekends', priceRange: [0, 0] },
      { title: 'Boxing gym partner — {nh}', description: 'Going to the boxing gym on {street} 3x a week but my friends think im crazy. Need someone to train with', priceRange: [0, 0] },
      { title: 'swim buddy', description: 'I go to the pool at the rec center on {street}. Looking for a lane buddy or just someone to keep each other accountable. I go mornings before work around 6', priceRange: [0, 0] },
      { title: 'disc golf partner', description: 'theres actually a course in the park and nobody knows about it. I go saturdays. its free. I have extra discs', priceRange: [0, 0] },
      { title: 'chess in the park — {nh}', description: 'I play almost every day after work at the tables near {street}. Getting better but still getting destroyed by the regulars lol. Come play', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'missed-connections',
    templates: [
      { title: 'Blue jacket, L train — Lorimer', description: 'You were reading Murakami. We made eye contact a few times. You smiled at 1st Ave. I was in the gray hoodie. Long shot I know', priceRange: [0, 0] },
      { title: 'Coffee shop — Saturday, {nh}', description: 'Oat milk latte. I had the Americano. We talked about jazz and then my friend showed up and you left before I could get your name', priceRange: [0, 0] },
      { title: 'Dog park — Tompkins', description: 'Your corgi is Biscuit. My mutt is Chaos. Walk together sometime?', priceRange: [0, 0] },
      { title: 'Laundromat — {street}', description: 'Wednesday night. You made that joke about your socks never matching. Curly hair, great smile. Red sneakers (thats me)', priceRange: [0, 0] },
      { title: 'Bookstore — {nh}', description: 'You were in the poetry section. I was pretending to browse fiction. You bought Neruda. I bought Neruda after you left. This is embarrassing', priceRange: [0, 0] },
      { title: '{train} train — Tuesday', description: 'You gave me the last seat. Headphones on. We got off at the same stop and I chickened out', priceRange: [0, 0] },
      { title: 'Farmers market — Union Square', description: 'Saturday, the peaches. We both reached for the same one and you laughed. Tattoo sleeves. Ive been thinking about it', priceRange: [0, 0] },
      { title: 'Bar on {street}', description: 'Friday night. You were reading at the bar by yourself which is honestly the most attractive thing ive ever seen. My friends pulled me away before I could say anything. Vintage band tee. This is a long shot but whatever', priceRange: [0, 0] },
      { title: 'Grocery store — {nh}', description: 'You reached the top shelf for me and made a joke about it. Checkout line conversation. You just moved to the neighborhood. Welcome. DM me', priceRange: [0, 0] },
      { title: 'Running along the river', description: 'We run the same route. You always wave. Orange shoes (me). Tomorrow?', priceRange: [0, 0] },
      { title: 'Brooklyn Steel — last Thursday', description: 'Stood next to each other during the opener. We talked between sets about how the band is underrated. Denim jacket. Where did you go when the crowd moved', priceRange: [0, 0] },
      { title: '{train} — stuck underground 45 min', description: 'You shared your gummy bears with me. Best subway delay ever. You got off before I could ask your name', priceRange: [0, 0] },
      { title: 'Gallery — {nh}', description: 'The abstract piece in the corner. Bad wine, great conversation. You do design, I do education. Wish I stayed longer', priceRange: [0, 0] },
      { title: 'Pizza line — {nh}', description: 'You said Lucalis, I said Di Fara. You were right. I owe you a slice', priceRange: [0, 0] },
      { title: 'Bodega cat on {street}', description: 'We both stopped to pet it. You said "this is the real NYC experience" and I think about that like once a day', priceRange: [0, 0] },
      { title: 'Gym — {street}, 6am', description: 'Adjacent treadmills every morning. Too awkward to talk to someone with headphones in. Im the one without a water bottle (every single time)', priceRange: [0, 0] },
      { title: 'Rooftop bar — {nh}', description: 'Sunset. You asked me to take your photo. I said something stupid. You laughed anyway. Gold hoops, all black', priceRange: [0, 0] },
      { title: 'Ferry to Governors Island', description: 'You were sketching. I peeked. It was incredible. You caught me looking', priceRange: [0, 0] },
      { title: '{train} train, this morning', description: 'You had the green coat and you dropped your metrocard and when I picked it up our hands touched and you smiled and ok I know how this sounds but it was a moment', priceRange: [0, 0] },
      { title: 'to the girl at the halal cart on {street}', description: 'We were both waiting for our food and you said something funny about the hot sauce. I laughed. You left. I regret not saying more. Purple jacket', priceRange: [0, 0] },
      { title: 'Prospect Park — Sunday morning', description: 'We were both sitting on the same bench reading. I was reading {book}. You asked me if it was good. We talked for maybe 5 minutes and then your friend called. I didnt get your name', priceRange: [0, 0] },
      { title: 'Halloween party — {nh}', description: 'You were dressed as something creative, I was a last minute vampire. We danced and I lost you in the crowd. I dont even know whose party that was but I need to find you', priceRange: [0, 0] },
      { title: 'Waiting room on {street}', description: 'We were both sitting in the waiting room for like an hour and you kept making faces at me about how slow they were. You have the best laugh. Blue sneakers', priceRange: [0, 0] },
      { title: 'crosswalk on {street}', description: 'This is absurd but we made eye contact at the crosswalk and you mouthed "nice shirt" and the light changed and you went the other way. Red flannel. Come back to that crosswalk I guess?', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'strictly-platonic',
    templates: [
      { title: 'New to {nh} — need friends', description: 'Just moved from {city} for work. Dont know anyone. 28M, into cooking, hiking, horror movies. Beer?', priceRange: [0, 0] },
      { title: 'mom friends — {nh}', description: 'SAHM with a 2 year old. The playground is lonely. Any other parents in {nh} want to do playdates? I just want adult conversation honestly', priceRange: [0, 0] },
      { title: '30-somethings — {nh}', description: 'All my friends moved to the suburbs. I refuse. Dinner, brunch, movies, whatever. Not dating. Just actual friendship', priceRange: [0, 0] },
      { title: 'Creative people — {nh}', description: 'Writer. Looking for other creatives. Musicians, painters, filmmakers, whatever. Maybe we start a collective. Maybe we just get tacos. Either way', priceRange: [0, 0] },
      { title: 'Dog park regulars — lets actually talk', description: '{nh} dog park every evening. Pit mix. I see the same faces every day and nobody talks. My dog is friendly. Im mostly friendly', priceRange: [0, 0] },
      { title: 'Introvert looking for introvert', description: 'Best hangout = sitting in the same room reading different books. Thats the friendship I want. Near {street}', priceRange: [0, 0] },
      { title: 'Divorced, rebuilding — {nh}', description: '42F. Recently divorced. Turns out all my friends were couples friends. Starting over socially at 42 is honestly terrifying. Wine, walks, honesty. {nh} area', priceRange: [0, 0] },
      { title: 'just moved here pls be my friend', description: 'From {city}. 3 months in. Love NYC but eating alone every night is getting old. 25F, yoga, thrifting, shows. I am literally begging for friendship', priceRange: [0, 0] },
      { title: 'Brunch crew — {nh}', description: 'I want a standing brunch thing. Saturday or Sunday. New spot each week. No flaking. Thats the only rule. DM me if you are reliable and hungry', priceRange: [0, 0] },
      { title: 'nerds — {nh}', description: 'D&D. Anime. Comic books. Building PCs. If you dont judge me for any of that we should hang. I host game sessions. Snacks provided', priceRange: [0, 0] },
      { title: 'Looking for company — {nh}', description: '68F, widowed. Kids are in {city}. I just want someone to walk with and have tea. Ive been in {nh} 40 years, I know every story about every block on {street}', priceRange: [0, 0] },
      { title: 'Sober friends', description: 'Quit drinking a year ago and most of my social life disappeared with it. Looking for people in {nh} who are down to do things that dont revolve around alcohol. It exists right??', priceRange: [0, 0] },
      { title: 'gym buddy — just a friend not a trainer', description: 'Going alone is boring. Mornings. {nh}. Smoothie after. Any fitness level I truly do not care', priceRange: [0, 0] },
      { title: 'International potluck group', description: 'From {city} originally. Want to start a monthly dinner thing in {nh}. Everyone brings a dish from home. Different country every month maybe', priceRange: [0, 0] },
      { title: 'Concert buddy', description: 'None of my friends like my music. Indie, jazz, R&B. Brooklyn Steel, Bowery, Blue Note. DM me your favorite artist and well go from there', priceRange: [0, 0] },
      { title: 'new dad looking for dad friends', description: '34M. 6 month old. My childless friends are tired of hearing about sleep regression and I dont blame them. Other new dads in {nh}? Beer after bedtime?', priceRange: [0, 0] },
      { title: 'WFH buddy — {nh} cafes', description: 'Remote worker losing my mind alone in my apartment. Need someone to sit across from at a cafe a few times a week. We dont even have to talk. Just exist near me', priceRange: [0, 0] },
      { title: 'Night owls — {nh}', description: 'I work late. All my socializing happens after 10pm. Anyone else? Late night diners, walks, whatever. 1am at a diner is my happy place', priceRange: [0, 0] },
      { title: 'Queer friends — {nh}', description: 'Not looking for the bar/club scene. Movie nights, potlucks, park hangs. Building community one friendship at a time', priceRange: [0, 0] },
      { title: 'Empty nester — help', description: '55M. Both kids in college. House is too quiet. Wife says I need friends who arent on TV. I like baseball, BBQ, and bad dad jokes. {nh}', priceRange: [0, 0] },
      { title: 'Study buddy', description: 'Grad student. Doesnt matter what youre studying. Just need another human at the cafe to keep me off my phone. I buy the first coffee', priceRange: [0, 0] },
      { title: 'Arthouse film buddy', description: 'Film Forum and Metrograph every weekend, alone, for years now. Need someone to discuss the movie with after. Foreign films, docs, classics', priceRange: [0, 0] },
      { title: 'honestly just lonely — {nh}', description: 'I work from home, I live alone, and some days I dont talk to another human being until I order coffee. 31F in {nh}. Im normal I promise. Lets just hang out sometimes', priceRange: [0, 0] },
      { title: 'Looking for my people — {nh}', description: 'Moved here 6 months ago and still havent found my crew. 27M from {city}. I like {hobby}, {hobby2}, and trying every restaurant within walking distance. Wide open schedule on weekends', priceRange: [0, 0] },
      { title: 'Old lady needs walking partner', description: 'Im 72 and my doctor says I need to walk more. I walk slow and I talk a lot. Mornings near {street}. Ill buy you coffee after. I have good stories I promise', priceRange: [0, 0] },
      { title: 'Newly sober, newly social', description: '38M, 90 days sober. Realized all my friendships were built around bars. Looking to build real ones. {nh} area. Into {hobby} and {hobby2}. Patient people preferred lol', priceRange: [0, 0] },
      { title: 'sunday morning coffee walk — {nh}', description: 'simple request. Coffee from the spot on {street} then walk around the neighborhood for an hour. Every sunday. Thats the whole pitch', priceRange: [0, 0] },
      { title: 'anyone wanna just like... hang out', description: 'I dont have a plan or an agenda. I just miss having friends I can text "what are you doing" and show up at their apartment with snacks. 29F {nh}', priceRange: [0, 0] },
      { title: 'Need a friend who texts back', description: 'I swear I am not high maintenance but I am tired of friendships where I am always the one reaching out. If you want a friend who actually shows up and stays in touch, hi. Im in {nh}', priceRange: [0, 0] },
      { title: 'retired teacher, {nh}', description: 'Taught for 35 years. Just retired. Miss the energy of being around people every day. Looking for anyone who wants to grab lunch, walk, play cards, whatever. Near {street}', priceRange: [0, 0] },
    ],
  },
]

// ─── HOUSING — 40 templates ───

const HOUSING: SubcategoryTemplates[] = [
  {
    sub: 'apartments',
    templates: [
      { title: 'Sunny 1BR — {nh}', description: 'South-facing. Heat and hot water included. Walk-up 4th floor but the light makes it worth it. Near {train}. Available March 1', priceRange: [180000, 280000] },
      { title: '2BR renovated — {nh}', description: 'New kitchen with stainless and dishwasher. Hardwood. Laundry in building. No broker fee. Near {street}', priceRange: [250000, 380000] },
      { title: 'Studio — exposed brick, {nh}', description: 'Top floor walkup. Original brick. Quiet. Great closet for a studio. Cat friendly. Near {train}', priceRange: [150000, 200000] },
      { title: '3BR — W/D in unit, {nh}', description: 'Washer dryer in the apartment. Full kitchen. Super lives on-site. Pets welcome. Near subway. This is real btw I know it sounds too good', priceRange: [320000, 450000] },
      { title: '2BR — rooftop, doorman, {nh}', description: 'Doorman, gym, rooftop, central AC, W/D. Walk to {train}. Pet friendly. The whole package. Gross rent', priceRange: [350000, 480000] },
      { title: 'Rent-stabilized 1BR — {nh}', description: 'Below market. Heat included. Good super. Near {street}. Dont sleep on this', priceRange: [140000, 180000] },
      { title: 'Studio — high ceilings, {nh}', description: '10 foot ceilings south-facing. 400sqft but feels bigger than my last 1BR honestly. Near {train}', priceRange: [145000, 185000] },
      { title: 'Alcove studio — {nh}', description: 'Sleeping alcove makes this basically a 1BR. Elevator. Laundry. Live-in super. Quiet street. No fee', priceRange: [165000, 210000] },
      { title: '4BR brownstone — {nh}', description: 'Huge. Original details with updated kitchen. Backyard access. Near {street}. Roommates or families. This will go fast', priceRange: [400000, 550000] },
      { title: 'Jr 1BR — {nh}', description: 'Separate kitchen. Bright and clean. Laundry in basement. 5 min to {train}. Landlord actually responds to texts which is apparently rare', priceRange: [155000, 195000] },
      { title: '1BR — {nh}, no fee', description: 'No broker fee. Hardwood. Updated bath. Street facing but quiet somehow. Near {street}. Available now', priceRange: [170000, 250000] },
      { title: '2BR — near {train}, {nh}', description: '2 blocks from the {train}. Real 2BR not one of those converted things. Both rooms fit queens. Laundry in building', priceRange: [260000, 360000] },
      { title: 'Studio — cheap, {nh}', description: 'Its small. Im not gonna lie to you. But its clean, the radiators work, and its 3 blocks from the {train}. You will not find this price in {nh} right now', priceRange: [130000, 170000] },
    ],
  },
  {
    sub: 'rooms-shared',
    templates: [
      { title: 'Room in 3BR — {nh}', description: 'Private room. 2 roommates, both work 9-5 so its quiet during the day. Shared kitchen/bath. Near {train}. Utils split 3 ways', priceRange: [95000, 140000] },
      { title: 'Room — {nh}, all utils included', description: 'Furnished. Wifi electric heat all in. Shared bath and kitchen. No smoking. Month to month if you want', priceRange: [110000, 160000] },
      { title: 'Master BR in 2BR — {nh}', description: 'Biggest room, fits a queen easy. Roommate is 28F, works in tech, clean, respectful. Near {street}', priceRange: [120000, 160000] },
      { title: 'Room — LGBTQ+ friendly, {nh}', description: 'Chill household looking for a 3rd roommate. We have a cat. Near {train}. $1,100 + utils', priceRange: [100000, 130000] },
      { title: 'Furnished room — short term ok', description: 'Bed desk dresser. 3 month minimum. Working professionals. Near {street}. Clean quiet building', priceRange: [110000, 150000] },
      { title: 'Room — {nh}, female preferred', description: '2BR apt. Im a 26F nurse, work nights so the place is empty a lot. Private room, shared everything else. Near {train}. Clean and chill', priceRange: [105000, 145000] },
      { title: 'Large room in {nh} apt', description: 'Big room. Like actually big. You could fit a desk and a queen and still have floor space. 2 other roommates. We get along but mostly keep to ourselves', priceRange: [110000, 155000] },
    ],
  },
  {
    sub: 'sublets',
    templates: [
      { title: 'Summer sublet — {nh} 1BR', description: 'June-August. Fully furnished. AC in every room. Near {train}. Gym and laundry in building. My lease your summer', priceRange: [180000, 260000] },
      { title: 'Sublet — {nh} studio, 3 months', description: 'Leaving for work March-May. Cute studio near {street}. Everything included. Literally just bring clothes', priceRange: [150000, 200000] },
      { title: 'Furnished 1BR sublet — {nh}', description: 'April through September. New building. Elevator. Doorman. All my furniture stays. Near {train}', priceRange: [200000, 300000] },
      { title: '6-week sublet — {nh}', description: 'Going abroad mid-March. 1BR with office nook. Fast wifi. Perfect if you work remote. Near {street}', priceRange: [170000, 220000] },
      { title: 'Sublet my 1BR — {nh}', description: 'Im traveling for work for 2 months. You get a fully furnished apartment near {train} with a view of the park from the kitchen window. Take care of my plants and we have a deal', priceRange: [190000, 270000] },
    ],
  },
  {
    sub: 'parking-storage',
    templates: [
      { title: 'Indoor parking — {nh}', description: 'Covered garage. 24/7 access. Cameras. Fits sedan or small SUV. Near {street}', priceRange: [25000, 45000] },
      { title: 'Storage unit — {nh}', description: '5x10 climate controlled. Clean. Month to month. Access 7am-10pm', priceRange: [15000, 25000] },
      { title: 'Parking spot — {nh}', description: 'Outdoor spot behind my building on {street}. Gated. You get a clicker. Not the fanciest setup but its a guaranteed spot in {nh} and thats worth something', priceRange: [18000, 30000] },
    ],
  },
]

// ─── JOBS — 35 templates ───

const JOBS: SubcategoryTemplates[] = [
  {
    sub: 'restaurant-hospitality',
    templates: [
      { title: 'Line Cook — {nh}', description: '$18-22/hr + meal. Brunch and dinner. Experience required. Need someone who can handle a rush without losing it. Start immediately', priceRange: [0, 0] },
      { title: 'Server/Bartender — {nh}', description: '$15/hr + tips. Tips are good ($200-400/night on weekends). Wine knowledge helps. Small team. Weekend availability is a must', priceRange: [0, 0] },
      { title: 'Barista — {nh}', description: '$17/hr + tips. We train on our beans. Morning shifts. If you can do latte art thats a bonus but we mostly need someone whos friendly and shows up on time', priceRange: [0, 0] },
      { title: 'Restaurant Manager — {nh}', description: '$55-65K + bonus. 3+ years managing. Staffing, ordering, customer issues. We are a neighborhood spot and need someone who gives a damn', priceRange: [0, 0] },
      { title: 'Prep Cook — {nh}', description: '$16-18/hr. 6am-2pm. Chopping, portioning, prepping. Be reliable. Be fast. No drama please', priceRange: [0, 0] },
      { title: 'Dishwasher — {nh}', description: '$16/hr. Full time. It is not glamorous but its honest work and we treat our kitchen staff well. Benefits after 90 days', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'tech-engineering',
    templates: [
      { title: 'Junior Frontend Dev — hybrid', description: '$70-90K. React/Next.js. 1-2 years exp. In-office 3 days near {street}. Small team. Health + 401k', priceRange: [0, 0] },
      { title: 'Senior Backend Engineer', description: '$150-180K. Python, PostgreSQL, AWS. 5+ years. We are scaling and need someone whos done this before. Equity available', priceRange: [0, 0] },
      { title: 'Data Analyst — healthcare', description: '$85-110K. SQL, Python, Tableau. Help us make sense of patient data. Hybrid. Benefits', priceRange: [0, 0] },
      { title: 'Full Stack Engineer — fintech', description: '$120-160K. TypeScript, Node, React. Series B. In-office near {train}. Building real financial tools not another CRUD app', priceRange: [0, 0] },
      { title: 'IT Support — {nh}', description: '$55-70K. Small company needs someone to manage our systems. We have 40 employees and no IT person right now. Its a mess. Help', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'trades-skilled-labor',
    templates: [
      { title: 'Electrician Apprentice — union', description: '$25-35/hr + benefits. Will train the right person. Must show up and work hard. Steady pay, steady work', priceRange: [0, 0] },
      { title: 'Licensed Plumber', description: '$40-60/hr. 5+ years NYC. Residential and light commercial. Own tools and van. Good clients, steady work', priceRange: [0, 0] },
      { title: 'HVAC Tech — commercial', description: '$30-45/hr. EPA certified. Benefits after 90 days. Company vehicle. {nh} area', priceRange: [0, 0] },
      { title: 'Carpenter — custom work', description: '$28-40/hr. Custom closets, shelving, trim. Quality over speed. Need references or portfolio. {nh}', priceRange: [0, 0] },
      { title: 'Painter — residential', description: '$25-35/hr. Interior/exterior. Must be clean and careful. We do high end apartments where you cant have drips or tape lines showing', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'healthcare',
    templates: [
      { title: 'Home Health Aide — {nh}', description: '$17-20/hr. PCA or HHA cert. Helping seniors stay independent. Flexible schedule', priceRange: [0, 0] },
      { title: 'Medical Assistant — {nh}', description: '$18-22/hr. Bilingual preferred but not required. Vitals, intake, EHR. Friendly clinic. Benefits', priceRange: [0, 0] },
      { title: 'Dental Hygienist — {nh}', description: '$45-55/hr. Private practice. Good patients. Modern equipment. 4 days, no weekends', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'retail',
    templates: [
      { title: 'Retail Associate — {nh}', description: '$16-18/hr. PT and FT available. Employee discount. If you actually like helping customers and arent just staring at your phone all day, we want you', priceRange: [0, 0] },
      { title: 'Store Manager — {nh}', description: '$50-60K. 2+ years retail mgmt. Inventory, scheduling, customer experience. Growing brand', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'creative-media',
    templates: [
      { title: 'Graphic Designer — {nh}', description: '$55-75K. Adobe, Figma. 2+ years. Brand identity, social, print. Hybrid. Agency with cool clients', priceRange: [0, 0] },
      { title: 'Social Media Manager', description: '$50-65K. Instagram, TikTok, LinkedIn. Content + strategy + analytics. Remote-first, NYC meetups monthly', priceRange: [0, 0] },
      { title: 'Video Editor — {nh}', description: '$60-80K. Premiere Pro, After Effects. Brands and docs. In-office near {street}. Send your reel', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'education-teaching',
    templates: [
      { title: 'After-school Tutor — {nh}', description: '$25-40/hr. K-8 homework and test prep. 3-6pm weekdays. Patient people only. Background check required', priceRange: [0, 0] },
      { title: 'ESL Teacher — {nh}', description: '$30-40/hr. Adult immigrants. Evening classes. TESOL preferred. Really rewarding work honestly', priceRange: [0, 0] },
      { title: 'Music Teacher — {nh}', description: '$40-60/hr. Piano and/or guitar. In-home lessons. Kids and adults. Near {street}. Must be patient with beginners', priceRange: [0, 0] },
    ],
  },
]

// ─── FOR SALE — 45 templates ───

const FOR_SALE: SubcategoryTemplates[] = [
  {
    sub: 'furniture',
    templates: [
      { title: 'Dining table — solid wood, seats 6', description: 'Moving. Real wood not veneer. Some scratches. You haul. Cash. Near {street}', priceRange: [10000, 25000] },
      { title: 'Couch — Article, great condition', description: '2 years old. No stains no pet damage. Seats 3. I would keep it if it fit in my new place', priceRange: [30000, 60000] },
      { title: 'IKEA Kallax 4x4 — white', description: 'Assembled. Moving. Great for books/vinyl. You disassemble and haul. Its heavy fair warning', priceRange: [4000, 8000] },
      { title: 'Queen bed frame + headboard', description: 'Platform frame. No box spring needed. No squeaks. Mattress not included. Pick up this weekend', priceRange: [12000, 25000] },
      { title: 'Standing desk — electric', description: 'Uplift V2. Dual motors. Bamboo top. Goes from 25 to 50 inches. Going back to the office so I dont need it anymore. Barely used', priceRange: [20000, 35000] },
      { title: 'Recliner — real leather', description: 'La-Z-Boy. Dark brown. Moving and it wont fit through the new door. I am genuinely sad about this. Pick up on {street}', priceRange: [15000, 30000] },
      { title: 'Dresser — 6 drawer', description: 'Works fine. Nothing fancy. All drawers open smooth. Solid. You pick up. Near {street}', priceRange: [5000, 12000] },
      { title: 'Couch — FREE if you pick up today', description: 'Gray. Functional. Has some wear but its comfortable. Moving tomorrow and I am literally begging someone to take this thing. {street}', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'electronics',
    templates: [
      { title: 'MacBook Pro M2 — 16GB', description: 'Battery 98%. AppleCare until 2027. Always had a case. Upgrading to M4. Comes with charger and box', priceRange: [90000, 130000] },
      { title: 'PS5 + 2 controllers', description: 'Disc edition. Works perfect. 3 games. Original box. Just dont play anymore', priceRange: [30000, 45000] },
      { title: 'Samsung 55" 4K TV', description: 'Used 1 year. Great picture. Comes with wall mount or stand. Remote included. Pick up {nh}', priceRange: [20000, 35000] },
      { title: 'iPhone 14 Pro — unlocked', description: '256GB. No scratches, case + screen protector since day 1. Battery 91%. Any carrier. Midnight purple', priceRange: [50000, 75000] },
      { title: 'Sony XM5 headphones', description: '6 months old. Got AirPods Max as a gift so selling these. Original case and box. Best noise cancelling headphones that exist', priceRange: [18000, 28000] },
      { title: 'iPad Air 5th gen', description: 'WiFi 256GB. Apple Pencil included. Used for drawing mostly. No scratches. Getting a laptop instead', priceRange: [35000, 50000] },
    ],
  },
  {
    sub: 'bikes',
    templates: [
      { title: 'Trek FX3 hybrid', description: 'Carbon fork. Disc brakes. Ridden 1 season. Fits 5\'8"-6\'0"', priceRange: [35000, 55000] },
      { title: 'Brompton folding bike', description: '6 speed. Folds in 20 seconds. Perfect for apartments and the subway. Includes bag', priceRange: [100000, 150000] },
      { title: 'E-bike — 500W', description: '28mph. 40 mile range. Battery removable, charges in 4 hours. Got a car so selling', priceRange: [60000, 100000] },
      { title: 'Fixed gear — matte black', description: '52cm. Flip flop hub. New chain and tires. Comes with U-lock', priceRange: [20000, 35000] },
      { title: 'Road bike — needs work', description: 'Its a project. Brakes work, gears dont shift great, but the frame is good. Selling cheap because I dont have time to fix it', priceRange: [8000, 18000] },
    ],
  },
  {
    sub: 'clothing-accessories',
    templates: [
      { title: 'North Face puffer — M', description: '700 fill. Black. No rips. Bought a longer coat', priceRange: [8000, 15000] },
      { title: 'Vintage Levis 501s — 32x32', description: 'Actual vintage not repro. Perfect fade. They dont fit me anymore and I am in denial about it', priceRange: [5000, 10000] },
      { title: 'Nike AF1 — size 10 DS', description: 'White on white. Never worn. In box with receipt. Wrong size gift', priceRange: [8000, 13000] },
      { title: 'Canada Goose — size L', description: 'Expedition parka. Worn 2 winters. Minor wear on cuffs. Professionally cleaned. This coat kept me alive', priceRange: [35000, 55000] },
      { title: 'Timbs — size 11', description: 'Worn one winter. Waterproofed. Classic wheat. No scuffs', priceRange: [7000, 12000] },
    ],
  },
  {
    sub: 'free-stuff',
    templates: [
      { title: 'FREE couch — {nh}', description: 'Gray sectional. Has some wear but its comfortable. Moving and I need it gone by Saturday. You haul. Please take it I am begging', priceRange: [0, 0] },
      { title: 'Moving boxes — FREE, {nh}', description: 'Like 30 boxes all sizes plus packing paper and bubble wrap. Outside my building on {street}. First come. Theyre going in the trash tonight if nobody takes them', priceRange: [0, 0] },
      { title: 'Books — 3 boxes, {nh}', description: 'Fiction, cookbooks, random nonfiction. Downsizing. On my stoop Saturday morning. Take what you want', priceRange: [0, 0] },
      { title: 'Plants — rehoming, {nh}', description: '8 plants. Monstera (4ft), pothos, snake plant, spider plant, etc. I am moving and I cant take them. Please give them a window', priceRange: [0, 0] },
      { title: 'FREE desk — {nh}', description: 'IKEA desk. Works fine. Nothing wrong with it I just got a new one. You pick up from my building on {street}. Its heavy heads up', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'vinyl-records',
    templates: [
      { title: 'Jazz vinyl — 40 records', description: 'Coltrane, Monk, Miles, Mingus, Ella. All VG+ or better. 20 years of collecting. Selling as a lot. Moving overseas and these are too heavy to ship', priceRange: [20000, 40000] },
      { title: 'Hip hop vinyl — 25 albums', description: 'Nas, Biggie, Tribe, De La Soul, OutKast. Mix of OG pressings and reissues. All play great. Will sell individually or as a lot', priceRange: [15000, 25000] },
      { title: '90s R&B — 15 records', description: 'TLC, Aaliyah, SWV, Brandy, Erykah Badu. Nostalgic vibes. All in great shape. Meet in {nh}', priceRange: [8000, 15000] },
      { title: 'Punk/post-punk — 20 records', description: 'Talking Heads, Television, Ramones, Joy Division, Sonic Youth. Some rare presses. Selling because I dont have a turntable anymore lol', priceRange: [12000, 22000] },
    ],
  },
  {
    sub: 'sneakers-streetwear',
    templates: [
      { title: 'Jordan 4 Bred — sz 10 DS', description: 'Deadstock. SNKRS receipt. Never tried on. Double boxed. Meet in {nh} or I ship. Price firm', priceRange: [22000, 30000] },
      { title: 'New Balance 990v6 — sz 10.5', description: 'Made in USA. Gray. Wore them twice. Too narrow for my wide feet. Box included. Basically new', priceRange: [14000, 20000] },
      { title: 'Supreme bogo hoodie — M', description: 'FW24 black on black. Tried on once. Receipt in hand. Meet in Manhattan. Dont lowball me', priceRange: [35000, 50000] },
      { title: 'Dunks — sz 9, worn once', description: 'Panda dunks. Wore them to dinner and decided theyre not for me. No creases. $90 firm. Meet in {nh}', priceRange: [7000, 11000] },
    ],
  },
]

// ─── SERVICES — 25 templates ───

const SERVICES: SubcategoryTemplates[] = [
  {
    sub: 'cleaning',
    templates: [
      { title: 'Deep clean — {nh}', description: 'We do the stuff you dont want to do. Behind the fridge. Inside the oven. Baseboards. 10 years in NYC apartments. Licensed and insured', priceRange: [15000, 30000] },
      { title: 'Weekly cleaning — {nh}', description: 'Same person every week. I bring my own supplies. Been doing this 7 years. References if you want them. Text me', priceRange: [10000, 18000] },
      { title: 'Move-out cleaning', description: 'I will get your deposit back. Thats literally my pitch. Before and after photos. I do walls, floors, inside cabinets, everything. Book a week out', priceRange: [20000, 35000] },
      { title: 'Office cleaning — small spaces', description: 'After hours. Small offices, coworking desks, studios. Weekly or biweekly. I work fast and I dont touch your papers', priceRange: [12000, 22000] },
    ],
  },
  {
    sub: 'handyman',
    templates: [
      { title: 'Handyman — {nh}', description: 'TV mounting. Shelves. Curtain rods. Drywall. That thing your landlord said hed fix 6 months ago. 15 years doing this. Call or text', priceRange: [7500, 15000] },
      { title: 'IKEA assembly — flat rate', description: 'I have built every piece of IKEA furniture that exists. Flat rate per piece. I bring tools. Usually same day. Its not that deep but I enjoy it', priceRange: [5000, 10000] },
      { title: 'Small repairs — {nh}', description: 'Leaky faucet, squeaky door, outlet not working, hole in the wall. Stuff thats too small for a contractor but too annoying to ignore. $50 minimum', priceRange: [5000, 12000] },
      { title: 'Painting — apartments, {nh}', description: 'Clean lines, no drips, I tape everything. Prep and paint. I can match any color. Most studios done in a day. References available', priceRange: [15000, 40000] },
    ],
  },
  {
    sub: 'moving-hauling',
    templates: [
      { title: '2 guys and a truck — {nh}', description: 'Local moves. We bring pads, dollies, straps. No hidden fees, what I quote is what you pay. Been moving people in NYC for 8 years. We dont break stuff', priceRange: [25000, 50000] },
      { title: 'Junk removal — {nh}', description: 'Old furniture, busted AC, whatever. We haul it out. Same day if you call before noon. You dont lift a finger', priceRange: [10000, 25000] },
      { title: 'Small moves and deliveries', description: 'Got a couch off Craigslist? Bought a dresser but dont have a car? I have a van. $75-150 depending on distance and weight', priceRange: [7500, 15000] },
    ],
  },
  {
    sub: 'tutoring',
    templates: [
      { title: 'Math tutor — {nh}', description: 'Algebra through calc. Patient. I explain things in ways that actually make sense. $60/hr, your place or a cafe. First session free', priceRange: [5000, 10000] },
      { title: 'SAT prep — 1560 scorer', description: 'I know the test. Scored 1560. I can get your kid from where they are to where they need to be. $80/hr. In person or online', priceRange: [7000, 12000] },
      { title: 'Piano lessons — {nh}', description: 'Classically trained but I can teach pop, jazz, whatever you want. Kids and adults. Your place or mine. $75/hr. Patient with beginners', priceRange: [6000, 10000] },
      { title: 'Spanish tutor — conversational', description: 'Native speaker. Conversation-based, not textbook stuff. We go to a cafe and just talk. $40/hr. You will be ordering in Spanish within a month', priceRange: [3500, 6000] },
    ],
  },
  {
    sub: 'photography',
    templates: [
      { title: 'Portrait photos — natural light, NYC', description: 'I shoot in parks and rooftops. No studio needed. You get 30+ edited shots. I make everyone look good I promise', priceRange: [15000, 30000] },
      { title: 'Headshots — {nh}', description: 'For LinkedIn, acting, dating apps, whatever you need. 30 min, 10 edited photos. Quick turnaround. You will look like yourself but better', priceRange: [12000, 25000] },
      { title: 'Event photographer — {nh}', description: 'Birthdays, parties, small events. I stay out of the way and get the real moments. Gallery delivered within 48 hours', priceRange: [30000, 60000] },
    ],
  },
  {
    sub: 'plumbing',
    templates: [
      { title: 'Plumber — licensed, {nh}', description: 'NYC licensed. 20 years. Leaks, clogs, water heaters, installations. Emergency calls ok. I show up when I say I will which apparently makes me rare', priceRange: [10000, 30000] },
      { title: 'Drain clearing — same day', description: 'Kitchen, bathroom, main line. I have the equipment. Most clogs fixed in under an hour. No call-out fee if I cant fix it', priceRange: [8000, 18000] },
    ],
  },
  {
    sub: 'web-app-dev',
    templates: [
      { title: 'Websites for small businesses', description: 'I build sites that look good on phones and actually load fast. Starting at $500. I am a real person in NYC you can meet for coffee. Not an agency', priceRange: [50000, 150000] },
      { title: 'Freelance developer — React/Next.js', description: 'Need a feature built? Bug fixed? Something automated? I do contract work for startups. Hourly or project based. Portfolio on request', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'personal-training',
    templates: [
      { title: 'Personal trainer — {nh}', description: 'NASM certified. Your gym, park, wherever. I work with all levels. First session is free so you can see if we click. $80/session after that', priceRange: [6000, 12000] },
      { title: 'Boxing + strength training — {nh}', description: 'Former amateur boxer. I train people who want to hit things and get strong. Not crossfit. Not a bootcamp. Just hard work. $70/session', priceRange: [5500, 10000] },
    ],
  },
  {
    sub: 'pet-grooming',
    templates: [
      { title: 'Dog grooming — I come to you, {nh}', description: 'Bath, haircut, nails, ears. All breeds. I am gentle with nervous dogs. $75-120 depending on size. Book a week out. Your dog will smell amazing', priceRange: [7500, 15000] },
    ],
  },
]

// ─── GIGS — 20 templates ───

const GIGS: SubcategoryTemplates[] = [
  {
    sub: 'moving-help',
    templates: [
      { title: 'Need 2 people Saturday — moving, {nh}', description: 'Going from a 2BR to a 1BR. Elevator in both buildings. Should be 3 hours tops. $100 each + pizza + drinks. Cash same day', priceRange: [8000, 15000] },
      { title: 'Disassemble IKEA stuff — {nh}', description: 'Bed frame and a Kallax. Need it taken apart so I can move it. Bring your own allen wrench. Quick job, $60 cash', priceRange: [4000, 8000] },
      { title: 'Help carry couch upstairs — {nh}', description: 'Bought a couch and its sitting in my lobby. 4th floor walkup. Need one strong person to help me get it up there. 20 minutes max. $40', priceRange: [3000, 5000] },
    ],
  },
  {
    sub: 'dog-walking',
    templates: [
      { title: 'Dog walker needed — weekdays, {nh}', description: 'Goldendoodle. Friendly, walks well on leash. 30 min midday walk Mon-Fri. I have meetings and cant get away. $18/walk. Near {street}', priceRange: [1500, 2500] },
      { title: '2 small dogs — weekend walks, {nh}', description: 'Two chihuahua mixes. They are sweet I promise. Saturday and Sunday mornings. $20 a walk. Near {street}', priceRange: [1500, 2500] },
    ],
  },
  {
    sub: 'delivery-runs',
    templates: [
      { title: 'Need a car — pickup in {nh}', description: 'Bought a dresser off someone in {nh}. I dont have a car. Need someone to pick it up and bring it to me. Should take an hour. $75 cash', priceRange: [5000, 10000] },
      { title: 'Weekly grocery run for my mom — {nh}', description: 'My mom is in {nh} near {street}. She needs groceries picked up and brought to her once a week. She will have the list ready. $30/trip', priceRange: [2500, 4000] },
      { title: 'Pick up a package — {nh}', description: 'Package got delivered to my old address and they wont redeliver. Need someone to grab it and bring it to {nh}. Small box. $40', priceRange: [3000, 5000] },
    ],
  },
  {
    sub: 'event-setup',
    templates: [
      { title: 'Birthday party setup — Saturday, {nh}', description: 'Setting up in a rented space. Carrying stuff from my car, hanging decorations, moving tables. 2 hours max. $80 cash. Not complicated just need extra hands', priceRange: [6000, 10000] },
      { title: 'Help set up a pop-up — {nh}', description: 'I sell vintage clothes. Need someone to help me set up a table and racks at a market on Saturday morning. 7am-9am. $50 cash', priceRange: [4000, 6000] },
    ],
  },
  {
    sub: 'cleaning',
    templates: [
      { title: 'Deep clean before in-laws visit — {nh}', description: 'They arrive Friday. I need someone Thursday to make this apartment look like adults live here. Kitchen, bath, floors. 3 hours. $120 cash', priceRange: [8000, 15000] },
      { title: 'Post-party cleanup — {nh}', description: 'Had a party. Its bad. Need someone Sunday morning to help me clean up. Dishes, floors, general chaos. 2 hours. $80', priceRange: [6000, 10000] },
    ],
  },
  {
    sub: 'tech-help',
    templates: [
      { title: 'Smart home setup — {nh}', description: 'I bought smart lights and a thermostat and Ive been staring at them for 2 weeks. Need someone to set it all up. $60. Should take like an hour if you know what youre doing', priceRange: [4000, 8000] },
      { title: 'My laptop is dying — {nh}', description: 'Its slow. Things keep crashing. Might be a virus. Need someone to come look at it and fix whatever is wrong. $50 + snacks', priceRange: [3000, 6000] },
    ],
  },
  {
    sub: 'pet-sitting',
    templates: [
      { title: 'Cat sitter — 5 days, {nh}', description: 'Going on vacation. Need someone to stop by once a day. Feed her, clean the litter, maybe hang out for 10 min. She is very easy. $25/day. Near {street}', priceRange: [2000, 3500] },
      { title: 'Dog sit at my place — 3 nights, {nh}', description: 'Traveling for work. Need someone to stay at my apartment with my dog. He is a couch potato honestly. $50/night', priceRange: [4000, 6000] },
    ],
  },
  {
    sub: 'data-entry',
    templates: [
      { title: 'Data entry — remote', description: 'Need someone to enter about 500 items into a spreadsheet. Work from home, flexible hours. $15/hr. Probably 8-10 hours total. DM me', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'photography',
    templates: [
      { title: 'Need a photographer — birthday, {nh}', description: 'Birthday party Saturday evening. Nothing fancy, just candids and group shots. 2 hours. $150. You dont have to be Annie Leibovitz just be good', priceRange: [10000, 20000] },
    ],
  },
  {
    sub: 'flyer-promo',
    templates: [
      { title: 'Hand out flyers — {nh}', description: 'New restaurant on {street}. Need someone friendly to hand out menus Saturday 11am-3pm. $60 cash. Free lunch included', priceRange: [4000, 8000] },
    ],
  },
]

// ─── TICKETS — 20 templates ───

const TICKETS: SubcategoryTemplates[] = [
  {
    sub: 'concerts',
    templates: [
      { title: '2 tix — MSG this weekend', description: 'Section 112. Work came up. Face value, Ticketmaster transfer. Not trying to scalp just trying to not waste them. DM for details', priceRange: [10000, 25000] },
      { title: 'Brooklyn Steel — SOLD OUT, 2 tix', description: 'GA. Cant go anymore. Face value. This is a good show dont let these go to waste', priceRange: [5000, 12000] },
      { title: 'Radio City — 4 tickets together', description: 'Orchestra center. Family thing came up and we cant make it. Selling all 4 below what I paid. Will transfer right away', priceRange: [12000, 25000] },
      { title: 'Bowery Ballroom — Friday, 2 tix', description: 'Sold out. GA. Selling at cost. Best small venue in the city. DM me for the artist', priceRange: [4000, 8000] },
      { title: 'Terminal 5 — 2 GA', description: 'Next Saturday. Got sick and not going to recover in time. Selling both at face value. Can transfer right now', priceRange: [6000, 14000] },
    ],
  },
  {
    sub: 'sports',
    templates: [
      { title: 'Knicks — lower level, 2 tix', description: 'Section 105. Not nosebleeds. Weeknight game. Cant make it. Face value. I just dont want them to go empty', priceRange: [12000, 25000] },
      { title: 'Yankees — field level, 2', description: 'Section 110, row 8. Weekend game. You can see the pitchers face. Schedule conflict. Selling at what I paid', priceRange: [15000, 35000] },
      { title: 'Mets — 4 seats, Saturday', description: 'Section 126. Citi Field. Taking the family but they bailed lol. All 4 together. Below face value', priceRange: [8000, 15000] },
      { title: 'Nets — center court, Barclays', description: 'Section 100. Close enough to hear them talking to each other. Weeknight. 2 tickets. Face value', priceRange: [8000, 18000] },
      { title: 'NYCFC — 2 tix, good seats', description: 'Yankee Stadium. Coming up this weekend. Never been to a soccer game? This is a good one to start with. $40 for both', priceRange: [2500, 5000] },
    ],
  },
  {
    sub: 'broadway',
    templates: [
      { title: 'Hamilton — orchestra, 2 seats', description: 'Row M center. Cannot make the date. Try getting these at face value normally. Transferring immediately. No markup', priceRange: [20000, 40000] },
      { title: 'Wicked — Saturday matinee', description: 'Mezzanine center. 2 tickets. Great view of the stage. Face value. Perfect weekend plans that I can no longer attend', priceRange: [12000, 25000] },
      { title: 'Lion King — 2 tix, Saturday', description: 'Front mezz. Date fell through. Selling below what I paid because Im annoyed and just want them gone', priceRange: [15000, 30000] },
      { title: 'Off-Broadway — Village, 4 tickets', description: 'Small theater. Great reviews. Bought for a group outing that fell apart because my friends are flaky. All 4 below face', priceRange: [6000, 15000] },
    ],
  },
  {
    sub: 'comedy',
    templates: [
      { title: 'Comedy Cellar — Saturday late show', description: '2 tickets. The original room. You might see someone famous drop in. Plans changed. Face value. Dont miss this', priceRange: [3000, 6000] },
      { title: 'Stand-up — {nh}, 4 tix Friday', description: 'Good lineup. Bought for friends who all suddenly have plans. $20 each. Their loss honestly', priceRange: [1500, 3000] },
    ],
  },
]

// ─── PETS — 15 templates ───

const PETS: SubcategoryTemplates[] = [
  {
    sub: 'adoption',
    templates: [
      { title: 'Tabby cat needs a home — {nh}', description: '3 years old. Spayed, all shots. Loves laps and window watching. Moving to a no-pets building and it breaks my heart. Comes with all her stuff', priceRange: [0, 0] },
      { title: '2 kittens — they come as a pair', description: '8 weeks. Litter trained already. They sleep in a pile and its the cutest thing youve ever seen. Please take both. Adoption fee covers vet', priceRange: [0, 5000] },
      { title: 'Pit mix — the sweetest dog alive', description: 'Neutered, vaccinated, 2 years old. Found as a stray, fostered him back to health. Loves belly rubs. Great with kids. Needs someone with space and energy', priceRange: [0, 0] },
      { title: 'Senior cat — {nh}', description: '10 years old. Calm. Never scratches anything. Just wants a warm lap. Her owner passed away and she deserves a quiet happy home', priceRange: [0, 0] },
      { title: 'Bonded rabbits — {nh}', description: 'Holland lops, 2 years old. Litter trained. They are inseparable and I need them to stay together. Cage and supplies included', priceRange: [0, 0] },
      { title: 'Kitten — 12 weeks, {nh}', description: 'Found him behind my building a month ago. Vet says he is healthy. Very playful, uses litter box, purrs constantly. I already have 2 cats or I would keep him', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'pet-sitting',
    templates: [
      { title: 'Cat sitter — 1 week, {nh}', description: 'Traveling. Need someone to come by once a day. Feed, water, scoop, maybe sit with her for 10 minutes. She is easy. $25/visit', priceRange: [2000, 3500] },
      { title: 'Dog boarding — my apartment, {nh}', description: 'Your dog stays with me. Park nearby. Walks 3x a day. Couch privileges obviously. $45/night. Ive had dogs my whole life', priceRange: [3500, 5500] },
    ],
  },
  {
    sub: 'dog-walking',
    templates: [
      { title: 'Dog walker — {nh}', description: 'All breeds. 30 or 60 min walks. I send photo updates because I know you want to see your dog having fun. References available', priceRange: [1500, 3000] },
      { title: 'Pack walks — {nh}', description: 'Max 4 dogs so everybody gets attention. Morning and afternoon. $18/walk. First one free to see if your dog likes the group', priceRange: [1500, 2500] },
    ],
  },
  {
    sub: 'grooming',
    templates: [
      { title: 'Dog grooming — mobile, {nh}', description: 'I come to your building. Bath, cut, nails, ears. All sizes. Im good with nervous dogs, I go slow. $75-130 depending on size', priceRange: [7500, 15000] },
    ],
  },
  {
    sub: 'lost-found-pets',
    templates: [
      { title: 'LOST — orange tabby, {nh}', description: 'Indoor cat, escaped through a window near {street}. Responds to Mango. Very friendly. Please check yards and fire escapes. I am losing my mind. Reward', priceRange: [0, 0] },
      { title: 'FOUND — small white dog, {nh}', description: 'Found near {street} wandering around looking scared. No collar, no chip. Hes safe at my place. Somebody is looking for this dog. Please share', priceRange: [0, 0] },
      { title: 'LOST — gray pitbull, {nh}', description: 'Fireworks spooked him and he bolted. Red collar. Friendly but might be hiding. Last seen on {street}. Reward. Please call if you see him I cant sleep', priceRange: [0, 0] },
      { title: 'FOUND — gray cat, {nh}', description: 'Been hanging around my building for a week near {street}. Very friendly, clearly someones pet. I am feeding her but she needs to go home', priceRange: [0, 0] },
    ],
  },
]

// ─── BARTER — 10 templates ───

const BARTER: SubcategoryTemplates[] = [
  {
    sub: 'goods-for-goods',
    templates: [
      { title: 'KitchenAid mixer for a road bike', description: 'Red Artisan. Used it twice. Looking for a road bike, 54-56cm. Open to other offers too. Im in {nh}', priceRange: [0, 0] },
      { title: 'PS5 for Switch OLED + cash', description: 'Disc edition PS5 with 2 controllers. Want a Switch OLED + $100. Meet in {nh} so we can both check everything works', priceRange: [0, 0] },
      { title: 'Vinyl for concert tickets', description: '50+ jazz and soul records. VG+ condition. Will trade for concert tickets to upcoming shows. DM what you got', priceRange: [0, 0] },
      { title: 'Surfboard for snowboard', description: '6\'2" shortboard. Good condition. Need an all-mountain snowboard 155-160cm. Seasons changing anyway. {nh}', priceRange: [0, 0] },
      { title: 'Electric guitar for acoustic', description: 'Fender Strat MIM. Good condition. Want a decent acoustic. Apartment neighbors will thank me. In {nh}', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'goods-for-skills',
    templates: [
      { title: 'Camera for headshots', description: 'Have a Canon EOS R + 50mm lens I never use. Trade it for professional headshots. You get a camera, I get LinkedIn-ready', priceRange: [0, 0] },
      { title: 'Free furniture if you help me move', description: 'Couch, coffee table, bookshelves. Yours if you help me move the rest of my stuff to {nh}. 3 hours probably. Fair trade imo', priceRange: [0, 0] },
      { title: 'Laptop for website', description: 'MacBook Air M1 in good shape. Trade for someone building me a simple website for my small business. Equivalent value', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'skills-for-skills',
    templates: [
      { title: 'Spanish for guitar lessons', description: 'Native Spanish speaker. Want to learn guitar. One hour each per week. {nh}. Any level. Lets just teach each other stuff', priceRange: [0, 0] },
      { title: 'Web design for photography', description: 'I build websites. Need product photos. Trade: your site for my headshots. Both walk away with something useful. {nh}', priceRange: [0, 0] },
      { title: 'Cooking for Mandarin practice', description: 'Trained chef. Ill teach you Italian cooking if you practice Mandarin with me. Weekly in {nh}. This is the most NYC trade ever', priceRange: [0, 0] },
      { title: 'Personal training for tattoo', description: 'Certified trainer. Want a tattoo. You train with me, I ink you. Session for session. {nh} area', priceRange: [0, 0] },
    ],
  },
]

// ─── RENTALS — 10 templates ───

const RENTALS: SubcategoryTemplates[] = [
  {
    sub: 'tools-equipment',
    templates: [
      { title: 'Power drill — $15/day, {nh}', description: 'DeWalt 20V. Charger, 2 batteries, full bit set. $50 deposit you get back when its returned. Pick up in {nh}', priceRange: [1500, 2000] },
      { title: 'Pressure washer — weekend, {nh}', description: '2000 PSI. $50/weekend. Ill show you how to use it, its easy. Great for patios and driveways. I can deliver in {nh}', priceRange: [4000, 6000] },
      { title: 'Table saw — weekend, {nh}', description: '10-inch DeWalt. $75/weekend. You pick up and return. Please know what you are doing with this thing. Located near {street}', priceRange: [6000, 8000] },
    ],
  },
  {
    sub: 'cameras-gear',
    templates: [
      { title: 'Sony A7III — $75/day, {nh}', description: 'Full frame. 24-70mm lens, 2 batteries, charger, bag. Need to see ID. Pick up in {nh}. Treat it well', priceRange: [7500, 10000] },
      { title: 'GoPro — weekend rental, {nh}', description: 'Hero 12. All mounts. Waterproof. $30/weekend. Good for trips, surfing, content, whatever. Pick up near {street}', priceRange: [2500, 4000] },
    ],
  },
  {
    sub: 'party-supplies',
    templates: [
      { title: 'Tables + chairs rental — {nh}', description: '10 folding tables, 40 chairs. I deliver and pick up in {nh}. $50/day. Have tablecloths too if you need them', priceRange: [4000, 6000] },
      { title: 'PA system — speakers + mics, {nh}', description: '2 speakers, mixer, 2 mics. Good for block parties, events, presentations. $75/day. Pick up or I drop off in {nh}', priceRange: [6000, 10000] },
    ],
  },
  {
    sub: 'sports-equipment',
    templates: [
      { title: 'Kayak rental — weekend, {nh}', description: 'Tandem kayak, paddles, life jackets. Fits on a roof rack. $40/day. ID deposit. Pick up near {street}', priceRange: [3000, 5000] },
      { title: 'Camping gear — full set, {nh}', description: 'Tent that sleeps 4, 2 sleeping bags, camp stove, lantern. Everything you need for a weekend trip. $35/night. I pack it all in a bag for you', priceRange: [2500, 4000] },
    ],
  },
]

// ─── RESUMES — 10 templates ───

const RESUMES: SubcategoryTemplates[] = [
  {
    sub: 'software-engineering',
    templates: [
      { title: 'Full Stack Dev — 5 years', description: 'React, Node, TypeScript, Postgres, AWS. Built stuff from scratch to 100K users. Looking for hybrid or remote in NYC. Contract or full-time, either works', priceRange: [0, 0] },
      { title: 'Frontend Engineer — React/Next.js', description: '3 years. TypeScript. I care about performance and clean UI. Portfolio and GitHub on request. Looking for a mid-level role where I can grow', priceRange: [0, 0] },
      { title: 'Junior Dev — looking for first role', description: 'Bootcamp grad, been building projects for 6 months. JavaScript, React, Node. Im eager and I learn fast. Will work harder than anyone. NYC based', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'creative-media',
    templates: [
      { title: 'Graphic Designer — 7 years', description: 'Adobe, Figma, Sketch. Brand, social, print. Agency and in-house. I make things look good and I hit deadlines. Portfolio on request', priceRange: [0, 0] },
      { title: 'Video Editor — freelance', description: 'Premiere, DaVinci, After Effects. Commercials, docs, social content. 5 years. Fast turnaround. I dont miss deadlines', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'healthcare',
    templates: [
      { title: 'RN — 8 years, ICU', description: 'BSN, NY licensed. ICU and med-surg. Bilingual English/Spanish. Looking for hospital or clinic in NYC. I show up and I care', priceRange: [0, 0] },
      { title: 'CNA — looking for work', description: 'Certified, 3 years experience. Home care and nursing facility. Reliable, patient, compassionate. Available immediately. {nh} area preferred', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'trades-skilled-labor',
    templates: [
      { title: 'Master Electrician — 12 years', description: 'NYC master license. Residential and commercial. Panel upgrades, rewiring, inspections. Looking for a foreman or lead role. Tired of working for people who cut corners', priceRange: [0, 0] },
      { title: 'Experienced Carpenter', description: '10 years. Custom cabinetry, trim, built-ins. I do quality work and I have the portfolio to prove it. Looking for steady work with a good crew', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'admin-office',
    templates: [
      { title: 'Executive Assistant — finance, 6 years', description: 'Calendar, travel, expenses, event coordination. Excel and PowerPoint. Discreet and organized. I keep things running so you can focus. NYC preferred', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'food-hospitality',
    templates: [
      { title: 'Sous Chef — fine dining', description: '8 years in NYC kitchens including Michelin-starred. French training. Menu development. Looking for a chef de cuisine role where I can run things my way', priceRange: [0, 0] },
      { title: 'Bartender — 5 years', description: 'Craft cocktails, wine, beer. Fast service, good personality. Looking for a bar that actually cares about what they serve. Available nights and weekends', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'marketing-advertising',
    templates: [
      { title: 'Marketing Manager — B2B', description: '5 years. Content, demand gen, analytics. HubSpot, Google Ads, LinkedIn. Looking for a senior role. NYC or remote. I like data and I like results', priceRange: [0, 0] },
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
    description: varyText(fill(tmpl.description, vars)).slice(0, 2000),
    price,
    subcategory: subGroup.sub,
  }
}
