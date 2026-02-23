#!/usr/bin/env node
/** Create 2,000 seed users. Run: node scripts/seed-users-only.mjs */
const SUPABASE_URL = 'https://vpeozixllzdwzqniopfn.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZW96aXhsbHpkd3pxbmlvcGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY3MTQwNiwiZXhwIjoyMDg2MjQ3NDA2fQ.U9w4ZqhUiFDHTjH4taLGfH5Y9a2trsEH-BqLV__znq0'
const H = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }

function pick(a) { return a[Math.floor(Math.random()*a.length)] }
function rb(a,b) { return a+Math.floor(Math.random()*(b-a+1)) }
function nhName(s) { return s.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) }
function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') }

const BOROUGHS = {
  manhattan: { lat:40.7831, lng:-73.9712, nhs:['alphabet-city','battery-park-city','carnegie-hill','chelsea','chinatown','east-harlem','east-village','financial-district','flatiron','gramercy','greenwich-village','hamilton-heights','harlem','hells-kitchen','hudson-yards','inwood','kips-bay','koreatown','lenox-hill','lincoln-square','little-italy','lower-east-side','manhattan-valley','meatpacking-district','midtown-east','midtown-west','morningside-heights','murray-hill','noho','nolita','roosevelt-island','soho','stuyvesant-town','sugar-hill','times-square','tribeca','two-bridges','upper-east-side','upper-west-side','washington-heights','west-village'] },
  brooklyn: { lat:40.6782, lng:-73.9442, nhs:['bay-ridge','bed-stuy','bensonhurst','boerum-hill','borough-park','brighton-beach','brooklyn-heights','brownsville','bushwick','canarsie','carroll-gardens','clinton-hill','cobble-hill','coney-island','crown-heights','downtown-brooklyn','dumbo','dyker-heights','east-new-york','flatbush','fort-greene','greenpoint','kensington','midwood','park-slope','prospect-heights','red-hook','sheepshead-bay','sunset-park','williamsburg'] },
  queens: { lat:40.7282, lng:-73.7949, nhs:['astoria','bayside','bellerose','briarwood','college-point','corona','douglaston','elmhurst','far-rockaway','flushing','forest-hills','fresh-meadows','glen-oaks','howard-beach','jackson-heights','jamaica','kew-gardens','little-neck','long-island-city','maspeth','middle-village','ozone-park','rego-park','ridgewood','rockaway-beach','st-albans','sunnyside','whitestone','woodhaven','woodside'] },
  bronx: { lat:40.8448, lng:-73.8648, nhs:['belmont','concourse','fordham','highbridge','hunts-point','kingsbridge','morris-park','mott-haven','norwood','pelham-bay','riverdale','south-bronx','throgs-neck','tremont','wakefield'] },
  'staten-island': { lat:40.5795, lng:-74.1502, nhs:['annadale','eltingville','great-kills','huguenot','new-dorp','princes-bay','st-george','stapleton','tompkinsville','tottenville'] },
}
const BW = [...Array(35).fill('manhattan'),...Array(30).fill('brooklyn'),...Array(20).fill('queens'),...Array(10).fill('bronx'),...Array(5).fill('staten-island')]

const NAMES = {
  hispanic: { first:['Carlos','Maria','Luis','Rosa','Miguel','Carmen','Jose','Ana','Diego','Sofia','Alejandro','Isabella','Fernando','Valentina','Ricardo','Lucia','Gabriel','Elena','Javier','Camila','Eduardo','Daniela','Roberto','Adriana','Marcos','Patricia','Hector','Yolanda','Raul','Marisol','Pedro','Gloria','Oscar','Beatriz','Manuel','Silvia','Jorge','Alicia'], last:['Rodriguez','Santos','Garcia','Martinez','Lopez','Rivera','Cruz','Gomez','Diaz','Morales','Torres','Vargas','Castillo','Herrera','Reyes','Flores','Medina','Ramirez','Ortiz','Delgado'] },
  black: { first:['Marcus','Aaliyah','Terrence','Keisha','Andre','Tamika','Malik','Jasmine','DeShawn','Imani','Jamal','Ebony','Kwame','Tanya','Dante','Aisha','Cornell','Simone','Rashid','Monique','Darius','Latoya','Malcolm','Nia','Elijah','Zara','Isaiah','Destiny','Kendrick','Brianna'], last:['Williams','Johnson','Brown','Davis','Wilson','Jackson','Thomas','Taylor','Moore','Harris','Robinson','Walker','Allen','Young','King','Wright','Hill','Scott','Green','Adams'] },
  asian: { first:['Wei','Mei','Jin','Soo-Min','Chen','Li','Min-Jun','Jia','Hiroshi','Yuki','Kenji','Sakura','Takeshi','Yuna','Akira','Haruki'], last:['Chen','Wang','Li','Zhang','Liu','Yang','Kim','Park','Choi','Jeon','Lee','Wu','Huang','Lin'] },
  south_asian: { first:['Raj','Priya','Deepak','Ananya','Ravi','Nisha','Vikram','Sunita','Arjun','Leela','Amir','Fatima','Sanjay','Meera','Dev','Kavitha'], last:['Patel','Singh','Sharma','Gupta','Kumar','Shah','Mohammed','Hassan','Ali','Ibrahim'] },
  caribbean: { first:['Winston','Marcia','Desmond','Claudette','Errol','Beverley','Lennox','Sonia','Clive','Donna'], last:['Campbell','Stewart','Brown','Williams','Thomas','Henry','Clarke','Francis'] },
  middle_eastern: { first:['Omar','Layla','Karim','Nadia','Tariq','Yasmin','Hassan','Leila','Samir','Dina'], last:['Mohammed','Hassan','Ali','Ibrahim','Ahmed','Khalil','Mansour','Haddad'] },
  eastern_euro: { first:['Dmitri','Natasha','Pavel','Katarina','Ivan','Olga','Andrei','Svetlana','Nikolai','Tatiana'], last:['Volkov','Petrov','Ivanov','Kuznetsov','Popov','Kowalski','Nowak','Wojcik'] },
  italian: { first:['Tony','Gina','Sal','Vinny','Angela','Frankie','Dominic','Carmela','Anthony','Lucia'], last:['Rossi','Colombo','Romano','Ricci','Russo','Esposito','Bianchi','Moretti'] },
  irish: { first:['Liam','Siobhan','Connor','Bridget','Declan','Erin','Brendan','Fiona','Niall','Ciara'], last:['Murphy','Kelly','OBrien','Sullivan','Walsh','Fitzgerald','Byrne','Ryan'] },
  white_other: { first:['Michael','Sarah','James','Jennifer','David','Amanda','Brian','Megan','Kevin','Katie','Patrick','Nicole','Tim','Lauren','Sean','Emily'], last:['Miller','Anderson','Clark','Lewis','Hall','Baker','Nelson','Carter','Mitchell','Perez'] },
}
const DW = [...Array(29).fill('hispanic'),...Array(24).fill('black'),...Array(14).fill('asian'),...Array(7).fill('south_asian'),...Array(4).fill('caribbean'),...Array(3).fill('middle_eastern'),...Array(3).fill('eastern_euro'),...Array(6).fill('italian'),...Array(4).fill('irish'),...Array(6).fill('white_other')]
const STREETS = ['1st Ave','2nd Ave','3rd Ave','Broadway','Lexington Ave','Madison Ave','Park Ave','5th Ave','6th Ave','7th Ave','Atlantic Ave','Flatbush Ave','Bedford Ave','Grand St','Houston St','Bleecker St','23rd St','42nd St','72nd St','125th St']
const STYLES = ['avataaars','personas','adventurer','big-ears','lorelei','notionists','open-peeps','thumbs','bottts','fun-emoji','micah','miniavs']
const BIZ_CATS = ['Auto Shop','Bakery','Bar & Lounge','Barbershop','Beauty Salon','Cafe','Catering','Cleaning Service','Construction','Consulting','Deli & Bodega','Dog Walker','Electrician','Fitness Studio','Florist','Food Truck','Handyman','IT Services','Law Firm','Locksmith','Moving Company','Nail Salon','Painter','Pet Grooming','Photographer','Plumber','Restaurant','Tailor','Yoga Studio']

async function main() {
  console.log('Creating 2,000 seed users...')
  let created = 0

  for (let batch = 0; batch < 40; batch++) {
    const rows = []
    for (let i = 0; i < 50; i++) {
      const demo = pick(DW)
      const pool = NAMES[demo]
      const first = pick(pool.first)
      const last = pick(pool.last)
      const name = `${first} ${last}`
      const email = `${first.toLowerCase()}.${last.toLowerCase()}${rb(100,9999)}@example.com`
      const borough = pick(BW)
      const b = BOROUGHS[borough]
      const nh = pick(b.nhs)
      const lat = b.lat + (Math.random() - 0.5) * 0.02
      const lng = b.lng + (Math.random() - 0.5) * 0.02
      const isBiz = Math.random() < 0.15
      const bizName = isBiz ? `${last}'s ${pick(['Shop','Studio','Services','Co','Solutions','Place','Kitchen','Works'])}` : null
      const bizCat = isBiz ? pick(BIZ_CATS) : null

      rows.push({
        email, name, pin: '$2b$10$placeholder',
        address: `${rb(1,999)} ${pick(STREETS)}, New York, NY`,
        lat, lng,
        selfie_url: `https://api.dicebear.com/7.x/${pick(STYLES)}/svg?seed=${encodeURIComponent(name+'-'+batch*50+i)}&size=200`,
        selfie_geolat: lat, selfie_geolon: lng,
        verified: true,
        account_type: isBiz ? 'business' : 'personal',
        business_name: bizName,
        business_slug: bizName ? slug(bizName + '-' + nh) : null,
        business_category: bizCat,
        business_description: bizCat ? `Local ${bizCat.toLowerCase()} serving ${nhName(nh)} and surrounding neighborhoods.` : null,
      })
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'POST', headers: H, body: JSON.stringify(rows),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error(`  ERR batch ${batch}: ${err.slice(0,200)}`)
      continue
    }
    created += 50
    if (created % 200 === 0) process.stdout.write(`  ${created}...`)
  }

  console.log(`\nDone! Created ${created} users.`)
}

main().catch(err => { console.error(err); process.exit(1) })
