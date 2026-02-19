import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(request),
    })
  }

  const response = NextResponse.next()

  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(self), microphone=(), geolocation=(self)'
  )
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  )
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' https:; connect-src 'self' https:; media-src 'self' https:; frame-src 'self' https:; object-src 'none'; base-uri 'self'"
  )

  const corsHeaders = getCorsHeaders(request)
  for (const [key, value] of Object.entries(corsHeaders)) {
    response.headers.set(key, value)
  }

  return response
}

function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin') || ''
  const isProduction = process.env.NODE_ENV === 'production'

  let allowOrigin: string
  if (isProduction) {
    const prodDomain = process.env.NEXT_PUBLIC_SITE_URL || 'https://thenycclassifieds.com'
    allowOrigin = origin === prodDomain || origin === `https://www.${new URL(prodDomain).hostname}`
      ? origin
      : prodDomain
  } else {
    allowOrigin = origin || '*'
  }

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-access-token',
    'Access-Control-Max-Age': '86400',
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
