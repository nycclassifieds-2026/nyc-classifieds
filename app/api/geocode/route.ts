import { NextRequest, NextResponse } from 'next/server'
import { geocodeAddress, searchAddresses } from '@/lib/geocode'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  if (!rateLimit(`geocode:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { address } = await request.json()
  if (!address || typeof address !== 'string' || address.length < 5) {
    return NextResponse.json({ error: 'Valid address required' }, { status: 400 })
  }

  const result = await geocodeAddress(address)
  if (!result) {
    return NextResponse.json({ error: 'Could not geocode address' }, { status: 404 })
  }

  return NextResponse.json(result)
}

/** Address autocomplete — returns up to 5 NYC suggestions */
export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  if (!rateLimit(`geocode-ac:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const q = request.nextUrl.searchParams.get('q')
  if (!q || q.length < 3) {
    return NextResponse.json([])
  }

  const results = await searchAddresses(q)
  return NextResponse.json(results)
}
