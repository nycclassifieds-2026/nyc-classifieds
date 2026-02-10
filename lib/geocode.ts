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
 */
export async function searchAddresses(query: string): Promise<AddressSuggestion[]> {
  const encoded = encodeURIComponent(query)
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=5&countrycodes=us&viewbox=${NYC_VIEWBOX}&bounded=1&addressdetails=1`,
    {
      headers: { 'User-Agent': 'NYCClassifieds/1.0' },
    }
  )

  if (!res.ok) return []

  const data = await res.json()
  return data.map((item: { display_name: string; lat: string; lon: string }) => ({
    display_name: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }))
}
