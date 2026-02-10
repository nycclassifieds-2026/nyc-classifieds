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

/**
 * Geocode an address using the Nominatim (OpenStreetMap) API.
 * Free, no API key required. Rate limited to 1 req/s.
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const encoded = encodeURIComponent(address)
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&countrycodes=us`,
    {
      headers: { 'User-Agent': 'NYCClassifieds/1.0' },
    }
  )

  if (!res.ok) return null

  const data = await res.json()
  if (!data.length) return null

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
  }
}

// NYC bounding box (all 5 boroughs)
const NYC_VIEWBOX = '-74.26,40.49,-73.70,40.92'

export interface AddressSuggestion {
  display_name: string
  lat: number
  lng: number
}

/**
 * Search for address suggestions within NYC using Nominatim.
 * Appends "New York City" to bias results and filters to NY state.
 */
export async function searchAddresses(query: string): Promise<AddressSuggestion[]> {
  const biased = `${query}, New York City`
  const encoded = encodeURIComponent(biased)
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=5&countrycodes=us&viewbox=${NYC_VIEWBOX}&bounded=1&addressdetails=1`,
    {
      headers: { 'User-Agent': 'NYCClassifieds/1.0' },
    }
  )

  if (!res.ok) return []

  const data = await res.json()
  // Filter to only New York state results
  return data
    .filter((item: { address?: { state?: string } }) =>
      item.address?.state === 'New York'
    )
    .map((item: { display_name: string; lat: string; lon: string; address?: { house_number?: string; road?: string; neighbourhood?: string; suburb?: string; city?: string; borough?: string; postcode?: string } }) => {
      // Build a clean short display: "150 W 47th St, Midtown, Manhattan, 10036"
      const a = item.address || {}
      const parts: string[] = []
      if (a.house_number && a.road) parts.push(`${a.house_number} ${a.road}`)
      else if (a.road) parts.push(a.road)
      if (a.neighbourhood || a.suburb) parts.push(a.neighbourhood || a.suburb || '')
      if (a.borough) parts.push(a.borough)
      else if (a.city) parts.push(a.city)
      if (a.postcode) parts.push(a.postcode)
      const display = parts.filter(Boolean).join(', ') || item.display_name
      return {
        display_name: display,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      }
    })
}
