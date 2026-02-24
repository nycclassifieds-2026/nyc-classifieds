#!/usr/bin/env node
/**
 * Coverage backfill — ensures every subcategory has 10+ quality listings.
 *
 * For subcategories WITH templates: uses existing rich templates.
 * For subcategories WITHOUT templates: uses generic per-category templates
 * that adapt to any subcategory with realistic descriptions.
 *
 * Run: node scripts/seed-coverage.mjs
 */

const SUPABASE_URL = 'https://vpeozixllzdwzqniopfn.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZW96aXhsbHpkd3pxbmlvcGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY3MTQwNiwiZXhwIjoyMDg2MjQ3NDA2fQ.U9w4ZqhUiFDHTjH4taLGfH5Y9a2trsEH-BqLV__znq0'

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal',
}

const TARGET_PER_SUB = 10

// ─── Helpers ───
function pick(a) { return a[Math.floor(Math.random() * a.length)] }
function pickN(a, n) { return [...a].sort(() => Math.random() - 0.5).slice(0, n) }
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
const BOROUGH_WEIGHTS = [
  ...Array(35).fill('manhattan'),
  ...Array(30).fill('brooklyn'),
  ...Array(20).fill('queens'),
  ...Array(10).fill('bronx'),
  ...Array(5).fill('staten-island'),
]

const STREETS = ['1st Ave','2nd Ave','3rd Ave','Broadway','Lexington Ave','Madison Ave','Park Ave','Amsterdam Ave','Columbus Ave','5th Ave','6th Ave','7th Ave','8th Ave','Atlantic Ave','Flatbush Ave','DeKalb Ave','Myrtle Ave','Bedford Ave','Grand St','Delancey St','Houston St','Bleecker St','14th St','23rd St','34th St','42nd St','57th St','72nd St','86th St','96th St','110th St','125th St','145th St','Fordham Rd','Tremont Ave','Ditmars Blvd','Steinway St','Jamaica Ave','Queens Blvd','Northern Blvd','Roosevelt Ave','Victory Blvd','Hylan Blvd']
const TRAINS = ['A','C','E','B','D','F','M','N','Q','R','W','1','2','3','4','5','6','7','G','J','Z','L']
const CITIES = ['Boston','Chicago','LA','Miami','Philly','DC','Atlanta','Portland','Denver','Seattle','Austin','San Francisco','Dallas','Nashville','Minneapolis','New Orleans','Pittsburgh','Baltimore']

// ─── All categories and subcategories (from data.ts) ───
const CATEGORIES = {
  housing: ['Apartments', 'Apartments Wanted', 'Co-working', 'For Sale / Real Estate', 'Parking & Storage', 'Real Estate Wanted', 'Rooms & Shared', 'Sublets'],
  jobs: ['Accounting & Finance', 'Admin & Office', 'AI & Machine Learning', 'Architecture & Design', 'Biotech & Pharma', 'Cannabis Industry', 'Construction', 'Creative & Media', 'Customer Service', 'Cybersecurity', 'Data Science', 'Delivery & Logistics', 'Education & Teaching', 'Engineering', 'Fashion & Apparel', 'Film & TV Production', 'Fitness & Wellness', 'Food & Beverage', 'Government', 'Healthcare', 'Hotel & Tourism', 'Human Resources', 'Legal', 'Marketing & Advertising', 'Nonprofit', 'Nursing', 'Operations & Warehouse', 'Part-time', 'Property Management', 'Real Estate', 'Remote / Hybrid', 'Restaurant & Hospitality', 'Retail', 'Sales', 'Security', 'Social Work', 'Software Engineering', 'Sustainability & Green', 'Tech & Engineering', 'Trades & Skilled Labor', 'Transportation', 'Writing & Editing'],
  'for-sale': ['Appliances', 'Art & Prints', 'Baby & Kids', 'Bikes', 'Books & Media', 'Building Materials', 'Cameras & Photo', 'Cars & Trucks', 'Cell Phones', 'Clothing & Accessories', 'Collectibles', 'Computer Parts', 'E-bikes & Scooters', 'Electronics', 'Free Stuff', 'Furniture', 'Gaming & Consoles', 'Handbags & Wallets', 'Health & Beauty', 'Home Decor', 'Instruments', 'Jewelry & Watches', 'Kitchen & Dining', 'Motorcycles', 'Office Equipment', 'Outdoor & Camping', 'Power Tools', 'Sneakers & Streetwear', 'Sporting Goods', 'Toys & Games', 'Vinyl & Records', 'Vintage & Antiques'],
  services: ['AI & Automation', 'Appliance Repair', 'Auto Repair', 'Beauty & Hair', 'Bike Repair', 'Carpentry', 'Catering', 'Childcare & Nanny', 'Cleaning', 'Content Creation', 'DJ & Entertainment', 'E-bike & Scooter Repair', 'Electrical', 'Flooring', 'Graphic Design', 'Handyman', 'Home Organizing', 'HVAC & Heating', 'Interior Design', 'Junk Removal', 'Legal', 'Locksmith', 'Massage & Wellness', 'Meal Prep', 'Moving & Hauling', 'Music Lessons', 'Notary', 'Painting', 'Personal Training', 'Pest Control', 'Pet Grooming', 'Photography', 'Plant Care', 'Plumbing', 'Smart Home Setup', 'Social Media Mgmt', 'Soundproofing', 'Tailoring', 'Tax & Accounting', 'Tutoring', 'TV Mounting', 'Videography', 'Web & App Dev', 'Window Cleaning'],
  gigs: ['Background & Extra Work', 'Bartending', 'Brand Ambassador', 'Catering Help', 'Cleaning', 'Closet Organizing', 'Content Creation', 'Data Entry', 'Delivery Runs', 'Dog Walking', 'Errand Running', 'Event Setup', 'Flyer & Promo', 'Focus Groups', 'Furniture Assembly', 'Grocery Shopping', 'House Sitting', 'Line Waiting', 'Market Research', 'Moving Help', 'Packing & Unpacking', 'Painting', 'Personal Shopping', 'Pet Sitting', 'Photography', 'Snow Shoveling', 'Tech Help', 'Translation', 'Video Editing', 'Warehouse Help'],
  community: ['Carpool & Rideshare', 'Events', 'Garage Sales', 'Groups', 'Local Alerts', 'Lost & Found', 'Neighborhood Questions', 'Pet Sightings', 'Recommendations', 'Seasonal', 'Shoutouts', 'Stoop Sales', 'Volunteers', 'Welcome / New Here'],
  tickets: ['Broadway', 'Comedy', 'Concerts', 'Festivals', 'Resale', 'Sports'],
  pets: ['Adoption', 'Dog Walking', 'Grooming', 'Lost & Found Pets', 'Pet Sitting'],
  personals: ['Activity Partners', 'Missed Connections', 'Strictly Platonic'],
  barter: ['Goods for Goods', 'Goods for Skills', 'Skills for Skills'],
  rentals: ['Cameras & Gear', 'Party Supplies', 'Sports Equipment', 'Tools & Equipment'],
  resumes: ['Accounting & Finance', 'Admin & Office', 'AI & Data Science', 'Architecture & Design', 'Biotech & Pharma', 'Construction', 'Creative & Media', 'Customer Service', 'Cybersecurity', 'Education & Teaching', 'Engineering', 'Fashion', 'Film & TV', 'Fitness & Wellness', 'Food & Hospitality', 'Healthcare', 'Human Resources', 'Legal', 'Marketing & Advertising', 'Nonprofit', 'Nursing', 'Operations', 'Real Estate', 'Retail', 'Sales', 'Social Work', 'Software Engineering', 'Tech', 'Trades & Skilled Labor', 'Transportation', 'Writing & Editing'],
}

// ─── Generic templates per category ───
// These work for ANY subcategory by inserting the subcategory name into the text.

const GENERIC_TEMPLATES = {
  jobs: [
    { t: 'Hiring: {sub} — {nh}', d: 'We are looking to fill a {sub} position at our company in {nh}. This is a great opportunity for someone with experience in this field who wants to work with a team that actually values its people. Competitive salary based on experience, health insurance after 90 days, and a work environment where you are treated like a professional not a number. We have been in business for over 10 years and we are growing. If you are reliable, skilled, and want to be somewhere long-term, we want to hear from you. Apply by sending your resume and a brief intro about yourself' },
    { t: '{sub} — immediate opening, {nh}', d: 'Immediate opening for a {sub} role in {nh}. We need someone who can start within the next two weeks and hit the ground running. Experience in {sub} is preferred but we are willing to train the right person who shows initiative and has a good attitude. Full-time position, Monday through Friday, with some flexibility on hours. Pay is competitive for the market and depends on what you bring to the table. We are a small team where everyone matters and your work actually has an impact. Come meet us and see if its a fit' },
    { t: '{sub} professional wanted', d: 'Looking for an experienced {sub} professional to join our team near {street} in {nh}. This is a real opportunity with a company that has been operating in NYC for years. We offer competitive pay, benefits, and most importantly a workplace where people actually enjoy coming in. The right candidate has at least 2 years of relevant experience and can work independently without someone looking over their shoulder. Interview process is simple — come in, meet the team, show us what you know. We dont do 5-round interviews here' },
    { t: '{sub} — part-time or full-time, {nh}', d: 'We have both part-time and full-time {sub} positions available at our location in {nh}. Flexible scheduling where possible, competitive hourly rate, and a team environment that is genuinely supportive. Whether you are looking for something to supplement your income or a full-time career move, we can work with your situation. Must be reliable — thats the number one requirement. Everything else can be taught. Located near the {train} train, easy commute from anywhere in the city' },
    { t: '{sub} — growing company in {nh}', d: 'Our company is expanding and we need {sub} talent. We are based in {nh} near {street} and we have been growing steadily for the past 3 years. The position comes with room to advance — we promote from within and the last 3 people we hired into senior roles started in entry-level positions. Pay is fair, culture is respectful, and you will actually learn skills here. If you have been stuck in a dead-end role and want something with upward trajectory, this might be it. Send us a message with your background' },
    { t: '{sub} needed — great team, {nh}', d: 'We are hiring for {sub} at our {nh} location. What makes us different from posting number 400 on this site? Our team actually gets along. We do lunch together, we help each other out, and nobody watches the clock. The work is steady, the pay is competitive, and we treat people right. Experience is a plus but attitude matters more to us. If you show up, work hard, and treat your coworkers with respect, you will do well here. Come see for yourself' },
    { t: 'Experienced {sub} — {nh} area', d: 'Seeking an experienced {sub} professional for a position in the {nh} area. Minimum 3 years of experience required for this role. We are a well-established company with a strong reputation and we need someone who can represent us professionally. Compensation includes a competitive salary, health benefits, paid time off, and performance bonuses. Our current team members have been with us an average of 5 years which tells you something about how we treat people. Serious professionals only' },
    { t: '{sub} — no experience needed, {nh}', d: 'Entry-level {sub} position available in {nh}. No experience required — we will train you from scratch. What we need is someone who is dependable, willing to learn, and has a positive attitude. This is a great opportunity if you are just starting out in this field or looking to switch careers. We have trained dozens of people who went on to build real careers from this starting point. Pay starts at a fair rate and increases as you develop your skills. Near {street}, easy commute' },
    { t: '{sub} position — benefits included, {nh}', d: 'Full-time {sub} position available with full benefits package including health insurance, dental, vision, paid holidays, and PTO. Located in {nh} near the {train} train. We are looking for someone who takes pride in their work and wants to be part of a team that operates with integrity. Our company has been serving the NYC area for over a decade and we have a strong track record. If you are tired of jobs that promise benefits and never deliver, this is different. Come see for yourself' },
    { t: 'Join our {sub} team — {nh}', d: 'We are building out our {sub} team in {nh} and looking for motivated people at all experience levels. Whether you are just getting started or have years under your belt, we have a role that might fit. The company culture is collaborative, the management is approachable, and the work is meaningful. We are located near {street} with easy access to public transit. Competitive compensation that reflects your experience and contribution. Reach out with a brief introduction and we will set up a time to chat' },
  ],

  'for-sale': [
    { t: '{sub} — great condition, {nh}', d: 'Selling my {sub} in great condition. I have taken good care of it and it works exactly as it should. The reason Im selling is simple — I either dont need it anymore or Im upgrading and this one deserves a new home where it will actually get used. Located in {nh} near {street}, you pick up. Cash, Venmo, or Zelle all work for me. Happy to send more photos or answer any questions. Price is fair for what youre getting and I am open to reasonable offers if you come ready to pick up' },
    { t: '{sub} — moving sale, {nh}', d: 'Moving out of my apartment in {nh} and selling my {sub}. It is in good shape and has served me well but I cant take everything with me. Would rather sell it to someone who needs it than have it end up on the sidewalk. You pick up from my building near {street}. Priced to sell because I need it gone before the end of the month. First come first served. Send me a message and I can get you more details and photos' },
    { t: '{sub} — barely used, {nh}', d: 'Selling {sub} that I barely used. Bought it with good intentions and then life happened and it has been sitting in my apartment taking up space. It is essentially in new condition with minimal signs of use. Located in {nh}, you pick up. Im pricing it well below what I paid because I just want it gone at this point. Can meet near the {train} station if that works better for you. Serious buyers please, I respond to messages quickly' },
    { t: '{sub} for sale — {nh}', d: 'Have a {sub} for sale in {nh}. Everything works and its in solid condition. Im not going to pretend its brand new but its well-maintained and has plenty of life left. Selling because I realized I dont use it as much as I thought I would when I bought it. Located near {street}. Price is negotiable within reason — Im not trying to get rich off this, just trying to find it a new home. Can provide more info and photos if youre interested' },
    { t: '{sub} — priced to sell, {nh}', d: 'Priced to sell — {sub} in {nh}. I looked up what these go for used and priced mine below the average because I want it gone this week. No major issues, just normal wear from regular use. Everything functions as it should. You come to me near {street} to pick it up. I can help you get it to your car if needed. Cash or digital payment at pickup. Message me and Ill send you photos and dimensions or whatever details you need to make a decision' },
    { t: '{sub} — like new, {nh}', d: 'This {sub} is in like-new condition. I am one of those people who takes care of their things maybe a little too much. Barely any signs of use. Selling because I upgraded and dont need two. Located in {nh} near the {train} line. You pick up — my building has an elevator so getting it out is easy. The price reflects the condition. Im firm on it because at this price its already a great deal compared to buying new. Message me if interested' },
    { t: 'Free {sub} — must pick up, {nh}', d: 'Free {sub} to whoever wants it. Nothing wrong with it, I just dont need it anymore and I would rather give it away than throw it out. Its in decent shape with some cosmetic wear but fully functional. You have to come get it from my place in {nh} near {street}. Im available this weekend for pickup. First person to show up gets it. Please actually come if you say you will — I dont want to hold it for someone who ghosts', priceOverride: 0 },
    { t: '{sub} — excellent deal, {nh}', d: 'Selling my {sub} at what I think is an excellent deal for anyone in the market. I did my research on what these sell for and I am pricing mine competitively because I want a quick sale. It is in good working condition with everything you need. Located in {nh}, pickup near {street}. Im flexible on timing and can do evenings or weekends. Cash preferred but Venmo works too. Send me a message and I can get back to you with photos and specifics' },
  ],

  services: [
    { t: '{sub} — {nh} area', d: 'Professional {sub} services available in {nh} and surrounding areas. I have been doing this work in NYC for years and my clients keep coming back which I think says more than any ad could. I take pride in doing quality work and I communicate clearly throughout the process — no surprises, no hidden fees, no ghosting after you pay. Free estimates available. Whether its a small job or something bigger, I treat every project like its my own home. Give me a call or send a message and lets figure out what you need' },
    { t: 'Affordable {sub} — {nh}', d: 'Quality {sub} services at prices that wont make you cry. Based in {nh} near {street} and serving all five boroughs. I keep my overhead low so I can pass the savings on to my clients instead of charging Manhattan rates for simple work. Fully licensed and insured. I show up on time, I do clean work, and I dont leave until youre satisfied. References available from clients in your neighborhood. Text or call me and I will get back to you the same day, usually within an hour' },
    { t: '{sub} professional — licensed, {nh}', d: 'Licensed and insured {sub} professional serving {nh} and the greater NYC area. Over 10 years of experience working in New York apartments, houses, and commercial spaces. I have seen every situation and I know how to handle it right the first time. My rates are fair and I am transparent about costs before any work begins. Same-day and emergency service available for urgent situations. Most of my business comes from word of mouth and repeat clients, and I would love to add you to that list. Call or text anytime' },
    { t: '{sub} — fast and reliable, {nh}', d: 'Need {sub} done right and done fast? I have been providing {sub} services in {nh} and throughout NYC for years. What sets me apart is simple: I show up when I say I will, I do the job properly, and I charge a fair price. No surprise fees, no dragging things out, no excuses. I bring my own equipment and supplies so you dont have to worry about anything. Free estimates — I will come look at the job and give you an honest quote before you commit to anything. Near {street}' },
    { t: 'Expert {sub} — serving {nh}', d: 'Expert {sub} services available in {nh} and nearby neighborhoods. I have built my business entirely on referrals and repeat customers, which means I can not afford to do anything less than excellent work. Every job gets my full attention whether its the smallest thing or a major project. I am responsive, professional, and I clean up after myself. My schedule fills up but I always try to accommodate new clients. Reach out and tell me what you need — even if its just a question, happy to advise' },
    { t: '{sub} services — free estimate, {nh}', d: 'Offering {sub} services in {nh} with free estimates and no obligation. I believe the work should speak for itself, which is why I am happy to come look at your situation and give you an honest assessment before you spend a dime. Been doing this in NYC for over 8 years. I am not the cheapest option and I am not the most expensive — I am the one who does it right. Licensed, insured, and I answer my phone. Located near {street} but I travel throughout the city' },
  ],

  gigs: [
    { t: 'Need help with {sub} — {nh}', d: 'Looking for someone to help with {sub} in {nh}. This is a straightforward gig — show up, do good work, get paid same day in cash. Shouldn\'t take more than a few hours. I am easy to work with and I respect your time. Near {street} area. If youre reliable and available this week, send me a message with your availability. Can be a recurring thing if it goes well and you do good work. No experience necessary, just a good attitude and willingness to help' },
    { t: '{sub} gig — quick cash, {nh}', d: 'Quick cash opportunity for {sub} work in {nh}. Paying above average because I value good help and I dont want to waste time finding someone twice. The job is simple and shouldnt take long. Cash payment at the end. Located near {street}, easy to get to from the {train}. If you are looking for some extra money this week and you are dependable, this is an easy gig. Message me and Ill give you all the details. Flexible on scheduling' },
    { t: '{sub} — this weekend, {nh}', d: 'Need someone for a {sub} gig this weekend in {nh}. A few hours of work, paying fairly for the time. I will explain exactly what needs to be done when you get here — nothing complicated, just need an extra pair of hands. Cash at the end of the job. Near {street}. Ive hired people through here before and its always been a good experience. Just show up when you say you will and do honest work. Thats all I ask. Text me and we will set up a time' },
    { t: '{sub} help wanted — {nh}', d: 'Looking for someone to help with {sub} near {street} in {nh}. This is honest work for fair pay, nothing sketchy. I need help because I either dont have the time or the extra hands to do it myself. Shouldn\'t take more than 2-3 hours. Paying cash same day. If you do good work I will definitely reach out again for future gigs. Please be on time and communicative — that is literally the main thing. Available mornings, afternoons, or evenings, whatever works for you' },
    { t: '{sub} — {nh}, paid same day', d: 'Gig available for {sub} in {nh}. Paid same day, cash or Venmo, your choice. The work is straightforward and I will walk you through everything when you arrive. All I need is someone who is reliable and shows up when they say they will. Near the {train} station so getting here is easy. Should take a couple hours depending on how fast you work. If youre looking for a quick gig that actually pays fairly, this is it. DM me with when youre free' },
  ],

  community: [
    { t: '{sub} — {nh}', d: 'Posting this for the {nh} community regarding {sub}. If you live in the area near {street} this is relevant to you. I have been in this neighborhood for years and I believe in looking out for each other. Please share this with your neighbors, building group chats, and anyone who might find it useful. The more connected we are as a neighborhood, the better {nh} gets for everyone. Feel free to reach out if you have questions or want to get involved. We are all in this together' },
    { t: '{sub} update — {nh}', d: 'Update for the {nh} community about {sub}. I wanted to share this because I think its important for people in the neighborhood to know. We live in an incredible community and the more informed we are, the better decisions we can make together. Pass this along to your neighbors near {street} and beyond. If you have additional information to add, please share in the comments. This is what community is about — keeping each other in the loop and supporting one another' },
    { t: '{sub} in {nh} — getting involved', d: 'This is about {sub} in {nh} and I wanted to put it out there because not enough people know about it. Whether you have lived here for decades or just moved in last week, this affects our neighborhood. I am near {street} and happy to chat more about this with anyone who is interested. The community vibe in {nh} is one of the best things about living here and I want to help keep it that way. Reach out if you want to connect or contribute' },
  ],

  tickets: [
    { t: '2 tickets — {sub} event', d: 'Selling 2 tickets to a {sub} event that I unfortunately cant attend anymore. Work schedule changed at the last minute and there is no way to make it work. These are legitimate tickets purchased through an official vendor — I can show you the receipt and transfer them immediately through the app. Selling at face value because I am not a scalper, just someone who doesnt want good tickets going to waste. Can meet in {nh} or do a digital transfer. This is going to be a great event, dont miss it' },
    { t: '{sub} tickets — below face, {nh}', d: 'Two tickets to a {sub} event, selling below face value because I just want them gone at this point. Plans fell through and these have been sitting in my account making me sad every time I see them. Legit tickets, official purchase, will transfer through the platform so everything is safe and verified. Located in {nh}, happy to meet up or do it all digitally. These are good seats and you are getting a deal. First person to message me gets them' },
    { t: '{sub} — great seats available', d: 'Got great seats for an upcoming {sub} event and my plans changed unexpectedly. These are the kind of seats I spent real time selecting and I hate that they are going to waste. Selling at what I paid — check the venue website and you will see this is a fair price. Can do an instant transfer through the ticketing platform so you have them in your account within minutes. Located in {nh} if you prefer to meet in person. Dont let these go empty' },
  ],

  pets: [
    { t: '{sub} — {nh}', d: 'Reaching out to the {nh} community about {sub}. If you are a pet owner or animal lover in the area near {street}, this is for you. I take this seriously because our pets are family and they deserve the best care and attention we can give them. Located in {nh} near the {train}. Please reach out if you can help or if you have any information. Sharing this post with your neighbors and local friends would be incredibly appreciated. Every bit helps' },
    { t: '{sub} in {nh} area', d: 'Posting about {sub} in the {nh} area. I am located near {street} and this is urgent/important to me. If you are a pet person in this neighborhood, please take a moment to read this and share it with others. I have been in {nh} for years and the pet community here is wonderful — lets keep looking out for each other and our four-legged family members. DM me for more details or if you have questions. Thank you in advance to anyone who can help' },
  ],

  personals: [
    { t: '{sub} — {nh}', d: 'Looking for {sub} in {nh}. I am putting myself out there because NYC is massive and sometimes you just have to make an effort instead of waiting for things to happen organically. I am a normal person with a job, hobbies, and a life — I am not weird I promise. I live near {street} and I am usually free on evenings and weekends. If this sounds like something you are interested in, send me a message and lets chat. No pressure, no expectations, just seeing if we click. Coffee first is always a good start' },
    { t: '{sub} — new to {nh}', d: 'Recently moved to {nh} and looking for {sub}. I came from {city} and I am still figuring out the social scene here. NYC has 8 million people and somehow its hard to meet the right ones. I live near {street} and I am open to whatever this turns into. If you are also looking for {sub} and you are in the area, reach out. I am laid back, easy to talk to, and genuinely just looking to connect with good people in my neighborhood. Life is too short to not try' },
  ],

  barter: [
    { t: '{sub} trade — {nh}', d: 'Looking for a {sub} exchange in {nh}. I believe in the power of trading — its how communities used to work and honestly it makes more sense than everything being about money all the time. I have something to offer and I am looking for something in return that has equivalent value. Located near {street}, happy to meet and discuss the details in person. Open to creative proposals because sometimes the best trades are the ones you didnt expect. Message me with what you have and what you need' },
    { t: '{sub} — looking to swap, {nh}', d: 'Interested in a {sub} swap with someone in {nh} or nearby. I think barter is underrated in this city — there are so many talented people with things to offer and we should be connecting more often. Everything I am offering is in good condition and I expect the same in return. Fair trade, no games. Near {street}. Lets talk about what you have and what you need and see if we can make something work that benefits both of us' },
  ],

  rentals: [
    { t: '{sub} rental — {nh}', d: 'Renting out my {sub} for anyone who needs it temporarily. Located in {nh} near {street}. I keep everything in excellent working condition because thats how I would want to receive it. Rates are fair and flexible — daily, weekend, or weekly depending on what you need. ID deposit required which you get back in full when the item is returned in the same condition. I will show you how to use everything if needed, takes about 5 minutes. Message me to reserve a date' },
    { t: '{sub} available to rent — {nh}', d: 'Have {sub} available for rent in {nh}. Why buy something you only need once or twice when you can rent it for a fraction of the price? Everything is well-maintained and ready to go. Pick up and drop off near {street}. Flexible on timing. I have been renting items to people in the neighborhood for a while now and it has always gone smoothly. Reasonable rates and I am easy to work with. Just treat the stuff with respect and we are good. DM for pricing and availability' },
  ],

  resumes: [
    { t: '{sub} professional — seeking opportunities', d: 'Experienced {sub} professional based in NYC looking for new opportunities. I have built my career through dedication, continuous learning, and a genuine passion for this work. My experience spans multiple companies and environments, giving me a well-rounded perspective that I bring to every role. I am open to full-time, contract, or freelance arrangements depending on the right fit. Based in {nh} but willing to commute anywhere in the city or work remote/hybrid. Portfolio, references, and resume available on request. I am looking for a role where I can make a real impact, not just fill a seat' },
    { t: '{sub} — available immediately', d: 'Available immediately for {sub} roles in NYC. I have years of relevant experience and a strong track record of delivering results. What I bring to the table is not just technical ability but also reliability, communication skills, and the kind of work ethic that means I dont need someone looking over my shoulder. Happy to discuss my background over coffee or a call. Based in {nh} near {street} but flexible on location. If you are hiring for {sub} and you want someone who actually cares about doing good work, lets talk' },
    { t: 'Seeking {sub} role — NYC', d: 'Looking for {sub} opportunities in the NYC area. I have been in this field for several years and I am ready for my next challenge. I am the kind of person who takes ownership of their work and goes the extra mile without being asked. My previous employers would tell you I am someone they wished they could have kept. Based in {nh}, open to any arrangement that makes sense — in office, hybrid, remote, contract, whatever. I just want to do good work for good people. Resume and references ready to go' },
  ],

  housing: [
    { t: '{sub} — {nh}', d: 'Available {sub} opportunity in {nh} near {street}. This is a legitimate listing from a real person, not a broker trying to collect a fee. The location is great — close to the {train} train, surrounded by restaurants and shops, and the neighborhood has a genuinely welcoming vibe. I have been in {nh} for a while and can honestly say its a great place to live. Reach out for more details, photos, and to schedule a viewing. Serious inquiries only please, my inbox gets a lot of spam' },
    { t: '{sub} available — {nh}, near {train}', d: '{sub} available in {nh}, walking distance to the {train} train and close to everything you could need. The area around {street} has great food, a grocery store, laundromat, and a park nearby. I am a straightforward person — what you see is what you get, no bait and switch. Rent is fair for the area and the condition of the space. Hit me up to schedule a time to see it. I am responsive to messages and I will not waste your time. Looking for someone responsible and respectful' },
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
  console.log('=== Coverage Backfill — 10 listings per subcategory ===\n')

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

  // 2. Check existing coverage
  console.log('\nChecking existing coverage...')
  const existingRes = await fetch(
    `${SUPABASE_URL}/rest/v1/listings?select=category_slug,subcategory_slug&status=eq.active&limit=50000`,
    { headers }
  )
  const existing = await existingRes.json()

  const coverage = {}
  for (const row of existing) {
    const key = `${row.category_slug}::${row.subcategory_slug}`
    coverage[key] = (coverage[key] || 0) + 1
  }

  // 3. Figure out what needs filling
  let totalNeeded = 0
  let subsNeeding = 0
  const gaps = []

  for (const [catSlug, subs] of Object.entries(CATEGORIES)) {
    for (const subName of subs) {
      const subSlug = slugify(subName)
      const key = `${catSlug}::${subSlug}`
      const have = coverage[key] || 0
      const need = Math.max(0, TARGET_PER_SUB - have)
      if (need > 0) {
        gaps.push({ catSlug, subName, subSlug, have, need })
        totalNeeded += need
        subsNeeding++
      }
    }
  }

  const totalSubs = Object.values(CATEGORIES).reduce((s, a) => s + a.length, 0)
  console.log(`  ${totalSubs} total subcategories`)
  console.log(`  ${totalSubs - subsNeeding} already have ${TARGET_PER_SUB}+ listings`)
  console.log(`  ${subsNeeding} need more listings`)
  console.log(`  ${totalNeeded} total listings to create\n`)

  if (totalNeeded === 0) {
    console.log('All subcategories already have 10+ listings! Nothing to do.')
    return
  }

  // 4. Generate listings for gaps
  console.log('Generating listings...')
  const allListings = []
  const nhIndex = {} // track neighborhoods used per subcategory for variety

  for (const { catSlug, subName, subSlug, need } of gaps) {
    const templates = GENERIC_TEMPLATES[catSlug]
    if (!templates) {
      console.warn(`  SKIP: no generic templates for category '${catSlug}'`)
      continue
    }

    for (let i = 0; i < need; i++) {
      const user = pick(seedUsers)
      const borough = pick(BOROUGH_WEIGHTS)
      const bData = BOROUGHS[borough]

      // Rotate neighborhoods for variety
      const nhKey = `${catSlug}::${subSlug}`
      const idx = nhIndex[nhKey] || 0
      const nh = bData.nhs[idx % bData.nhs.length]
      nhIndex[nhKey] = idx + 1

      const tmpl = templates[i % templates.length] // cycle through templates
      const vars = {
        nh: nhName(nh),
        sub: subName,
        street: pick(STREETS),
        train: pick(TRAINS),
        city: pick(CITIES),
      }

      const lat = bData.lat + (Math.random() - 0.5) * 0.02
      const lng = bData.lng + (Math.random() - 0.5) * 0.02
      const location = `${nhName(nh)}, ${nhName(borough)}`

      // Price: services, jobs, personals, community, resumes, barter = free/negotiable
      // For-sale: random reasonable price
      // Housing: use realistic range
      let price = null
      if (catSlug === 'for-sale' && !tmpl.priceOverride && tmpl.priceOverride !== 0) {
        price = rb(2000, 50000) // $20 to $500
      } else if (catSlug === 'housing') {
        price = rb(100000, 400000) // $1000 to $4000/mo
      } else if (catSlug === 'rentals') {
        price = rb(2000, 15000)
      } else if (catSlug === 'tickets') {
        price = rb(3000, 25000)
      } else if (tmpl.priceOverride === 0) {
        price = null
      }

      allListings.push({
        user_id: user.id,
        title: fill(tmpl.t, vars).slice(0, 200),
        description: fill(tmpl.d, vars).slice(0, 4000),
        price,
        category_slug: catSlug,
        subcategory_slug: subSlug,
        images: [],
        location,
        lat,
        lng,
        status: 'active',
        expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
        created_at: staggeredTimestamp(rb(0, 14)), // spread across last 2 weeks
      })
    }
  }

  console.log(`  Generated ${allListings.length} listings`)

  // 5. Insert
  console.log('  Inserting...')
  const inserted = await supaInsert('listings', allListings)
  console.log(`  Inserted ${inserted} listings\n`)

  // 6. Summary
  const catBreakdown = {}
  for (const l of allListings) {
    catBreakdown[l.category_slug] = (catBreakdown[l.category_slug] || 0) + 1
  }

  console.log('=== Coverage Backfill Complete ===')
  console.log(`  Total inserted: ${inserted}`)
  console.log('\n  By category:')
  for (const [cat, count] of Object.entries(catBreakdown).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${cat}: ${count}`)
  }
}

main().catch(err => { console.error(err); process.exit(1) })
