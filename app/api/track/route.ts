import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

function classifySource(referrer: string): string {
  if (!referrer) return 'Direct'
  try {
    const host = new URL(referrer).hostname.toLowerCase()
    if (/google\./i.test(host)) return 'Google'
    if (/bing\./i.test(host)) return 'Bing'
    if (/duckduckgo\./i.test(host)) return 'DuckDuckGo'
    if (host === 'chatgpt.com' || host === 'chat.openai.com') return 'ChatGPT'
    if (host === 'claude.ai') return 'Claude'
    if (host === 'perplexity.ai' || host === 'www.perplexity.ai') return 'Perplexity'
    if (/facebook\.|fb\.com/i.test(host)) return 'Facebook'
    if (/youtube\./i.test(host)) return 'YouTube'
    if (host === 'x.com' || host === 't.co' || /twitter\./i.test(host)) return 'X/Twitter'
    if (/reddit\./i.test(host)) return 'Reddit'
    if (host === 'ecosia.org' || host === 'www.ecosia.org') return 'Ecosia'
    if (/search\.yahoo\./i.test(host)) return 'Yahoo'
    if (/thenycclassifieds\.com/i.test(host)) return 'Internal'
    return host
  } catch {
    return 'Direct'
  }
}

function classifyDevice(screenWidth?: number): string {
  if (typeof screenWidth === 'number') {
    if (screenWidth < 768) return 'Mobile'
    if (screenWidth < 1024) return 'Tablet'
    return 'Desktop'
  }
  return 'Desktop'
}

async function hashVisitor(ip: string): Promise<string> {
  const date = new Date().toISOString().slice(0, 10)
  const data = new TextEncoder().encode(ip + date)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers)

    if (!rateLimit(`track:${ip}`, 30, 60_000)) {
      return new NextResponse(null, { status: 429 })
    }

    const body = await request.json()
    const path: string = body.path || '/'
    const referrer: string = body.referrer || ''
    const screenWidth: number | undefined = body.screenWidth
    const type: string = body.type || 'pageview'

    // Skip admin and API paths
    if (path.startsWith('/admin') || path.startsWith('/api')) {
      return new NextResponse(null, { status: 204 })
    }

    const db = getSupabaseAdmin()
    const visitorHash = await hashVisitor(ip)

    // Client-side event tracking
    if (type === 'event' && body.event) {
      db.from('user_events').insert({
        event_type: body.event,
        path,
        details: body.details || {},
        ip,
        visitor_hash: visitorHash,
      })

      return new NextResponse(null, { status: 204 })
    }

    // Page view tracking — record all views, classify internal nav as Direct
    const rawSource = classifySource(referrer)
    const referrerSource = rawSource === 'Internal' ? 'Direct' : rawSource

    const deviceType = classifyDevice(screenWidth)
    const country = request.headers.get('x-vercel-ip-country') || null
    const city = request.headers.get('x-vercel-ip-city') || null

    // Fire-and-forget insert
    db.from('page_views').insert({
      path,
      referrer: referrer || null,
      referrer_source: referrerSource,
      device_type: deviceType,
      visitor_hash: visitorHash,
      country,
      city,
    })

    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse(null, { status: 204 })
  }
}
