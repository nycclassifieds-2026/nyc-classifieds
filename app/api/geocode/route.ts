import { NextRequest, NextResponse } from 'next/server'
import { geocodeAddress } from '@/lib/geocode'
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
