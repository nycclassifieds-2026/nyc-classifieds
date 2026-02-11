/**
 * Seed templates for automated content generation.
 * Extracted from scripts/seed-platform.mjs for use by the cron seed engine.
 */

// ─── Helpers ───
export function pick<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)]
}

export function pickN<T>(a: T[], n: number): T[] {
  return [...a].sort(() => Math.random() - 0.5).slice(0, n)
}

export function rb(a: number, b: number): number {
  return a + Math.floor(Math.random() * (b - a + 1))
}

export function nhName(s: string): string {
  return s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function fill(s: string, v: Record<string, string>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => v[k] || k)
}

// ─── Geography ───

export const BOROUGHS: Record<string, { lat: number; lng: number; nhs: string[] }> = {
  manhattan: {
    lat: 40.7831, lng: -73.9712,
    nhs: ['alphabet-city','battery-park-city','carnegie-hill','chelsea','chinatown','east-harlem','east-village','financial-district','flatiron','gramercy','greenwich-village','hamilton-heights','harlem','hells-kitchen','hudson-yards','inwood','kips-bay','koreatown','lenox-hill','lincoln-square','little-italy','lower-east-side','manhattan-valley','meatpacking-district','midtown-east','midtown-west','morningside-heights','murray-hill','noho','nolita','roosevelt-island','soho','stuyvesant-town','sugar-hill','times-square','tribeca','two-bridges','upper-east-side','upper-west-side','washington-heights','west-village'],
  },
  brooklyn: {
    lat: 40.6782, lng: -73.9442,
    nhs: ['bay-ridge','bed-stuy','bensonhurst','boerum-hill','borough-park','brighton-beach','brooklyn-heights','brownsville','bushwick','canarsie','carroll-gardens','clinton-hill','cobble-hill','coney-island','crown-heights','downtown-brooklyn','dumbo','dyker-heights','east-new-york','flatbush','fort-greene','greenpoint','kensington','midwood','park-slope','prospect-heights','red-hook','sheepshead-bay','sunset-park','williamsburg'],
  },
  queens: {
    lat: 40.7282, lng: -73.7949,
    nhs: ['astoria','bayside','bellerose','briarwood','college-point','corona','douglaston','elmhurst','far-rockaway','flushing','forest-hills','fresh-meadows','glen-oaks','howard-beach','jackson-heights','jamaica','kew-gardens','little-neck','long-island-city','maspeth','middle-village','ozone-park','rego-park','ridgewood','rockaway-beach','st-albans','sunnyside','whitestone','woodhaven','woodside'],
  },
  bronx: {
    lat: 40.8448, lng: -73.8648,
    nhs: ['belmont','concourse','fordham','highbridge','hunts-point','kingsbridge','morris-park','mott-haven','norwood','pelham-bay','riverdale','south-bronx','throgs-neck','tremont','wakefield'],
  },
  'staten-island': {
    lat: 40.5795, lng: -74.1502,
    nhs: ['annadale','eltingville','great-kills','huguenot','new-dorp','princes-bay','st-george','stapleton','tompkinsville','tottenville'],
  },
}

/** Weighted borough distribution for post generation */
export const BOROUGH_WEIGHTS = [
  ...Array(35).fill('manhattan'),
  ...Array(30).fill('brooklyn'),
  ...Array(20).fill('queens'),
  ...Array(10).fill('bronx'),
  ...Array(5).fill('staten-island'),
] as string[]

// ─── Demographics ───

export const NAMES: Record<string, { first: string[]; last: string[] }> = {
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

export const DEMO_WEIGHTS = [
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
] as string[]

// ─── Reference data ───

export const STREETS = ['1st Ave','2nd Ave','3rd Ave','Broadway','Lexington Ave','Madison Ave','Park Ave','Amsterdam Ave','Columbus Ave','5th Ave','6th Ave','7th Ave','8th Ave','Atlantic Ave','Flatbush Ave','DeKalb Ave','Myrtle Ave','Bedford Ave','Grand St','Delancey St','Houston St','Bleecker St','14th St','23rd St','34th St','42nd St','57th St','72nd St','86th St','96th St','110th St','125th St','145th St','Fordham Rd','Tremont Ave','Jerome Ave','Ditmars Blvd','Steinway St','Jamaica Ave','Hillside Ave','Metropolitan Ave','Vernon Blvd','Queens Blvd','Northern Blvd','Roosevelt Ave','Victory Blvd','Bay St','Hylan Blvd']

export const PLACES = ['Joes','Corner Spot','La Esquina','The Local','Golden Dragon','Noodle House','Cafe Roma','Taqueria Mexico','Pho Saigon','Sushi Palace','The Bean','Green Leaf','Mamas Kitchen','The Bodega','Blue Moon','Red Hook Coffee','Sunset Diner','Brooklyn Bagels','Astoria Bites','Harlem Soul','The Halal Cart','Dumpling House','Empanada Mama','Peking Duck House','Russ & Daughters']

export const CITIES = ['Boston','Chicago','LA','Miami','Philly','DC','Atlanta','Portland','Denver','Seattle','Austin','San Francisco','Dallas','Minneapolis','Nashville','Detroit','Charlotte','New Orleans','Pittsburgh','Baltimore']

export const HOBBIES = ['hiking','cooking','photography','running','reading','cycling','yoga','climbing','music','gaming','art','basketball','soccer','film','writing','coding','gardening','chess','dancing','boxing']

export const MOVIES = ['Do The Right Thing','Goodfellas','The Warriors','Saturday Night Fever','Coming to America','Spider-Man Into the Spider-Verse','West Side Story','Taxi Driver','Ghostbusters','King Kong','Moonstruck','The French Connection']

export const BOOKS = ['A Tree Grows in Brooklyn','The Great Gatsby','Invisible Man','The Goldfinch','Motherless Brooklyn','Americanah','Open City','Bonfire of the Vanities','A Visit from the Goon Squad','Oscar Wao']

export const TRAINS = ['A','C','E','B','D','F','M','N','Q','R','W','1','2','3','4','5','6','7','G','J','Z','L']

// ─── Porch templates ───

interface PorchTemplate { t: string; b: string }

export const PORCH: Record<string, PorchTemplate[]> = {
  recommendation: [
    { t: 'Best pizza in {nh} — hands down', b: 'If you havent tried {place} on {street} you are missing out. Their margherita is perfect. Thin crust, fresh mozz, basil from their garden. Cash only.' },
    { t: 'Amazing dentist in {nh}', b: 'Dr. {last} on {street} is incredible. No wait, gentle, takes most insurance. My whole family goes there now.' },
    { t: 'Great daycare in {nh}', b: 'Little Stars on {street} has been amazing for our toddler. Clean, structured, and the staff genuinely care. Waitlist is worth it but so so worth the wait. Teachers send daily photos and my kid lights up every morning.' },
    { t: 'Best coffee shop for remote work in {nh}', b: 'The cafe on {street} has great wifi, outlets everywhere, and they dont rush you. Oat milk latte is incredible.' },
    { t: 'Tailor recommendation — {nh}', b: '{last} Tailoring on {street}. Hemmed my pants perfectly for $12. Quick turnaround, fair prices, been there 20 years.' },
    { t: '{place} on {street} is ELITE', b: 'ngl the food at {place} is unmatched rn. went three times this week already. if u havent been ur literally sleeping on the best spot in {nh}' },
    { t: 'Best bodega breakfast in {nh}', b: 'The bodega on {street} makes a bacon egg and cheese that changed my life. Fresh roll, perfect egg. $5. No cap.' },
    { t: 'Shoutout to {place} in {nh}', b: 'Been going here for years and they never disappoint. Staff remembers your order. This is what makes NYC special.' },
    { t: 'Best dumplings near {nh}', b: '{place} on {street}. 8 dumplings for $3.50. Pork and chive. Get the spicy sauce. Thank me later.' },
    { t: 'Locksmith saved me — {nh}', b: 'Locked out at midnight. {last} Locksmith came in 20 minutes, $60, no BS upcharge. Saving their number forever.' },
    { t: 'Great vet in {nh}', b: 'Dr. {last} at {street} Animal Hospital. Gentle with my anxious dog, transparent pricing, took the time to explain everything.' },
    { t: 'yall NEED to try {place}', b: 'bro i just had the best meal of my entire life at {place} on {street}. im not even exaggerating rn. the portions are crazy and its mad cheap. {nh} is blessed fr fr' },
    { t: 'I want to share a wonderful find in {nh}', b: 'After 40 years in this neighborhood, I thought I knew every shop on {street}. But {place} just opened and the quality is outstanding. The owner is a lovely young person who clearly takes pride in their work. Highly recommend paying them a visit.' },
    { t: '{place} is that girl', b: 'ok so {place} on {street} just became my entire personality. the vibes are immaculate, the staff is so chill, and everything is reasonably priced?? in THIS economy?? {nh} stay winning' },
    { t: 'Professional recommendation: {place}', b: 'As a business owner in {nh} for 15 years, I can confidently recommend {place} on {street}. Consistent quality, professional service, and fair pricing. They have earned our continued patronage.' },
    { t: '{place} — trust me on this one', b: 'Look I dont post much but {place} on {street} deserves the hype. Went with my girl last Friday, food was amazing, drinks were strong, and the bill didnt make me cry. Rare W in {nh}.' },
    { t: 'Best laundromat in {nh}', b: 'Clean Spin on {street}. Machines actually work, its clean, and the drop-off service is $1/lb. Game changer.' },
    { t: 'ok hear me out — {place}', b: 'i know i know another food rec but {place} on {street} literally cured my depression. their special on tuesdays is insane. {nh} ppl already know but newcomers PLEASE go' },
    { t: 'PHENOMENAL haircut at {street}', b: 'I have been searching for a good barber since I moved to {nh} two years ago and I finally found one. {last} on {street} gave me the best cut I have ever had. $25. Worth every single penny. Book ahead tho.' },
    { t: 'Hidden gem alert — {nh}', b: '{place}. {street}. Go. Dont ask questions. Just order the special. Your taste buds will write me a thank you note.' },
    { t: 'Had to put yall on — {place} in {nh}', b: 'Been holding this one close to the chest but {place} on {street} is too good to gatekeep. Everything on the menu slaps. The owner {last} is a real one.' },
    { t: 'Best kept secret on {street}', b: 'Ive lived in {nh} for 30 years. Seen restaurants come and go. {place} is the real deal. Good food, honest prices, and they treat you like family. Thats all you need to know.' },
  ],
  question: [
    { t: 'Good gym near {nh}?', b: 'Just moved here. Looking for a no-frills gym with free weights. Not Planet Fitness. Budget around $50-80/month.' },
    { t: 'Anyone know a good plumber?', b: 'Kitchen sink backed up and Draino isnt cutting it. Need someone reliable who wont overcharge. {nh} area.' },
    { t: 'Best grocery store in {nh}?', b: 'New to the neighborhood. Where does everyone shop? Looking for good produce and reasonable prices.' },
    { t: 'Parking situation in {nh}?', b: 'Thinking about getting a car. How bad is street parking around here? Any monthly lots that arent insane?' },
    { t: 'Dog-friendly restaurants in {nh}?', b: 'Have a well-behaved lab. Looking for places with outdoor seating that welcome dogs.' },
    { t: 'Best barber in {nh}?', b: 'Need a good fade. Tired of chain places. Who does everyone go to around here?' },
    { t: 'Internet provider — {nh}?', b: 'Moving to {nh}. Optimum or Fios? Anyone have experience? Need reliable wifi for WFH.' },
    { t: 'Where to watch the game in {nh}?', b: 'Looking for a sports bar with big screens, decent wings, not too packed. Any spots?' },
    { t: 'Cheap eats in {nh}?', b: 'Im broke but hungry. What are the best meals under $10 around here? Hit me with your spots.' },
    { t: 'Quiet bar in {nh}?', b: 'Looking for somewhere I can actually hear my date talk. Not looking for a club scene.' },
    { t: 'where the good food at in {nh}??', b: 'just moved here from {city} and i need to find my spots asap. dont say applebees lmaooo. whats the go-to for late night eats around {street}??' },
    { t: 'Good pediatrician in {nh}?', b: 'New baby, need a pediatrician taking new patients. Prefer someone who doesnt rush appointments.' },
    { t: 'yo who does yall hair in {nh}', b: 'need a braider or stylist thats not gonna have me sitting for 9 hours and charge me 400. somewhere near {street} ideally. drop names pls' },
    { t: 'HELP — need emergency locksmith {nh}', b: 'locked myself out AGAIN. its 11pm. who do i call thats not gonna charge me $300 to open my own door. {street} area. pls respond fast im freezing' },
    { t: 'Can anyone recommend a good accountant?', b: 'Tax season is approaching and I need a CPA in the {nh} area. Preferably someone experienced with small business returns and freelance income. Reasonable rates appreciated.' },
    { t: 'Daycare recs for {nh}??', b: 'FTM going back to work in 3 months and I am PANICKING about childcare. Need something near {street} thats not gonna cost my entire salary. How do ppl afford this lol help' },
    { t: 'which {train} station has an elevator??', b: 'my mom is visiting and she uses a walker. we live near {street} in {nh}. anyone know which stations nearby are actually accessible? the MTA website is useless as usual' },
    { t: 'Reliable mechanic in {nh}?', b: 'My check engine light has been on for a week and Im scared to find out why. Need someone honest near {street} who wont try to sell me a whole new engine for a loose gas cap.' },
    { t: 'tbh where do ppl go out in {nh}', b: 'im 23 and just moved here and i literally have no idea where ppl my age go on weekends. bars? clubs? rooftops? someone give me a whole list im begging' },
    { t: 'Best spot to study near {street}?', b: 'College kid looking for a quiet place with wifi. Library is always packed. Coffee shop recs welcome. Bonus if they dont judge me for sitting there 5 hours with one latte.' },
    { t: 'Looking for a piano teacher — {nh}', b: 'My daughter is 8 and wants to learn piano. We live near {street}. Looking for someone patient and good with kids. In-home lessons preferred if possible.' },
    { t: 'Any good thrift stores in {nh}?', b: 'Trying to furnish my apartment without going broke. Where are the good secondhand spots around here? Not looking for "vintage" priced at retail lol' },
  ],
  alert: [
    { t: 'Package thefts on {street}', b: 'Third package stolen this week from our building lobby. Be careful. Delivery drivers leaving packages outside. Talk to your super.' },
    { t: 'Fire hydrant open on {street}', b: 'Hydrant open on {street} and {street2}. Water flooding the street. 311 called already.' },
    { t: 'Car break-ins — {street}, {nh}', b: 'Multiple car break-ins on {street} last night. Lock your cars, dont leave valuables visible. NYPD has been notified.' },
    { t: 'Road closure — {street}', b: 'Film crew has {street} blocked off today and tomorrow. Expect detours and no parking.' },
    { t: 'Power outage in {nh}', b: 'Power out for 2 hours on {street} and surrounding blocks. Con Ed says 4 hour estimate.' },
    { t: 'Flooding on {street} after rain', b: 'Street flooding bad near {street} and {street2}. Storm drains clogged. Watch your step, especially at night.' },
    { t: 'Construction noise warning — {street}', b: 'Building going up at {street}. Expect jackhammering 7am-6pm for the next 2 weeks. Buy earplugs.' },
    { t: 'Gas smell on {street} — {nh}', b: 'Strong gas smell near {street}. Called Con Ed. They said theyre sending someone. Be careful if you live nearby.' },
    { t: 'YO WATCH OUT — {street}', b: 'somebody busted a whole fire hydrant on {street} and {street2}. water is EVERYWHERE. cars getting soaked, sidewalk flooded. avoid this block rn' },
    { t: 'HEADS UP {nh} — water main break', b: 'Water main broke on {street}. Whole block is shut down, water is off in our building and probably yours too. Called 311 twice already. Stock up on bottled water just in case.' },
    { t: 'Suspicious activity — {street}', b: 'Saw someone checking car door handles on {street} around 2am. Not trying to be paranoid but lock your cars and dont leave anything visible. Told the precinct.' },
    { t: 'RATS. SO MANY RATS. {street}', b: 'the trash situation on {street} and {street2} is out of control rn. rats literally having a block party. called 311 but yall know how that goes. be careful walking at night fr' },
    { t: 'Pothole warning — {street}, {nh}', b: 'Massive pothole opened up on {street} near {street2}. Almost took out my tire. If you drive through here watch out, especially at night when you cant see it.' },
    { t: 'Scaffolding collapse — {street}', b: 'Part of the scaffolding on {street} came down this morning. Nobody hurt but sidewalk is blocked. Take {street2} instead until they fix it. Stay safe yall.' },
    { t: 'BOIL WATER ADVISORY — {nh}', b: 'DEP just posted a boil water notice for our block on {street}. Water main repair. Boil before drinking or cooking until further notice. Spread the word to your neighbors.' },
    { t: 'Smoke in the subway — {train} line', b: 'Heavy smoke at the {street} station on the {train}. Trains are skipping the stop. Take the bus or walk to {street2}. FDNY on scene.' },
    { t: 'stolen bike — just happened on {street}', b: 'dude literally just cut my lock on {street} in broad daylight and rode off on my bike. black trek hybrid. if anyone sees it around {nh} lmk. im sick rn' },
    { t: 'Attention residents of {nh}', b: 'Please be aware that {street} between {street2} and {street3} will be closed for emergency sewer repair starting tomorrow at 6 AM. Expected duration is 3-5 days. Plan alternate routes accordingly.' },
    { t: 'ICY SIDEWALKS — {nh}', b: 'nobody salted {street} and its a skating rink out here. i almost wiped out twice just going to the bodega. be careful and wear good shoes. somebody is gonna break a hip fr' },
    { t: 'Bed bugs in building on {street}', b: 'Not trying to blast anyone but there are bed bugs in the building at {street} and {street2}. If you live nearby check your apt. Sharing so people know to be careful.' },
  ],
  'lost-and-found': [
    { t: 'Found wallet near {street}', b: 'Found a brown leather wallet on {street} near the subway. Has ID inside. DM me to identify and claim.' },
    { t: 'Lost gold bracelet — {nh} area', b: 'Lost my grandmothers gold bracelet between {street} and {street2}. Huge sentimental value. Reward offered.' },
    { t: 'Found keys with blue keychain', b: 'Found on the bench near {street}. 3 keys + a blue bottle opener keychain. DM to claim.' },
    { t: 'Lost dog — brown pit mix, {nh}', b: 'Slipped his collar near {street}. Brown and white pit, very friendly, answers to Milo. Please call if seen.' },
    { t: 'Found phone on the {train} train', b: 'Found an iPhone on the {train} at {street} station. Cracked screen. DM me with lock screen description.' },
    { t: 'Lost cat — gray tabby, {nh}', b: 'Indoor cat escaped through a window on {street}. Gray tabby, green eyes, white chest. Answers to Luna. Please help.' },
    { t: 'Found AirPods case near {place}', b: 'Found a white AirPods Pro case outside {place} on {street}. Still has charge. DM to claim.' },
    { t: 'PLEASE HELP — lost my dog in {nh}', b: 'my baby got out the door when the delivery guy came. small white poodle mix, pink collar, answers to Princess. last seen near {street} and {street2}. im literally crying rn please if anyone sees her DM ME IMMEDIATELY. reward $200' },
    { t: 'found a set of keys on {street}', b: 'found em on the ground outside {place}. honda key fob + 4 keys + a little keychain that says "chicago." DM me if theyre yours' },
    { t: 'LOST — my sons stuffed bear', b: 'I know this sounds silly but my 4 year old lost his stuffed teddy bear somewhere between {street} and {street2}. Its brown and very worn. He cant sleep without it. Please help a desperate mom.' },
    { t: 'Found prescription glasses — {nh}', b: 'Found a pair of black frame prescription glasses on the sidewalk near {street}. They look expensive. Sitting on top of the mailbox near {place}. Grab em before the rain.' },
    { t: 'lost my wallet somewhere on {street}', b: 'black leather bifold. had my ID, metrocard, and like $40 in it. probably dropped it between {place} and the {train} station. long shot but if anyone found it hmu' },
    { t: 'Found a ring on {street}', b: 'Found what looks like a wedding band on the sidewalk near {street} and {street2}. Gold with an inscription inside. If you can tell me what it says, its yours.' },
    { t: 'Missing parrot — yes, a parrot', b: 'Our green and yellow parrot flew out the window on {street}. His name is Mango. He says "hello baby" and "wheres my food." Not joking. Please call if you see him anywhere in {nh}.' },
    { t: 'Found a backpack on the {train}', b: 'Left on the seat. Black Jansport with textbooks and a laptop inside. Found it on the {train} heading toward {street}. DM me with contents to claim. Ill hold it for a week.' },
    { t: 'Lost my engagement ring near {place}', b: 'I am devastated. Lost my engagement ring somewhere near {place} on {street}. Its a small diamond on a silver band. My fiance proposed there last year. Substantial reward. Please check the ground if youre nearby.' },
    { t: 'found a kids scooter on {street}', b: 'little red razor scooter leaned up against the tree in front of {place}. been there since yesterday. some kid is probably sad rn. come get it before someone else does' },
    { t: 'LOST TORTOISESHELL CAT — {nh}', b: 'My cat Pepper got out last night near {street}. Shes a tortoiseshell with a notched left ear and no collar. Shes an indoor cat and probably terrified. Shes 12 years old and I am beside myself. Please keep an eye out.' },
    { t: 'Found a watch near {street} park', b: 'Nice looking watch, found it by the benches near {street}. If you can describe the brand and band color its yours. DM me.' },
    { t: 'lost my metrocard with monthly pass', b: 'i know its a long shot but i dropped my unlimited metrocard somewhere near {street} station. still had 2 weeks left on it. pain. if anyone found it lmk' },
  ],
  event: [
    { t: 'Free yoga in the park — {nh}', b: 'Every Saturday at 9am at {street} park. All levels welcome. Bring your own mat. 3 years running.' },
    { t: 'Block party this Saturday — {street}', b: '{street} between {street2} and {street3} is having a block party. DJ, food, kids activities. 2pm-8pm. Free.' },
    { t: 'Open mic night — {nh}', b: '{place} is hosting open mic every Thursday at 8pm. Comedy, poetry, music. Sign up at the bar.' },
    { t: 'Farmers market opens this weekend', b: 'The {nh} farmers market is back! Sundays 8am-2pm at {street}. Produce, bread, honey, flowers.' },
    { t: 'Community garden volunteer day', b: 'Help us get the {nh} garden ready for spring. This Saturday 10am-1pm. Tools provided.' },
    { t: 'Free outdoor movie — {nh}', b: 'Showing {movie} this Friday at sundown in the park. Bring blankets and snacks.' },
    { t: 'Salsa night — {nh}', b: 'Free salsa lessons + dancing at {place} every Wednesday 7-10pm. Beginners welcome. No partner needed.' },
    { t: 'Kids art class — free, {nh}', b: 'The community center on {street} is offering free art classes for kids 5-12. Saturdays 11am.' },
    { t: 'FREE CONCERT THIS SATURDAY — {nh}', b: 'LIVE MUSIC ON {street}!! Local bands playing 4pm-10pm. Food vendors, beer garden, face painting for kids. Bring chairs and blankets.' },
    { t: '{nh} outdoor movie night — {movie}', b: 'We are screening {movie} in the park near {street} this Friday at sundown. Bring a blanket, bring snacks, bring your whole family. Free popcorn while it lasts. Rain date is Saturday.' },
    { t: 'Cultural Festival — {nh}', b: 'The annual {nh} Cultural Festival is this weekend on {street}. Food from 20+ countries, live performances, art vendors, and activities for children. Saturday and Sunday, 11am-7pm. Free admission.' },
    { t: 'anyone tryna come to this popup??', b: 'theres a sick popup market at {place} on {street} this saturday. local artists, vintage clothes, jewelry, and a DJ. starts at noon. im def pulling up whos coming w me' },
    { t: 'Trivia night @ {place} — {nh}', b: 'Every Tuesday at 8pm. Teams of 2-6. Winning team gets a $50 bar tab. Its getting competitive lol. Come thru {nh} lets see what you got.' },
    { t: 'DRAG BRUNCH SUNDAY — {nh}', b: 'Drag brunch at {place} on {street} this Sunday! Bottomless mimosas + a full show. $45 per person, reservations required. Trust me its the most fun youll have in {nh} all month.' },
    { t: 'Senior Social — {nh} Community Center', b: 'Join us at the {nh} Community Center on {street} for our weekly senior social. Cards, coffee, conversation, and occasionally bingo. Every Wednesday at 1pm. All are welcome.' },
    { t: 'Pickup basketball — {street} courts', b: 'we run pickup games every saturday morning at the courts on {street}. 9am. all skill levels but no one who argues every call lol. just come and hoop' },
    { t: '{nh} Night Market Returns!', b: 'The {nh} Night Market is BACK on {street} every Friday evening through the summer. 50+ food vendors, live music, crafts. 5pm-11pm. Bring cash, most vendors dont take cards. See you there!' },
    { t: 'Storytime at the Library — {nh}', b: 'Every Wednesday at 10:30am, the {nh} branch on {street} does storytime for toddlers. Songs, books, crafts. My little one absolutely loves it. Great way to meet other parents too.' },
    { t: 'Comedy show — {place}, {nh}', b: 'Stand-up comedy at {place} on {street} every Friday. $10 cover. Last week had me CRYING. Some of these comedians are gonna be famous one day. Support local comedy yall.' },
    { t: 'Rooftop party this weekend — {nh}', b: 'My building on {street} is throwing a rooftop party Saturday at 6pm. BYOB, DJ, good vibes. Residents can bring guests. Come meet your neighbors.' },
  ],
  'stoop-sale': [
    { t: 'Stoop sale Saturday — {street}, {nh}', b: 'Clothes, books, kitchen stuff, furniture. Everything must go. Starting 9am. Cash or Venmo.' },
    { t: 'Moving sale — everything cheap', b: 'Leaving NYC. Furniture, electronics, clothes, art. {street}, {nh}. Saturday and Sunday 8am-4pm.' },
    { t: 'Multi-family stoop sale — {street}', b: '4 apartments clearing out. Tons of stuff. Kids clothes, vinyl, plants, tools. Sunday starting 10am.' },
    { t: 'Vintage stoop sale — {nh}', b: 'Vintage clothing, records, mid-century decor, rare books. {street} this Saturday. Early birds welcome.' },
    { t: 'MASSIVE stoop sale — {street}', b: 'My wife said if I dont get rid of half my stuff shes leaving. Her loss is your gain. Tools, sports equipment, books, random gadgets. Saturday 8am. Come save my marriage.' },
    { t: 'stoop sale this weekend!! {nh}', b: 'cleaning out my apartment FINALLY. got clothes (sizes S-L), shoes, bags, jewelry, kitchen stuff, some electronics. {street} saturday 9am-3pm. everything is cheap bc i just want it GONE' },
    { t: 'Baby stuff stoop sale — {street}', b: 'Kids outgrew everything. Stroller, car seat, clothes 0-3T, toys, books. All clean and in good condition. {street}, {nh}. Saturday 9am-1pm. Great deals for new parents.' },
    { t: 'Downsizing stoop sale — {nh}', b: 'Retired and moving to a smaller place. Furniture, kitchen appliances, linens, artwork collected over 35 years. Quality items at very fair prices. {street}, Saturday 8am-2pm.' },
    { t: 'Art + plants stoop sale — {nh}', b: 'Selling original artwork, prints, and about 30 houseplants Ive propagated. Also some ceramics and handmade candles. {street} this Sunday starting 10am. Cash or Venmo.' },
    { t: 'everything $5 or less — stoop sale', b: 'im not playing games. everything on the stoop is $5 or under. books $1, clothes $2-5, kitchen stuff $3-5, shoes $5. {street} in {nh}. saturday at 10am. when its gone its gone' },
  ],
  'garage-sale': [
    { t: 'Garage sale — tools and sports gear', b: 'Clearing out. Power tools, bikes, camping gear, furniture. {street}, {nh}. Saturday 8am-2pm.' },
    { t: 'Estate sale — everything must go', b: 'Entire household. Furniture, kitchenware, art, antiques. {street}, {nh}. Friday-Sunday.' },
    { t: 'HUGE garage sale — {nh}', b: '3 car garage full of stuff. Appliances, exercise equipment, holiday decorations, tools, old electronics, furniture. {street}. Saturday and Sunday 7am-5pm. Bring cash.' },
    { t: 'Garage sale — moving overseas', b: 'Selling literally everything I own. Living room set, bedroom furniture, washer/dryer, patio stuff, kitchen everything. {street}, {nh}. Fri-Sun. Prices negotiable on bulk buys.' },
    { t: 'garage sale this sat — {nh}', b: 'got tools, auto parts, fishing gear, old vinyl, some furniture, and a bunch of random stuff from 20 yrs of living here. {street}. starting at 8am. come thru' },
    { t: 'Multi-family garage sale — {street}', b: '5 families from the block are doing a big joint garage sale. {street} between {street2} and {street3}. Youll find everything from baby gear to power tools. Saturday 8am-3pm.' },
    { t: 'Garage Sale — Workshop Cleanout', b: 'Retired carpenter here. Selling off my workshop. Table saw, drill press, hand tools, lumber, hardware, workbench. Everything works great. {street}, {nh}. Saturday only.' },
    { t: 'garage sale — mostly electronics', b: 'TVs, monitors, speakers, old gaming consoles, cables galore, a 3D printer that mostly works, keyboards, mice. nerd paradise basically. {street} {nh} saturday 9-3' },
    { t: 'Garage sale — priced to move', b: 'Not tryna negotiate all day. Everything is already cheap. Furniture, clothes, books, kitchen stuff, exercise equipment. {street}, {nh}. Sat 8am-1pm. What you see is what you pay.' },
    { t: 'Spring cleaning garage sale!!', b: 'if i havent used it in a year its GONE. clothes, shoes, home decor, small appliances, random stuff. {street} in {nh}. saturday starting 9am. everything negotiable just come take this stuff lol' },
  ],
  volunteer: [
    { t: 'Soup kitchen needs volunteers — {nh}', b: 'The {nh} Community Kitchen needs help Saturdays 8am-12pm. Serving 200+ meals. No experience needed.' },
    { t: 'Tutoring volunteers — after school', b: '{nh} after school program needs math and reading tutors. Tues/Thurs 3-5pm. Make a difference.' },
    { t: 'Park cleanup this weekend', b: 'Help clean up the park near {street}. Bags and gloves provided. Meet at main entrance 10am Saturday.' },
    { t: 'Senior center needs visitors', b: 'The {nh} Senior Center needs people to visit elderly residents. Even 1 hour/week helps so much.' },
    { t: 'Dog shelter needs walkers — {nh}', b: 'Animal Care Center near {street} needs volunteer dog walkers. Mornings or afternoons. Rewarding work.' },
    { t: 'Community fridge needs stockers — {nh}', b: 'The community fridge on {street} needs people to stock it regularly. If you can donate food or time once a week, it makes a huge difference. DM me to coordinate.' },
    { t: 'VOLUNTEERS NEEDED — {nh} food pantry', b: 'We serve 300+ families every Saturday and we are SHORT on help. 7am-1pm at the church on {street}. No experience needed. Just show up with a good attitude. Please share this.' },
    { t: 'anyone wanna help paint a mural?', b: 'were painting a community mural on {street} this weekend and need more hands. no art experience needed, well teach you. just wear clothes you dont care about. saturday + sunday 10am-4pm' },
    { t: 'Beach cleanup — {nh}', b: 'Organizing a beach/shoreline cleanup this Saturday at 9am. Meet at the entrance near {street}. Bags and gloves provided. Bring sunscreen and water. All ages welcome.' },
    { t: 'ESL tutors needed — {nh}', b: 'The community center on {street} needs volunteers to help with English classes. Tuesday and Thursday evenings 6-8pm. Even once a month helps.' },
  ],
  carpool: [
    { t: 'Daily carpool — {nh} to Midtown', b: 'I drive to Midtown East every weekday. Leave 7:30am, return 6pm. Split gas and tolls. 1-2 spots.' },
    { t: 'Weekend carpool to Costco', b: 'Going to Costco this Saturday. Room for 2 people and groceries. Split gas.' },
    { t: 'Carpool to NJ — weekly', b: 'Commute to Jersey City Mon-Fri from {nh}. Looking for someone going same direction.' },
    { t: 'anyone driving to {city} this weekend?', b: 'need a ride to {city} friday evening or saturday morning. will split gas and tolls and im good company lol. can meet anywhere in {nh}. hmu' },
    { t: 'Carpool — {nh} to Downtown', b: 'I work downtown near {street}. Drive every day, leave at 8am, back by 6:30pm. Happy to take 1-2 people. Split gas and parking. Been doing this commute for 3 years.' },
    { t: 'IKEA run this weekend — who needs a ride?', b: 'Driving to IKEA Saturday morning from {nh}. Got an SUV with plenty of room. Take 2 people and their hauls. Split gas. Leave at 10am.' },
    { t: 'school carpool — {nh}', b: 'Looking for parents who drive their kids to PS/IS near {street} in the morning. My kids go there too. Lets set up a rotation so we dont all have to drive every day. DM me.' },
    { t: 'Weekly grocery carpool — {nh}', b: 'I drive to the big supermarket on {street} every Sunday. If anyone in {nh} wants to ride along and split gas, happy to make it a weekly thing. Room for 2.' },
    { t: 'Commute buddy — {nh} to Midtown West', b: 'Driving to W 42nd St area Mon-Fri. Leave {nh} at 7:15am sharp. Not looking for someone whos always late lol. Split gas and parking. Serious inquiries only.' },
    { t: 'Road trip to {city} — seats available', b: 'Driving to {city} next weekend. Leaving Saturday morning, coming back Sunday night. 2 seats available. $40 per person for gas. Good music guaranteed. DM me.' },
  ],
  'pet-sighting': [
    { t: 'Gray cat spotted — {street}, {nh}', b: 'Small gray cat with white paws near {street} for 3 days. No collar. Friendly but wont let you grab it.' },
    { t: 'Loose dog — {nh} area', b: 'Medium brown dog running loose near {street} and {street2}. No collar. Looks scared.' },
    { t: 'Parakeet on fire escape — {street}', b: 'Green parakeet on a fire escape on {street}. Seems tame, might be someones pet. Been there 2 days.' },
    { t: 'ORANGE CAT ON {street} — anyone missing one?', b: 'Big fluffy orange tabby sitting outside {place} for the last 2 days. Very friendly, let me pet him. No collar but looks well fed. Definitely someones cat. If hes yours come get him!' },
    { t: 'spotted a rabbit on {street}??', b: 'ok this is weird but theres literally a brown and white rabbit hopping around near {street} and {street2}. definitely not wild, looks like a pet. someone in {nh} is missing a bunny lol' },
    { t: 'Lost-looking dog near {street} park', b: 'Saw a small black terrier mix wandering alone near the park on {street}. Has a red collar but no tags. Looked lost and confused. Tried to approach but it ran off toward {street2}.' },
    { t: 'SOMEONE MISSING A HUSKY?? — {nh}', b: 'HUGE gray and white husky running around near {street} with no leash and no owner in sight. Beautiful dog but looks confused. Blue eyes. Tried to grab him but hes too fast. Please share.' },
    { t: 'Stray kittens under car on {street}', b: 'Found what looks like a litter of 3-4 kittens living under a car on {street} near {street2}. Very small, maybe 4-5 weeks old. No mama cat in sight. If anyone does TNR or kitten rescue please DM me.' },
    { t: 'Big dog — no owner — {nh} park', b: 'There is a large brown pitbull-type dog in the park near {street}. Friendly, came up to my kids. Has a blue collar but I couldnt see any tags. Been there for at least an hour. Please share in case someone is looking.' },
    { t: 'injured pigeon on {street}', b: 'i know its just a pigeon but theres one on {street} with a broken wing that cant fly. its just sitting there. does anyone know a wildlife rehab that would take it? cant just leave it' },
  ],
  welcome: [
    { t: 'Just moved to {nh} — hello!', b: 'Moved from {city} last week. Living near {street}. Would love recommendations for food, drinks, and things to do!' },
    { t: 'New to {nh} — looking for friends', b: 'Relocated for work, dont know anyone. Late 20s, into {hobby} and {hobby2}. Anyone want to grab coffee?' },
    { t: 'Back in {nh} after 5 years', b: 'Used to live here, moved away, now Im back. So much has changed. What are the new spots?' },
    { t: 'Family moved to {nh}', b: 'Just moved with my partner and 2 kids. Looking for family-friendly spots, playgrounds, and parent groups.' },
    { t: 'hiii {nh}!! just moved here!!', b: 'moved from {city} and im SO EXCITED to be in nyc finally!!! living near {street}, literally everything is walkable i cant believe it. someone pls tell me the best brunch spots im begging' },
    { t: 'New to {nh} — retired and loving it', b: 'My wife and I just moved to {nh} after 35 years in {city}. We are near {street} and already love the energy here. Looking for good restaurants, walking paths, and maybe a bridge club if one exists.' },
    { t: 'just got here from {city} — whats good', b: 'moved to {nh} for a job. apartment is on {street}. i literally know zero people lol. 24, into {hobby} and {hobby2}. someone take me under their wing plsss' },
    { t: 'New business owner in {nh} — hello!', b: 'Just opened a small shop on {street} and wanted to introduce myself to the community. We are excited to be part of {nh} and look forward to serving our new neighbors. Please stop by and say hello.' },
    { t: 'Moved back to NYC — {nh} this time', b: 'Grew up in NYC, moved to {city} for 10 years, finally came back. Now in {nh} near {street}. Feels good to be home but everything is different lol. What do I need to know?' },
    { t: 'Single mom, new to {nh}', b: 'Just moved here with my daughter (shes 6). New school, new neighborhood, new everything. Near {street}. Would love to connect with other parents, find good after-school programs, and just feel less alone in this.' },
  ],
  seasonal: [
    { t: 'Snow day vibes in {nh}', b: 'Streets are covered and the park looks magical. Whos building a snowman on {street}? Kids welcome. Bring hot cocoa.' },
    { t: 'NYC Marathon — road closures near {nh}', b: 'Marathon is Sunday. {street} will be closed most of the day. Plan accordingly. Go cheer for the runners if you can!' },
    { t: 'Heat wave survival guide — {nh}', b: 'Its gonna be 100+ this week. Cooling centers open at the {nh} community center on {street}. Stay hydrated, check on elderly neighbors, and dont forget your pets.' },
    { t: 'Cherry blossoms are blooming in {nh}!', b: 'The trees near {street} park are in full bloom. Gorgeous right now. Go take a walk before the petals drop.' },
    { t: 'Halloween on {street} was AMAZING', b: 'The houses on {street} went all out this year. Full-size candy bars, decorations, the works. This block is legendary. Already planning for next year.' },
    { t: 'Thanksgiving food drive — {nh}', b: 'Collecting turkeys, sides, and canned goods for families in need. Drop off at {street} church through Wednesday. Every bit helps.' },
    { t: 'NYE plans in {nh}?', b: 'Not trying to deal with Times Square. Anyone know of local spots doing something fun for New Years in {nh}? Bars, restaurants, house parties, anything.' },
    { t: 'Summer Fridays at the park — {nh}', b: 'Every Friday this summer theres live music at the park on {street} from 5-8pm. Bring a blanket and something to drink. Best free event in the neighborhood.' },
    { t: 'Back to school tips for {nh} parents', b: 'School starts next week. Reminder that the free uniform drive is at {street} community center Saturday. Also the after-school program at {place} still has spots.' },
    { t: 'Fourth of July — best fireworks views in {nh}', b: 'You can see the East River fireworks perfectly from the rooftops on {street}. If your building has roof access, bring chairs and get up there early.' },
  ],
  group: [
    { t: '{nh} running group — all levels', b: 'We run 3x/week. Tues/Thurs 6:30am, Saturday 8am. All paces welcome. Meet at {street} park.' },
    { t: 'Book club starting in {nh}', b: 'Monthly. Meeting at {place}. First book: {book}. All welcome. DM to join the group chat.' },
    { t: '{nh} parents group', b: 'Parents of kids under 5. Playground meetups, babysitting swaps, hand-me-downs. DM to join.' },
    { t: 'Photography walks — {nh}', b: 'Weekly photo walks Sundays 10am. Any camera, any level. Just show up and shoot.' },
    { t: '{nh} poker night', b: 'Friendly low-stakes poker. $20 buy-in. Every other Friday. Currently 6 regulars, room for 2 more.' },
    { t: 'who tryna start a basketball league in {nh}', b: 'we got enough ppl for like 4-5 teams. courts on {street} are open saturday mornings. refs optional, trash talk mandatory. dm me if u wanna play. all skill levels but no crybabies' },
    { t: '{nh} Dog Owners Group', b: 'Starting a group for dog owners in {nh}. Group walks, doggy playdates, vet recommendations, emergency pet sitting swaps. Meet at the park near {street} Saturdays at 10am. DM to join our group chat.' },
    { t: 'Writers group — {nh}', b: 'Looking for 5-6 writers to meet biweekly at {place}. Fiction, nonfiction, poetry, whatever. Workshop format — bring pages, get feedback. Supportive but honest. Thursday evenings.' },
    { t: '{nh} Board Game Night', b: 'Every Wednesday at 7pm at {place} on {street}. We have Catan, Ticket to Ride, Codenames, and more. Bring your own if you want. Beginners totally welcome. Usually 8-12 people. Just come!' },
    { t: 'Cycling group — {nh}', b: 'Weekend rides through the city. Meet at {street} Saturdays at 7am. All speeds welcome but you need to be able to do 20+ miles. Road or hybrid bikes. Casual, no lycra required.' },
  ],
}

// ─── Listing templates ───

interface ListingSubgroup {
  sub: string
  t: string[]
  p: number[]
  d: string[]
}

export const LISTINGS: Record<string, ListingSubgroup[]> = {
  'for-sale': [
    { sub: 'furniture', t: ['Solid wood dining table — seats 6','Mid-century modern couch','IKEA Kallax shelf, white','Vintage leather armchair','Queen bed frame + headboard','Standing desk, adjustable','Bookshelf, dark walnut','Glass coffee table','6-drawer dresser','Futon couch/bed'], p: [150,400,60,200,180,250,80,75,120,100], d: ['Moving, must sell. Cash only, you haul.','2 years old, no stains. Comfortable.','Assembled but moving. Great condition.','Real leather, some patina.','Sturdy, no squeaks. No mattress.','Electric motor, 28-48 inches.','From West Elm, paid $300.','Modern style. Fits any room.','All drawers work smoothly.','Folds into bed. Great for guests.'] },
    { sub: 'electronics', t: ['MacBook Pro M2, 16GB','PS5 + 2 controllers','Samsung 55" 4K TV','AirPods Pro 2nd gen, sealed','iPad Air 5th gen','Sony WH-1000XM5','Nintendo Switch OLED + games','Dell 27" 4K monitor','Bose soundbar + sub','iPhone 14 Pro, unlocked'], p: [1100,380,300,180,400,250,280,220,350,650], d: ['Barely used. Battery health 98%.','Original box. Works perfectly.','Smart TV, wall mounted.','Sealed box. Gift duplicate.','WiFi model + Apple Pencil.','Best noise cancelling. 6 months old.','Mario Kart + Zelda included.','IPS, USB-C. Great for WFH.','Powerful bass. Sounds amazing.','No scratches. Case always on.'] },
    { sub: 'clothing-accessories', t: ['North Face puffer, size M','Vintage Levis 501s, 32x32','Nike AF1s, size 10, DS','Winter coat lot — 5 coats','Timberland boots, size 11','Patagonia fleece, like new','Dr. Martens 1460, size 9'], p: [120,65,110,150,100,75,90], d: ['700 fill. Warm. Bought a new one.','Straight leg, actual vintage.','Deadstock, never worn. All white.','All medium. Downsizing closet.','Worn one winter. Waterproofed.','Better Sweater, barely worn.','Already broken in.'] },
    { sub: 'bikes', t: ['Trek FX3 hybrid','Specialized Allez road bike','Brompton folding 6-speed','E-bike, 500W hub motor','Giant Escape 3','Fixie, matte black'], p: [500,600,1200,800,280,250], d: ['Disc brakes, carbon fork.','Shimano 105. Fast and light.','Folds in 20 seconds.','28mph top speed. 40 mile range.','Ridden maybe 5 times.','Clean build. Flip flop hub.'] },
    { sub: 'free-stuff', t: ['Free couch — you haul','Moving boxes, come grab','Old TV, works fine','Books — 3 boxes','Plant collection, 8 plants','Kitchen stuff — pots, pans'], p: [0,0,0,0,0,0], d: ['Gray sectional. Some wear. Pick up Sunday.','About 30 boxes. First come first served.','42 inch, not smart. Has HDMI.','Moving, cant take them.','Spider plant, pothos, snake plant etc.','Clearing kitchen. Take what you need.'] },
    { sub: 'vinyl-records', t: ['Jazz collection — 40 records','Hip hop vinyl lot — 25 albums','Beatles White Album, OG pressing','Wu-Tang 36 Chambers, sealed','90s R&B collection — 15 records'], p: [300,200,150,45,120], d: ['Coltrane, Monk, Davis. All VG+.','Nas, Biggie, Tribe, De La Soul.','Some jacket wear, vinyl plays great.','Get On Down pressing. Sealed.','TLC, Aaliyah, SWV. Great condition.'] },
    { sub: 'sneakers-streetwear', t: ['Jordan 4 Bred, sz 10, DS','New Balance 990v6','Dunks Low Panda, sz 10.5','Adidas Samba OG','Jordan 1 High, sz 11'], p: [250,160,130,95,200], d: ['Deadstock with SNKRS receipt.','Made in USA. Best runner.','Basically new. No box.','Classic. Goes with everything.','Barely worn. Comes with box.'] },
  ],
  housing: [
    { sub: 'apartments', t: ['Sunny 1BR, {nh}, $2,100/mo','Spacious 2BR, renovated, {nh}','Studio, exposed brick, {nh}','Large 3BR, laundry in unit, {nh}','Modern 2BR, rooftop, {nh}','Rent-stabilized 1BR, {nh}','Bright studio, high ceilings, {nh}'], p: [2100,2800,1650,3500,3200,1500,1450], d: ['South-facing. Heat included.','New appliances, hardwood throughout.','Top floor walkup. Quiet.','Rare W/D in unit. Near subway.','Gym, rooftop, doorman. Pets OK.','Below market. Dont miss it.','450sqft but great closet.'] },
    { sub: 'rooms-shared', t: ['Room in 3BR, {nh}, $1,200','Private room, shared bath, {nh}','Master BR in 2BR, {nh}, $1,400','Furnished room, utils incl, {nh}'], p: [1200,950,1400,1300], d: ['Chill roommates. Near train.','Quiet apt. Working professionals.','Biggest room, closet space.','Bed, desk, wifi, electric included.'] },
    { sub: 'sublets', t: ['Summer sublet 1BR, {nh}','3-month studio sublet, {nh}','Furnished 1BR sublet, {nh}'], p: [2000,1600,2200], d: ['June-Aug. Fully furnished. AC.','Great location. Leaving for internship.','Everything included. Bring clothes.'] },
  ],
  services: [
    { sub: 'cleaning', t: ['{biz} Cleaning — {nh}','Deep Clean Experts — {nh}','Move In/Out Cleaning','Weekly Cleaning — Reliable'], p: [120,200,250,100], d: ['Licensed, insured. 10 years experience. References.','Ovens, fridges, baseboards. We go deep.','Get your deposit back. Spotless results.','Same cleaner every week. Consistent.'] },
    { sub: 'handyman', t: ['Handyman — No Job Too Small, {nh}','Fix It All — Licensed, {nh}','Furniture Assembly + Mounting','Small Repairs — {nh}'], p: [75,100,60,70], d: ['Shelves, TV mounting, minor plumbing. 15 yrs exp.','Licensed electrician + general handyman.','IKEA, TV mount, pictures. Flat rate.','Faucets, doors, drywall. Quick and clean.'] },
    { sub: 'moving-hauling', t: ['2 Movers + Truck — $300','Local NYC Moves — {biz}','Junk Removal — Same Day','Piano Moving Specialists'], p: [300,400,150,500], d: ['Licensed. Insured. No hidden fees.','Family owned, 20 years. 5 stars.','Furniture, appliances, debris.','Grand, upright, digital. Insured.'] },
    { sub: 'tutoring', t: ['Math Tutor, All Levels — {nh}','SAT/ACT Prep — 1500+ Scorer','Spanish Lessons — Native Speaker','ESL — Patient, Experienced'], p: [60,80,50,45], d: ['Columbia grad. Algebra to Calculus.','Scored 1560. Know all the tricks.','From Mexico City. All levels.','10 years teaching. Your pace.'] },
    { sub: 'photography', t: ['NYC Portrait Photographer','Event Photography — {nh}','Real Estate Photography','Headshots — Professional'], p: [200,500,150,175], d: ['Natural light. Parks, rooftops, streets.','Birthdays, corporate. 48hr delivery.','HDR, wide angle. Same day turnaround.','LinkedIn, acting, dating apps.'] },
  ],
  jobs: [
    { sub: 'restaurant-hospitality', t: ['Line Cook — {nh} Restaurant','Server/Bartender — Busy {nh} Bar','Barista — Coffee Shop, {nh}','Restaurant Manager — {nh}','Dishwasher — Full Time, {nh}'], p: [0,0,0,0,0], d: ['$18-22/hr + tips. Experience required.','$15/hr + tips ($200-400/night).','$17/hr + tips. Latte art a plus.','$55-65K + bonus. 3+ years mgmt.','$16/hr. Benefits after 90 days.'] },
    { sub: 'tech-engineering', t: ['Junior Frontend Dev — Hybrid','Senior Backend Engineer — {nh}','Data Analyst — Healthcare','DevOps Engineer — Fintech'], p: [0,0,0,0], d: ['$70-90K. React/Next.js. 1-2 years.','$150-180K. Python, PostgreSQL, AWS.','$85-110K. SQL, Python, Tableau.','$130-160K. AWS, Terraform, CI/CD.'] },
    { sub: 'trades-skilled-labor', t: ['Electrician Apprentice — Union','Licensed Plumber — Experienced','HVAC Technician — Commercial','Painter — Residential, {nh}'], p: [0,0,0,0], d: ['$25-35/hr + benefits. Will train.','$40-60/hr. 5+ yrs NYC experience.','$30-45/hr. EPA certified.','$25-35/hr. Clean work. References.'] },
    { sub: 'healthcare', t: ['Home Health Aide — {nh}','Medical Assistant — {nh} Clinic','Mental Health Counselor — Remote'], p: [0,0,0], d: ['$17-20/hr. Certified HHA required.','$18-22/hr. Bilingual preferred.','$60-80K. LCSW or LMHC. Telehealth.'] },
    { sub: 'retail', t: ['Retail Associate — {nh}','Store Manager — Boutique, {nh}','Cashier — Full Time, {nh}'], p: [0,0,0], d: ['$16-18/hr. Flexible schedule.','$50-60K. Retail mgmt required.','$16/hr. Benefits. Immediate start.'] },
  ],
  gigs: [
    { sub: 'moving-help', t: ['Help moving Saturday — {nh}','Furniture disassembly, 2 hrs','Help carry couch up 4 flights'], p: [100,80,50], d: ['Moving 2BR to 1BR. Need 2 people.','IKEA bed + desk. Take apart and load.','Sleeper sofa, narrow stairs. Quick.'] },
    { sub: 'dog-walking', t: ['Dog walker weekdays — {nh}','2 dogs, lunchtime walk','Senior dog — gentle walks'], p: [20,25,20], d: ['30 min noon walk Mon-Fri.','Two small dogs. 30 minutes.','Old retriever. Slow pace. Sweet.'] },
    { sub: 'delivery-runs', t: ['Deliver 5 packages — Manhattan','Pick up furniture — {nh}','Grocery run for elderly neighbor'], p: [75,60,30], d: ['All midtown. Small packages. Today.','Pickup here, deliver 10 blocks.','Weekly grocery run. Easy.'] },
  ],
  tickets: [
    { sub: 'concerts', t: ['2 tix — MSG, Feb 22','Floor seats — Barclays','Brooklyn Steel — sold out show','Radio City — 4 tickets','Terminal 5 — GA, 2 tix','Bowery Ballroom — sold out'], p: [150,200,80,175,65,50], d: ['Section 112. Cant make it.','Row 5. Selling at face value.','GA standing. Work conflict.','Orchestra seats. Family emergency.','Cant go, selling at cost.','Best small venue in NYC. Face value.'] },
    { sub: 'sports', t: ['Knicks tix — MSG lower level','Yankees opening day — 2 tix','Nets — section 100','Mets tix — Citi Field, 4 seats','NYCFC — supporters section','Rangers — MSG, 2 seats'], p: [175,250,120,100,45,200], d: ['Section 105. Real seats.','First game of the season.','Center court. Weeknight.','Section 110. Sat afternoon game.','Standing. Bring your voice.','Center ice. Great view.'] },
    { sub: 'broadway', t: ['Hamilton — orchestra, 2 seats','Wicked — Saturday matinee','Off-Broadway — 4 tickets','The Lion King — front mezzanine','Chicago — 2 tix, weeknight'], p: [300,180,100,225,140], d: ['Row M center. Cant make date.','Mezzanine, great view.','Intimate Village theater.','Amazing seats. Date fell through.','Wednesday 7pm show. Great seats.'] },
  ],
  pets: [
    { sub: 'adoption', t: ['Sweet tabby needs home','2 kittens, sisters','Rescue lab mix, great w/ kids','Senior cat, calm and loving'], p: [0,0,0,0], d: ['3yo, spayed, all shots. Indoor.','8wks, litter trained. Playful.','2yo, neutered, vaccinated.','10yo. Lap cat. Quiet home.'] },
    { sub: 'pet-sitting', t: ['Cat sitter 1 week — {nh}','Dog boarding — my home, {nh}'], p: [25,45], d: ['Feed + litter once daily. Easy.','Fenced yard. Lots of love.'] },
  ],
  community: [
    { sub: 'mutual-aid', t: ['Free winter coats — {nh}','Mutual aid fridge stocked — {street}','Free groceries for families — {nh}','Donated school supplies — {nh}'], p: [0,0,0,0], d: ['Giving away gently used coats, all sizes. Meet at {street}.','Community fridge fully stocked. Take what you need.','Rice, beans, canned goods. Saturdays at the church on {street}.','Notebooks, pens, backpacks. First come first served.'] },
    { sub: 'local-business', t: ['New bakery on {street} — grand opening!','{biz} now open in {nh}','Support local: {place} on {street}','Small business Saturday — {nh}'], p: [0,0,0,0], d: ['Doors open Saturday. Free samples all weekend.','Excited to serve the neighborhood. Stop by!','Family owned, been here 15 years. Show some love.','20+ local vendors, food, and live music.'] },
  ],
  'rentals-lending': [
    { sub: 'party-event', t: ['Folding tables + chairs — rent for event','Tent rental for backyard party','PA system + speakers — weekend rental'], p: [50,100,75], d: ['10 tables, 40 chairs. Delivery available in {nh}.','10x20 white canopy. Setup included.','Perfect for block parties, events. Pickup in {nh}.'] },
    { sub: 'sports-outdoor', t: ['Kayak rental — weekend','Camping gear set — rent','Ski equipment rental — full set'], p: [40,35,50], d: ['Tandem kayak + paddles + life jackets.','Tent, sleeping bags, stove. Everything you need.','Skis, boots (size 10), poles. One weekend.'] },
  ],
  barter: [
    { sub: 'goods-for-goods', t: ['Trade: KitchenAid for bike','Swap: PS5 for Switch + cash','Trade: records for concert tix'], p: [0,0,0], d: ['Red stand mixer for commuter bike.','PS5 disc for Switch OLED + $100.','50+ jazz/soul for live music tix.'] },
    { sub: 'skills-for-skills', t: ['Trade: Spanish for guitar lessons','Swap: photography for web design'], p: [0,0], d: ['Native speaker. Want guitar. Weekly.','Pro photographer needs a website.'] },
  ],
  rentals: [
    { sub: 'tools-equipment', t: ['Power drill rental $15/day','Pressure washer — rent','Table saw — weekend rental'], p: [15,50,75], d: ['DeWalt 20V. Charger included.','2000 PSI. Patios, decks.','10 inch. You pickup, you return.'] },
    { sub: 'cameras-gear', t: ['Sony A7III + lens, $75/day','GoPro Hero 12 — weekend'], p: [75,30], d: ['Full frame. 2 batteries.','Waterproof. Mounts included.'] },
  ],
  personals: [
    { sub: 'activity-partners', t: ['Running partner — Central Park','Tennis partner — weekdays','Hiking buddy — weekends','Board game group — {nh}','Photography walk partner'], p: [0,0,0,0,0], d: ['Training for half marathon. 8-9 min pace.','Intermediate. 7am. Public courts.','Day trips. Car available.','Weekly. Catan, Ticket to Ride. All welcome.','Exploring with cameras. Casual.'] },
    { sub: 'missed-connections', t: ['Blue jacket, L train — Lorimer','Coffee shop conversation — {nh}','Dog park — Tompkins Square'], p: [0,0,0], d: ['You were reading Murakami. We made eye contact.','Saturday morning. You had a latte. We talked jazz.','Your corgi is Biscuit. My mutt is Chaos. Walk together?'] },
  ],
  resumes: [
    { sub: 'software-engineering', t: ['Full Stack Dev — 5 yrs exp','Frontend Engineer — React/Next','Backend Dev — Python/Django'], p: [0,0,0], d: ['React, Node, PostgreSQL. Looking for hybrid or remote role in NYC.','3 years React, TypeScript. Portfolio available.','4 years Python, REST APIs, AWS. Open to contract or FTE.'] },
    { sub: 'creative-media', t: ['Graphic Designer — 7 yrs','Videographer/Editor — Freelance','Content Creator — Social Media'], p: [0,0,0], d: ['Adobe Suite, Figma. Brand identity, print, digital.','Final Cut, DaVinci. Events, promos, docs.','Instagram, TikTok, YouTube. Strategy + execution.'] },
  ],
}

// ─── Reply templates ───

export const REPLY_POOL = [
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
  'facts.',
  'this is the one fr',
  'ngl I been saying this for years',
  'yoooo I needed this info thank u',
  'W post',
  'bro THANK YOU',
  'say less im going tomorrow',
  'ong this is accurate',
  'no because WHY did nobody tell me about this sooner',
  'ur doing gods work posting this',
  'I respectfully disagree but appreciate you sharing your perspective.',
  'As a longtime resident, I can confirm this is accurate. Been here 30 years.',
  'My husband and I will definitely check this out. Thank you for the suggestion.',
  'Would this be suitable for children? I have a 4-year-old.',
  'What a wonderful thing to share with the community. Thank you kindly.',
  'omg yes yes yes!! this is SO good!!!',
  'FINALLY someone said it lmao',
  'ok but have yall tried the one on the next block tho? even better imo',
  'tbh I had a mid experience but maybe Ill give it another shot',
  'Noted. Thanks.',
  'Interesting.',
  'lol only in NYC would this be a thing',
  'I brought my mother here last week and she loved it. That says everything.',
  'Do they deliver? Asking for my lazy self.',
  'been here 20 years and I STILL learn new stuff from this app',
  'screenshotted this whole thread lol',
  'Whoever posted this is a real one. Respect.',
  'im showing this to literally everyone I know',
  'Anyone want to go together? DM me.',
  'Wait is this the same place that was on the news?',
  'ok adding this to my list',
  'My abuela swears by this place. Good enough for me.',
  'How did I not know about this?? I live 2 blocks away!',
  'the neighborhood really came through on this one',
  'Big ups to the OP for posting this. Community info like this is everything.',
  'I took my kids here and they had a blast. Highly recommend for families.',
  'As a small business owner in the area, its nice to see neighbors supporting each other like this.',
  'Genuine question — is there parking nearby?',
  'This post just made my day ngl',
  'idk about this one but I respect the recommendation',
  'Saving this for later. Good lookin out.',
  'My grandkids would love this. Thank you for sharing.',
  'wait WHAT. how long has this been here and nobody told me',
  'top tier post right here',
  'bumping this bc more ppl need to see it',
  'tysm!!!',
  'Real recognize real. Good post.',
  'Yep. Can confirm. Been there done that.',
  'Someone finally said what we were all thinking.',
]
