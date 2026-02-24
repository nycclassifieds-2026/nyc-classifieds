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
  personals: 22,
  housing: 16,
  jobs: 12,
  'for-sale': 10,
  services: 8,
  gigs: 7,
  community: 6,
  tickets: 5,
  pets: 5,
  barter: 3,
  rentals: 3,
  resumes: 3,
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
      { title: 'Blue jacket, L train — {nh}', description: 'You were reading Murakami on the L train heading into Manhattan. We made eye contact a few times and you smiled right before the doors opened at 1st Ave. I was in the gray hoodie sitting across from you. I know this is a total long shot but I havent stopped thinking about that smile since. If you see this and remember the guy who was clearly trying not to stare, say hi. I take that train every morning around 8:15', priceRange: [0, 0] },
      { title: 'Coffee shop — Saturday morning, {nh}', description: 'You ordered the oat milk latte with an extra shot. I had the Americano and was sitting by the window working on my laptop. We ended up talking about jazz for like 20 minutes — you mentioned you play saxophone and I was genuinely fascinated. Then my friend showed up and you left before I could get your name or number. The barista said you come in on Saturdays too. Im going to be there again this weekend, same spot by the window. Dark hair, green jacket, incredible taste in music', priceRange: [0, 0] },
      { title: 'Dog park — {nh}', description: 'We go to the same dog park almost every evening around 6. Your corgi is Biscuit and my mutt is the brown one who always tries to wrestle with him. We have talked a few times about the neighborhood and you mentioned you just moved to {nh} from somewhere out west. I wanted to ask if you wanted to grab a coffee sometime but I always chicken out when the moment comes. Im the one in the red jacket who always has treats in my pocket. If you see this just come say hi next time, I promise Im less awkward in real life', priceRange: [0, 0] },
      { title: 'Laundromat on {street} — Wednesday night', description: 'We were both doing laundry at the place on {street} around 9pm on Wednesday. You made that joke about how your socks never match no matter what you do, and I laughed way too hard because its the most relatable thing anyone has ever said to me. Curly hair, great smile, you were wearing those white sneakers. I was the one in the red high tops folding a ridiculous amount of sheets. I go there every Wednesday around the same time. Would love to continue the conversation about the missing sock conspiracy', priceRange: [0, 0] },
      { title: 'Bookstore in {nh} — poetry section', description: 'I was pretending to browse the fiction section but really I was watching you look through the poetry shelf at the bookstore on {street}. You picked up a Neruda collection and read a page out loud to yourself — probably didnt realize anyone heard but it was beautiful. I bought the same book after you left which is embarrassing to admit but here we are. You had on a brown corduroy jacket and were carrying a tote bag with some art on it. I know this is a reach but I go to that bookstore almost every weekend. Maybe ill actually say something next time instead of writing this', priceRange: [0, 0] },
      { title: '{train} train — Tuesday evening', description: 'Tuesday around 6pm on the {train}. It was packed and you gave me the last seat even though you looked tired too. You had your headphones on and were bobbing your head to something and I wanted so badly to ask what you were listening to. We both got off at the same stop and I watched you walk up the stairs and just... froze. I do not know what it is about you but I have been replaying that moment all week. If this finds you somehow, I owe you a seat and a conversation. Im the one who said thank you three times because I forgot I already said it', priceRange: [0, 0] },
      { title: 'Farmers market — Union Square, Saturday', description: 'We both reached for the same carton of peaches at the Union Square farmers market on Saturday morning and you laughed and said "great minds" or something like that. You had tattoo sleeves on both arms, sunglasses on your head, and a canvas bag. We talked for maybe 2 minutes about which peaches were better and then I got self conscious about holding up the line and walked away. I have been kicking myself ever since. I go every Saturday around 10am, usually start at the south end. If you remember the awkward peach person, come find me', priceRange: [0, 0] },
      { title: 'Bar on {street} — Friday night', description: 'Friday night at the bar on {street}. You were sitting by yourself reading a book and honestly that is the most attractive thing I have ever seen another human being do in public. We made eye contact a couple times and I was working up the nerve to come say something when my friends dragged me to another spot. You were wearing a vintage band tee — I think it was Talking Heads but I was too far away to be sure. This is a long shot but I had to try. I go there most Fridays and Im going to be braver next time I promise', priceRange: [0, 0] },
      { title: 'Grocery store — {nh}', description: 'You reached the top shelf for me at the grocery store near {street} and made a joke about how they put all the good stuff up high on purpose. We ended up talking in the checkout line for a few minutes and you mentioned you just moved to {nh} from out of state. You seemed really genuine and I kicked myself for not asking for your number. If you remember the short person who needed help reaching the pasta sauce and then talked your ear off about the neighborhood, that was me. Welcome to {nh} by the way — its a great place once you find your spots', priceRange: [0, 0] },
      { title: 'Running along the Hudson — orange shoes', description: 'We run the same route along the river almost every morning. You always wave when we pass each other going opposite directions around the same spot near the pier. Ive been wanting to stop and actually introduce myself for weeks but it feels weird to interrupt someones run. Im the one with the orange shoes — you probably noticed because they are aggressively bright. Maybe one day we could actually run together instead of just waving at each other like characters in a movie. I am usually out there by 7am', priceRange: [0, 0] },
      { title: 'Brooklyn Steel — last Thursday', description: 'We were standing next to each other during the opening act at Brooklyn Steel last Thursday. We started talking between sets about how the opener was actually better than the headliner and you agreed which told me everything I needed to know about you. You were wearing a denim jacket and had this incredible laugh. When the headliner started the crowd shifted and suddenly you were gone and I spent the rest of the show looking around like an idiot. If you remember the conversation about underrated bands with the person in the black hoodie, please reach out', priceRange: [0, 0] },
      { title: '{train} train — stuck underground 45 min', description: 'The {train} train stalled between stations for like 45 minutes last week and instead of being miserable you pulled out a bag of gummy bears and offered them to me and the person next to us. We talked the entire time about everything — where we grew up, favorite movies, that weird restaurant on {street}. It was the best subway delay I have ever experienced and thats saying something because Ive had some good ones. You got off one stop before me and I was too slow to ask for your number. Kicking myself. You had the green backpack and the best energy', priceRange: [0, 0] },
      { title: 'Gallery opening — {nh}', description: 'The gallery opening in {nh} last Friday. We were both standing in front of that abstract piece in the corner and you said something about it that completely changed how I saw it. The wine was terrible but the conversation was incredible. You mentioned you work in design and I said I was in education and we talked for maybe 20 minutes before someone pulled you away. I wish I had stayed longer instead of leaving when I did. If you remember discussing color theory with a stranger who was clearly out of their depth but very enthusiastic about it, that was me', priceRange: [0, 0] },
      { title: 'Pizza line — {nh}', description: 'We were both in line at the pizza place on {street} and somehow got into a full debate about the best pizza in NYC. You said Lucalis and I said Di Fara and you made such a convincing case that I actually went to Lucalis the next day and you were absolutely right. I owe you a slice. You were wearing a navy jacket and had a messenger bag. We talked for the whole wait but I didnt think to get your number before we sat at different tables. Biggest regret of my week and its been a rough week', priceRange: [0, 0] },
      { title: 'Bodega cat on {street}', description: 'We both stopped to pet the orange bodega cat on {street} at the same time and you said "this is the real NYC experience" with complete sincerity and I think about that moment like once a day which is probably not normal but here I am posting about it on the internet. You were wearing all black which doesnt narrow it down much in this city. We talked for a few minutes and you were funny and warm and then you said you had to go and that was it. The cat misses you. I also miss you. Mostly the cat though', priceRange: [0, 0] },
      { title: 'Gym on {street} — 6am every morning', description: 'We are on adjacent treadmills every single morning at the gym on {street} at 6am. I know your routine by now — you do 30 minutes then move to weights. I want to say something but you always have headphones in and I dont want to be that person who bothers someone at the gym. Im the one who never has a water bottle and has to use the fountain every 10 minutes like a rookie. If you ever want a workout partner or just someone to complain about early mornings with, take one headphone out and give me a signal', priceRange: [0, 0] },
      { title: 'Rooftop bar — sunset, {nh}', description: 'The rooftop bar in {nh} a couple Saturdays ago. The sunset was insane and you asked me to take your photo with it in the background. I said something dumb while taking it and you laughed anyway which was generous of you. Gold hoops, all black outfit, incredible smile. I handed your phone back and my brain just completely shut down instead of saying something smooth like a normal human. My friends still make fun of me for fumbling that moment. If you want that photo retaken by someone who has had time to prepare a better joke, Im available', priceRange: [0, 0] },
      { title: 'Governors Island ferry', description: 'On the ferry to Governors Island last weekend. You were sitting on the bench across from me sketching something in a notebook and I tried to peek without being obvious. It was incredible — some kind of cityscape. You caught me looking and instead of being weirded out you showed me the whole sketchbook. We talked about art and the city for the entire ride over but when we got off the boat I lost you in the crowd. I have been going back to that ferry every weekend hoping to run into you again. Plaid shirt, pencil behind your ear', priceRange: [0, 0] },
      { title: 'Halal cart on {street}', description: 'We were both standing at the halal cart on {street} around midnight waiting for our food and you made some joke about the hot sauce that had me cracking up. We talked for a few minutes about living in {nh} and you mentioned you work nights somewhere nearby. You were wearing a purple jacket and had the best deadpan humor. I laughed, you left, and I stood there holding my lamb over rice regretting not saying more. I am at that cart way too often so if you see someone ordering extra white sauce and looking around hopefully, its me', priceRange: [0, 0] },
      { title: 'Prospect Park — Sunday morning bench', description: 'We were both sitting on the same bench in Prospect Park Sunday morning reading. I was reading {book} and you asked me if it was good. We ended up talking for maybe 15 minutes about books and the city and how Sunday mornings in the park are the only thing keeping us sane. Then your friend called and you had to leave and I sat there for another hour reading the same page over and over because I couldnt concentrate. I go to that bench almost every Sunday around 10. Brown jacket, glasses, and a strong opinion about Murakami', priceRange: [0, 0] },
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
      { title: 'Rent-stabilized 1BR — {nh}', description: 'Rent-stabilized one bedroom well below market rate. Heat and hot water included in rent. The super actually lives in the building and responds the same day which in NYC is basically a miracle. Located near {street} with easy access to the {train}. Apartment is in good shape — hardwood floors, decent closet space, kitchen was updated a few years ago. Dont sleep on this one, rent stabilized units in {nh} go fast', priceRange: [140000, 180000] },
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
      { title: 'Indoor parking — {nh}', description: 'Covered indoor garage spot near {street} in {nh}. 24/7 access with a key card, security cameras throughout. Fits a sedan or small SUV comfortably. The garage is clean and well-lit, not one of those sketchy basement situations. If you have a car in NYC you know how valuable a guaranteed spot is — no more circling the block for 45 minutes or getting tickets from alternate side parking', priceRange: [25000, 45000] },
      { title: 'Storage unit — {nh}', description: '5x10 storage unit in {nh}, climate controlled so your stuff wont get ruined by humidity or temperature swings. The facility is clean, well-maintained, and has security cameras. Access hours are 7am to 10pm which covers most situations. Month to month lease so no long term commitment required. Great for seasonal stuff, extra furniture, business inventory, whatever you need to store. Located near {street}', priceRange: [15000, 25000] },
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
      { title: 'HVAC Tech — commercial', description: '$30-45/hr depending on experience. Must be EPA certified. We do commercial HVAC — office buildings, restaurants, retail spaces across NYC. Company vehicle provided so you dont need your own. Benefits kick in after 90 days including health insurance and paid time off. Steady work year round, summers are especially busy. Looking for someone who can troubleshoot on their own and communicates well with building managers. {nh} area base', priceRange: [0, 0] },
      { title: 'Carpenter — custom work', description: '$28-40/hr. Custom closets, shelving, trim. Quality over speed. Need references or portfolio. {nh}', priceRange: [0, 0] },
      { title: 'Painter — residential', description: '$25-35/hr. Interior/exterior. Must be clean and careful. We do high end apartments where you cant have drips or tape lines showing', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'healthcare',
    templates: [
      { title: 'Home Health Aide — {nh}', description: '$17-20/hr depending on experience. Must have PCA or HHA certification. We help seniors in {nh} stay independent in their homes — meal prep, medication reminders, light housekeeping, companionship. Flexible schedule, you can work as many or as few hours as you want. Our clients are wonderful people who just need a little extra help. This is genuinely rewarding work if you have patience and a good heart', priceRange: [0, 0] },
      { title: 'Medical Assistant — {nh}', description: '$18-22/hr. Bilingual preferred but not required. Vitals, intake, EHR. Friendly clinic. Benefits', priceRange: [0, 0] },
      { title: 'Dental Hygienist — {nh}', description: '$45-55/hr at a private practice in {nh}. Our patients are great — mostly long-term regulars who actually take care of their teeth. Modern equipment, digital X-rays, the good stuff. Schedule is 4 days a week with no weekends which is rare in dental and something we plan to keep. Small office, friendly team, the kind of place where people stay for years. Looking for someone with at least 2 years experience who is personable and thorough', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'retail',
    templates: [
      { title: 'Retail Associate — {nh}', description: '$16-18/hr with both part-time and full-time positions available. Employee discount on everything in the store. We are a small independently owned shop in {nh} near {street} and we genuinely care about the customer experience. If you actually enjoy helping people find what they need and can hold a conversation without staring at your phone, we want to talk to you. No retail experience needed as long as you are reliable and friendly. Flexible scheduling for students', priceRange: [0, 0] },
      { title: 'Store Manager — {nh}', description: '$50-60K salary for an experienced store manager at our location in {nh}. Need someone with at least 2 years of retail management experience who can handle inventory, staff scheduling, visual merchandising, and customer experience. We are a growing brand with a loyal customer base and we need someone who can keep the day-to-day running smoothly while we focus on expansion. This is a real leadership role, not just a glorified cashier position. Health insurance and bonus structure available', priceRange: [0, 0] },
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
      { title: 'Dining table — solid wood, seats 6', description: 'Solid wood dining table that comfortably seats 6, bought it from a furniture shop in Brooklyn a few years ago. Real hardwood, not veneer — you can tell by the weight of this thing. There are some surface scratches from normal use but structurally its in great shape. Selling because Im moving and it wont fit in my new apartment. You would need to haul it yourself, its heavy so bring a friend. Cash or Venmo. Located near {street} in {nh}', priceRange: [10000, 25000] },
      { title: 'Couch — Article, great condition', description: 'Article Sven couch in charcoal, seats 3 comfortably. Bought it 2 years ago and its in excellent condition — no stains, no pet damage, cushions still have their shape. I would keep it if it fit through the door of my new apartment but it does not so here we are. This couch retailed for over $1,500 and you are getting it for a fraction of that. Its genuinely comfortable, the kind where guests fall asleep watching a movie. Pick up in {nh} near {street}', priceRange: [30000, 60000] },
      { title: 'IKEA Kallax 4x4 — white', description: 'Assembled. Moving. Great for books/vinyl. You disassemble and haul. Its heavy fair warning', priceRange: [4000, 8000] },
      { title: 'Queen bed frame + headboard', description: 'Platform frame. No box spring needed. No squeaks. Mattress not included. Pick up this weekend', priceRange: [12000, 25000] },
      { title: 'Standing desk — electric', description: 'Uplift V2. Dual motors. Bamboo top. Goes from 25 to 50 inches. Going back to the office so I dont need it anymore. Barely used', priceRange: [20000, 35000] },
      { title: 'Recliner — real leather', description: 'La-Z-Boy. Dark brown. Moving and it wont fit through the new door. I am genuinely sad about this. Pick up on {street}', priceRange: [15000, 30000] },
      { title: 'Dresser — 6 drawer', description: 'Six drawer dresser in decent shape. Nothing fancy or designer but its solid — all the drawers open and close smoothly, no broken handles, no wobble. Dark wood finish with some minor scuffs on the top from years of use but nothing major. This is the kind of functional furniture that just works and will last you a long time. You pick up from my building near {street} in {nh}, elevator in the building so getting it downstairs is easy', priceRange: [5000, 12000] },
      { title: 'Couch — FREE if you pick up today', description: 'Gray. Functional. Has some wear but its comfortable. Moving tomorrow and I am literally begging someone to take this thing. {street}', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'electronics',
    templates: [
      { title: 'MacBook Pro M2 — 16GB', description: 'Battery 98%. AppleCare until 2027. Always had a case. Upgrading to M4. Comes with charger and box', priceRange: [90000, 130000] },
      { title: 'PS5 + 2 controllers', description: 'PlayStation 5 disc edition with 2 wireless DualSense controllers. Works perfectly, no issues at all. Comes with 3 games and the original box with all cables. Im selling because I just dont have time to game anymore and its been collecting dust for months. Rather it go to someone who will actually enjoy it. Firmware is up to date. Can meet in {nh} or near the {train}', priceRange: [30000, 45000] },
      { title: 'Samsung 55" 4K TV', description: 'Samsung 55 inch 4K Smart TV, only used for about a year. Picture quality is excellent — bright colors, great contrast, no dead pixels or burn-in. Comes with either a wall mount or the original stand, your choice. Remote included. Smart TV apps all work smoothly. Selling because I upgraded to a bigger screen for my new apartment. You pick up in {nh}, bring a friend because its awkward to carry alone. Ill help you get it to the elevator', priceRange: [20000, 35000] },
      { title: 'iPhone 14 Pro — unlocked', description: 'iPhone 14 Pro, 256GB, Midnight Purple, factory unlocked so it works with any carrier. Had a case and screen protector on it from day one so there are zero scratches anywhere. Battery health is at 91% which is great for its age. Face ID, all cameras, speakers, everything works perfectly. Selling because I upgraded to the 16 and dont need two phones. Comes with a charging cable. Can do the exchange in {nh} — happy to let you test everything before you buy', priceRange: [50000, 75000] },
      { title: 'Sony XM5 headphones', description: '6 months old. Got AirPods Max as a gift so selling these. Original case and box. Best noise cancelling headphones that exist', priceRange: [18000, 28000] },
      { title: 'iPad Air 5th gen', description: 'WiFi 256GB. Apple Pencil included. Used for drawing mostly. No scratches. Getting a laptop instead', priceRange: [35000, 50000] },
    ],
  },
  {
    sub: 'bikes',
    templates: [
      { title: 'Trek FX3 hybrid', description: 'Carbon fork, hydraulic disc brakes, Shimano groupset. Ridden one season for commuting and weekend rides, maybe 500 miles total. Fits 5\'8" to 6\'0". Recently tuned up — new brake pads, cables, chain all in great shape. Selling because Im upgrading to a road bike. This thing is perfect for city riding, handles potholes like a champ and the disc brakes are a lifesaver in the rain. Comes with lights and a bottle cage', priceRange: [35000, 55000] },
      { title: 'Brompton folding bike', description: '6 speed Brompton, folds down in about 20 seconds flat. I used this for commuting from {nh} to midtown and it is genuinely the best commuter solution in NYC — take it on the subway, fold it under your desk, never worry about locking it outside. Includes the Brompton carry bag. Selling because I switched jobs and dont commute anymore. Everything works perfectly, recently serviced at a Brompton dealer', priceRange: [100000, 150000] },
      { title: 'E-bike — 500W motor', description: 'Electric bike with a 500W rear hub motor. Tops out at 28mph and gets about 40 miles on a full charge depending on how much you pedal. Battery is removable so you can charge it in your apartment without hauling the whole bike upstairs. Used it for deliveries for a few months but I got a car now so it just sits in my hallway. Everything works, brakes are good, tires have plenty of tread left. Charger included obviously', priceRange: [60000, 100000] },
      { title: 'Fixed gear — matte black', description: '52cm frame, matte black, flip flop hub so you can ride fixed or freewheel. Just put on a new chain and fresh tires last month. Comes with a Kryptonite U-lock that alone is worth like $60. Great city bike — light, fast, low maintenance. Selling because I moved to a place with no bike storage. Can meet anywhere near the {train} to test ride it', priceRange: [20000, 35000] },
      { title: 'Road bike — needs work', description: 'This is a project bike for someone who likes tinkering. The frame is solid aluminum, good geometry, no dents or cracks. Brakes work fine but the gears dont shift great — probably needs a new derailleur cable and maybe an adjustment. I just dont have the time or tools to deal with it right now. Selling cheap because I know it needs love. If you know what youre doing you could have a really nice bike for not a lot of money', priceRange: [8000, 18000] },
    ],
  },
  {
    sub: 'clothing-accessories',
    templates: [
      { title: 'North Face puffer — M', description: '700 fill down. Black. No rips, no stains, zipper works perfectly. I bought a longer coat for this winter so I dont need two. Kept in good shape, always hung up never balled up in a closet. Fits true to size medium. Warm enough for the worst NYC winters. Can meet near {street} or anywhere in {nh}', priceRange: [8000, 15000] },
      { title: 'Vintage Levis 501s — 32x32', description: 'Actual vintage not repro — picked these up at a thrift store in {nh} years ago. The fade is perfect, that natural worn-in look you cant get from new jeans no matter how much they charge you. They dont fit me anymore and I am in deep denial about it but its time to let them go to someone who will appreciate them. No holes, no weird stains, just beautifully broken in denim', priceRange: [5000, 10000] },
      { title: 'Nike AF1 — size 10 DS', description: 'White on white Air Force 1s. Deadstock, never worn, never even tried on. Still in the original box with the receipt. Got these as a gift but they are a half size too small and I waited too long to return them. Perfect condition, tissue paper still inside. Can meet anywhere in {nh} or ship if you cover it', priceRange: [8000, 13000] },
      { title: 'Canada Goose — size L', description: 'Expedition parka, size large. Worn two winters and this coat literally kept me alive during those polar vortex weeks. Minor wear on the cuffs from normal use but I had it professionally cleaned last month and it looks great. Down is still fully puffed, zipper smooth, fur trim in good shape. Selling because Im moving somewhere warmer. You will not regret this purchase when February hits', priceRange: [35000, 55000] },
      { title: 'Timbs — size 11', description: 'Classic wheat Timberland boots, size 11. Worn one winter and waterproofed before I ever wore them outside. No scuffs, no salt stains, soles barely worn. They still look almost new honestly. Just have too many boots at this point and need to clear some space. These are the real deal, NYC staple. Can meet in {nh} or near the {train}', priceRange: [7000, 12000] },
    ],
  },
  {
    sub: 'free-stuff',
    templates: [
      { title: 'FREE couch — {nh}', description: 'Gray sectional couch, free to whoever wants it. Has some wear on the cushions from years of movie marathons but its genuinely comfortable and has plenty of life left. I am moving out of my apartment in {nh} and need it gone by Saturday or its going to the curb. You haul it, bring at least one other person because its big. Please take this couch, I am literally begging. Its on the third floor but the stairway is wide', priceRange: [0, 0] },
      { title: 'Moving boxes — FREE, {nh}', description: 'About 30 moving boxes in all sizes — small, medium, large, wardrobe boxes — plus a ton of packing paper and bubble wrap. Just finished unpacking and I hate to throw all this away when someone could use it. Everything is outside my building on {street} in {nh}. First come first served, grab what you need. If nobody takes them by tonight they are going in the recycling. Save some money on your move', priceRange: [0, 0] },
      { title: 'Books — 3 boxes, {nh}', description: 'Three full boxes of books that need a new home. Mix of fiction, cookbooks, memoirs, random nonfiction — some great stuff in there. Im downsizing and I cannot fit another bookshelf in this apartment. They will be on my stoop Saturday morning starting at 8am on {street} in {nh}. Take whatever you want, leave whatever you dont. If its raining Ill put them under the awning. Please come, these books deserve better than a recycling bin', priceRange: [0, 0] },
      { title: 'Plants — rehoming, {nh}', description: 'I have 8 plants that need new homes. A 4-foot monstera that is my pride and joy, two golden pothos, a snake plant, a spider plant, a rubber tree, and a couple of others. I am moving to a place with no natural light and I refuse to watch them die. Please take one or take all of them, just promise me you will give them a window and water them. Pots included. Near {street} in {nh}. They are beautiful and I am emotional about this', priceRange: [0, 0] },
      { title: 'FREE desk — {nh}', description: 'IKEA desk in good condition, completely free. Nothing wrong with it at all, I just bought a standing desk and this one needs to go. Its the standard size one — fits a monitor, keyboard, and some notebooks comfortably. You pick up from my building on {street} in {nh}. Fair warning its heavier than you think IKEA furniture should be. Elevator in the building so getting it down is manageable. Please take it so I dont have to figure out how to dispose of it', priceRange: [0, 0] },
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
      { title: 'Jordan 4 Bred — sz 10 DS', description: 'Jordan 4 Bred Reimagined, size 10, completely deadstock. Never tried on, never taken out of the box except to photograph. SNKRS receipt available for verification. Double boxed for shipping if you want them sent, or happy to meet in {nh} for an in-person exchange so you can inspect them yourself. Price is firm — these are going for more than this on StockX right now. Serious buyers only please, I am not entertaining lowball offers', priceRange: [22000, 30000] },
      { title: 'New Balance 990v6 — sz 10.5', description: 'New Balance 990v6 Made in USA, gray colorway, size 10.5. Wore them twice and realized they are too narrow for my wide feet which is heartbreaking because these are the most comfortable shoes I have ever put on. Box and extra laces included. They look basically brand new — no scuffs, no creasing, soles are pristine. If you have normal-width feet these are the best sneakers money can buy and Im selling them for well under retail', priceRange: [14000, 20000] },
      { title: 'Supreme bogo hoodie — M', description: 'Supreme box logo hoodie, FW24, black on black, size medium. Tried on once to check the fit and put it right back in the bag. Receipt in hand, can verify authenticity however you want. These sold out in seconds and resale is significantly higher than what Im asking. Can meet in Manhattan to do the exchange in person. Do not lowball me, the price is based on current market value and Im already being generous', priceRange: [35000, 50000] },
      { title: 'Dunks — sz 9, worn once', description: 'Nike Dunk Low Panda colorway, size 9. Wore them once to dinner and decided the silhouette just isnt for me — Im more of a New Balance person apparently. No creases, no scuffs, the soles look like I walked maybe 200 steps in them. Comes with the box. Price is firm at $90 which is below what people are selling used pairs for. Can meet anywhere in {nh} or near the {train} station', priceRange: [7000, 11000] },
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
      { title: 'Brooklyn Steel — SOLD OUT, 2 tix', description: 'Two general admission tickets to the sold out show at Brooklyn Steel. These were for me and my partner but something came up and we genuinely cant make it. Selling at face value because I am not a scalper, just someone who doesnt want good tickets to go to waste. Can transfer through the app immediately or meet in person near {nh}. This is going to be an incredible show, the venue is one of the best in the city for sound', priceRange: [5000, 12000] },
      { title: 'Radio City — 4 tickets together', description: 'Orchestra center. Family thing came up and we cant make it. Selling all 4 below what I paid. Will transfer right away', priceRange: [12000, 25000] },
      { title: 'Bowery Ballroom — Friday, 2 tix', description: 'Sold out show at Bowery Ballroom this Friday night. Two GA tickets, selling at exactly what I paid. If you havent been to the Bowery Ballroom its honestly the best small venue in the city — great sight lines from anywhere and the sound is always perfect. I bought these months ago but have a schedule conflict I cant move. DM me and Ill tell you the artist and transfer right away. Dont miss this one', priceRange: [4000, 8000] },
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

// ─── COMMUNITY — 30 templates ───

const COMMUNITY: SubcategoryTemplates[] = [
  {
    sub: 'events',
    templates: [
      { title: 'Block party — {street}, Saturday', description: 'Annual block party on {street} this Saturday from 2pm to 8pm. Live music, food from local restaurants, face painting for the kids, and a bounce house. Everyone in {nh} is welcome. We have been doing this for 6 years now and it gets bigger every time. Bring a lawn chair if you want to hang out. No cars allowed on the block starting at noon. Come meet your neighbors or just enjoy the food', priceRange: [0, 0] },
      { title: 'Free outdoor movie — {nh} park', description: 'Free outdoor movie screening in the park near {street} this Friday at sunset. Bring a blanket and snacks. We are showing a classic NYC film. This is a neighborhood thing, not a corporate sponsored event — just a group of us who bought a projector and thought it would be fun. Been doing it monthly all summer. Family friendly. Dogs welcome if they dont bark at the screen', priceRange: [0, 0] },
      { title: 'Stoop sale — {street}, Sunday', description: 'Cleaning out our apartment and putting everything on the stoop Sunday morning starting at 9am. Furniture, kitchen stuff, clothes, books, vinyl records, random things accumulated over 8 years in this apartment. Everything priced to sell or honestly just take it. Near {street} in {nh}. Come early for the good stuff, by afternoon whatever is left goes free', priceRange: [0, 0] },
      { title: 'Neighborhood cleanup — {nh}', description: 'Organizing a neighborhood cleanup this Saturday morning in {nh}. Meeting at {street} at 9am. We will provide garbage bags, gloves, and grabbers. Last time we had about 20 people and filled 40 bags in 3 hours. Coffee and bagels for everyone who shows up. This neighborhood deserves to look as good as the people in it. All ages welcome, kids love it honestly', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'local-alerts',
    templates: [
      { title: 'Package thieves — {street} area', description: 'Heads up to everyone near {street} in {nh}. Someone has been stealing packages from front stoops in the last week. At least 3 people on my block have had deliveries taken. If you have a camera pointed at the street please check your footage from Tuesday afternoon around 3pm. Already filed a police report. In the meantime, ship to your job or have a neighbor grab your packages. Stay aware out there', priceRange: [0, 0] },
      { title: 'Water main work — {street}', description: 'DEP is doing water main work on {street} between the cross streets near {nh}. Expect reduced water pressure for the next few days and possible discoloration — run your cold water for a minute before drinking. Street parking will be affected too, they have cones up. Asked the crew and they said it should be done by end of next week. Just wanted to give a heads up since the city notice was basically unreadable', priceRange: [0, 0] },
      { title: 'Car break-ins — {nh}', description: 'There have been several car break-ins around {nh} in the last two weeks, mostly on the side streets near {street}. They are smashing windows and grabbing whatever is visible — backpacks, electronics, shopping bags. Please dont leave anything in your car. Even an empty bag can look like a target. I have already reported it to the local precinct. If you see anything suspicious please call it in. Lets look out for each other', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'lost-found',
    templates: [
      { title: 'FOUND — set of keys near {street}', description: 'Found a set of keys on the sidewalk near {street} in {nh}. Has about 6 keys on a keyring with a small blue carabiner and what looks like a gym membership tag. I left them with the bodega on the corner in case the owner retraces their steps. If these are yours, DM me and describe the keychain and Ill tell you exactly where they are. Hopefully this reaches you before you have to change all your locks', priceRange: [0, 0] },
      { title: 'LOST — wallet, {nh} area', description: 'Lost my wallet somewhere in {nh} yesterday afternoon, probably between {street} and the {train} station. Black leather billfold with my ID, 2 credit cards, and some cash. Already cancelled the cards but the ID is a pain to replace. If you found it please reach out — you can keep the cash honestly I just want the wallet and ID back. Reward for anyone who returns it. I know its a long shot but this neighborhood has good people', priceRange: [0, 0] },
      { title: 'FOUND — phone on {train} train', description: 'Found a phone on the {train} train this morning, looks like it fell out of someones pocket. Its locked but I can see notifications coming in so its definitely someones daily phone. I turned it in to the MTA booth at the station near {street}. If you lost your phone on the {train} this morning around 8am, go check with them. Spread the word because someone is probably panicking right now', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'volunteers',
    templates: [
      { title: 'Food pantry needs volunteers — {nh}', description: 'Our food pantry in {nh} near {street} needs volunteers for Saturday morning distribution shifts. We serve about 200 families every week and we are stretched thin right now. No experience needed — you will be sorting, packing, and distributing food. Shifts are 8am to 12pm. Even one Saturday a month would make a huge difference. This is real community work, the families who come through are our neighbors and they are grateful', priceRange: [0, 0] },
      { title: 'Tutoring volunteers — after school, {nh}', description: 'Looking for volunteers to help with our free after-school tutoring program at the community center near {street}. We need help with math, reading, and science for kids grades 3 through 8. Tuesdays and Thursdays from 3:30 to 5:30pm. You do not need to be a teacher, just patient and willing to help. These kids are smart and motivated, they just need a little extra support. Background check required', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'groups',
    templates: [
      { title: 'Running club — {nh}', description: 'Free running club meeting every Saturday at 8am near {street} in {nh}. All paces welcome, we have groups doing 3 miles and groups doing 8. We run, we grab coffee after, we complain about our weeks. Its become a real community thing with about 30 regulars. No signup, no fees, just show up with sneakers on. We run rain or shine because we are unhinged and we love it', priceRange: [0, 0] },
      { title: 'Book club — {nh}, new members welcome', description: 'Our {nh} book club meets once a month at a cafe near {street}. We read a mix of contemporary fiction, nonfiction, and the occasional classic. Currently about 12 members but we have room for more. The vibe is relaxed — we discuss the book for about an hour then just hang out. No pressure to finish every book, life happens. Next meeting is in two weeks, DM me for the title and location. All are welcome', priceRange: [0, 0] },
      { title: 'Parents group — {nh}', description: 'Informal parents group for families in {nh} with kids under 5. We do playground meetups on weekends, occasional coffee mornings, and keep a group chat going for recommendations, hand-me-downs, and general parent support. About 15 families involved right now, always welcoming new members. The kids play, the adults get to have a conversation that isnt about Bluey. Near {street}', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'neighborhood-questions',
    templates: [
      { title: 'Just moved to {nh} — what should I know?', description: 'Just moved to {nh} from {city} last week. Apartment is near {street} and I am still figuring everything out. Where do people get groceries? Best coffee? Any restaurants I need to try immediately? How is the parking situation? What about the laundromat? Any local Facebook groups or community boards I should join? I want to be a good neighbor and actually participate in the community, not just live here. Any tips appreciated, even the obvious ones', priceRange: [0, 0] },
      { title: 'Best school options near {nh}?', description: 'We have a kid starting kindergarten next fall and we live near {street} in {nh}. Trying to figure out the school situation — public, charter, private, the whole landscape. If you have kids in school nearby I would love to hear your experience. What did you choose and why? How are the after-school programs? Is there anything you wish you knew before enrollment? This process is overwhelming and I trust real parent opinions over online ratings', priceRange: [0, 0] },
    ],
  },
  {
    sub: 'recommendations',
    templates: [
      { title: 'Best laundromat in {nh}', description: 'After trying 4 different laundromats in {nh} I finally found the one. The place on {street} has machines that actually work, its clean, the attendant is friendly, and the drop-off service is $1.10 per pound with a 24 hour turnaround. I have been going for 3 months now and have never had an issue. Compared to the nightmare spots with broken machines and mystery smells, this place is a revelation. Putting this here so other people in {nh} dont waste time like I did', priceRange: [0, 0] },
      { title: 'Incredible tailor near {street}', description: 'Found an amazing tailor on {street} in {nh} and I need everyone to know about them. Hemmed two pairs of pants, took in a jacket, and fixed a zipper on my favorite bag — all for less than $40 total. The work is meticulous, everything fits perfectly, and it was ready in 3 days. They have been there for over 20 years apparently and I cannot believe I didnt know about them until now. Support local — this person is a craftsman', priceRange: [0, 0] },
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
  community: COMMUNITY,
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
    description: varyText(fill(tmpl.description, vars)).slice(0, 4000),
    price,
    subcategory: subGroup.sub,
  }
}
