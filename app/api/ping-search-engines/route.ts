import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thenycclassifieds.com'
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, 'admin')
  if (auth instanceof NextResponse) return auth

  const results: Record<string, string> = {}

  // Ping Google
  try {
    const r = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`)
    results.google = r.ok ? 'ok' : `${r.status}`
  } catch {
    results.google = 'failed'
  }

  // Ping IndexNow (Bing, Yandex, etc.)
  try {
    const key = process.env.INDEXNOW_KEY
    if (key) {
      const r = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: new URL(SITE_URL).hostname,
          key,
          urlList: [
            `${SITE_URL}/business`,
            SITE_URL,
          ],
        }),
      })
      results.indexnow = r.ok ? 'ok' : `${r.status}`
    } else {
      results.indexnow = 'no key configured'
    }
  } catch {
    results.indexnow = 'failed'
  }

  return NextResponse.json({ results, sitemap: SITEMAP_URL })
}
