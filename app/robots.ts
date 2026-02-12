import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thenycclassifieds.com'

const DISALLOW = ['/api/', '/admin/', '/account/', '/messages/', '/notifications/', '/listings/new', '/listings/edit/', '/login', '/signup', '/forgot-pin']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      { userAgent: 'GPTBot', allow: '/', disallow: DISALLOW },
      { userAgent: 'ChatGPT-User', allow: '/', disallow: DISALLOW },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
