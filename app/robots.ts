import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thenycclassifieds.com'

const DISALLOW = ['/api/auth/', '/api/admin/', '/api/account/', '/api/upload/', '/api/push/', '/api/signup-events/', '/api/error-report/', '/api/track/', '/api/flag/', '/api/block/', '/admin/', '/account/', '/messages/', '/notifications/', '/listings/new', '/listings/edit/', '/login', '/signup', '/forgot-pin']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: ['/', '/api/listings', '/api/porch', '/api/businesses', '/api/search'], disallow: DISALLOW },
      { userAgent: 'GPTBot', allow: ['/', '/api/listings', '/api/porch', '/api/businesses', '/api/search'], disallow: DISALLOW },
      { userAgent: 'ChatGPT-User', allow: ['/', '/api/listings', '/api/porch', '/api/businesses', '/api/search'], disallow: DISALLOW },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
