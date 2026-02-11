/**
 * Haversine formula — returns distance in miles between two lat/lng points.
 */
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 3959 // Earth radius in miles
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

// NYC bounding box (all 5 boroughs)
const NYC_VIEWBOX = '-74.26,40.49,-73.70,40.92'

/**
 * Expand common NYC address abbreviations so Nominatim can parse them.
 * e.g. "150 w47" → "150 West 47th Street"
 *      "200 e 3" → "200 East 3rd Street"
 *      "50 broadway" → "50 broadway" (no change needed)
 */
function normalizeNYCAddress(input: string): string {
  let q = input.trim()

  // Expand directional + number patterns: "w47", "W 47", "e 3rd", "E. 125" etc.
  q = q.replace(
    /\b([wesn])\.?\s*(\d+)\s*(st|nd|rd|th|street|ave|avenue)?\b/gi,
    (_match, dir: string, num: string, suffix?: string) => {
      const dirs: Record<string, string> = { w: 'West', e: 'East', n: 'North', s: 'South' }
      const expanded = dirs[dir.toLowerCase()] || dir
      // If suffix already indicates avenue, keep it
      if (suffix && /^ave/i.test(suffix)) {
        return `${expanded} ${num} Avenue`
      }
      // Default to Street with ordinal
      return `${expanded} ${num}${ordinalSuffix(parseInt(num))} Street`
    }
  )

  // Expand standalone abbreviations
  q = q.replace(/\bave\b/gi, 'Avenue')
  q = q.replace(/\bblvd\b/gi, 'Boulevard')
  q = q.replace(/\bpkwy\b/gi, 'Parkway')
  q = q.replace(/\bpl\b/gi, 'Place')
  q = q.replace(/\bdr\b/gi, 'Drive')
  q = q.replace(/\bln\b/gi, 'Lane')
  q = q.replace(/\bct\b/gi, 'Court')

  return q
}

function ordinalSuffix(n: number): string {
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 13) return 'th'
  switch (n % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

/**
 * Geocode an address using Nominatim (OpenStreetMap). Free, no API key.
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const normalized = normalizeNYCAddress(address)
  const biased = normalized.toLowerCase().includes('new york') ? normalized : `${normalized}, New York City`
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(biased)}&format=json&limit=1&countrycodes=us&viewbox=${NYC_VIEWBOX}&bounded=1`,
    { headers: { 'User-Agent': 'NYCClassifieds/1.0' } }
  )

  if (!res.ok) return null

  const data = await res.json()
  if (!data.length) return null

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
  }
}

export interface AddressSuggestion {
  display_name: string
  lat: number
  lng: number
}

/**
 * Search for address suggestions within NYC using Nominatim.
 * Uses free-form query with NYC bias for best partial-input results.
 */
export async function searchAddresses(query: string): Promise<AddressSuggestion[]> {
  const normalized = normalizeNYCAddress(query)
  const biased = `${normalized}, New York City`
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(biased)}&format=json&limit=5&countrycodes=us&viewbox=${NYC_VIEWBOX}&bounded=1&addressdetails=1`,
    { headers: { 'User-Agent': 'NYCClassifieds/1.0' } }
  )

  if (!res.ok) return []

  const data: Array<Record<string, unknown>> = await res.json()

  return data
    .filter((item: Record<string, unknown>) => {
      const addr = item.address as Record<string, string> | undefined
      if (addr?.state !== 'New York') return false
      // Filter out vague city/state-level matches that have no street info
      if (!addr.road && !addr.house_number) return false
      return true
    })
    .map((item: Record<string, unknown>) => {
      const a = (item.address || {}) as Record<string, string>
      const parts: string[] = []
      if (a.house_number && a.road) parts.push(`${a.house_number} ${a.road}`)
      else if (a.road) parts.push(a.road)
      // Nominatim often returns "Manhattan Community Board 5" etc. as neighbourhood — skip those
      const hood = (a.neighbourhood && !a.neighbourhood.includes('Community Board')) ? a.neighbourhood
        : (a.suburb && !a.suburb.includes('Community Board')) ? a.suburb : null
      if (hood) parts.push(hood)
      // Prefer borough (e.g. "Manhattan") over city ("New York")
      const boro = (a.borough && !a.borough.includes('Community Board')) ? a.borough : null
      if (boro) parts.push(boro)
      else if (a.city) parts.push(a.city)
      if (a.postcode) parts.push(a.postcode)
      const display = parts.filter(Boolean).join(', ') || (item.display_name as string)
      return {
        display_name: display,
        lat: parseFloat(item.lat as string),
        lng: parseFloat(item.lon as string),
      }
    })
}
