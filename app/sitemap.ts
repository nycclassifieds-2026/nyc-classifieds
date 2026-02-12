import type { MetadataRoute } from 'next'
import { boroughs, categories, neighborhoodSlug, slugify, porchPostTypes } from '@/lib/data'
import { getAllSlugs as getBlogSlugs } from '@/lib/blog-posts'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thenycclassifieds.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()
  const entries: MetadataRoute.Sitemap = []

  // Homepage
  entries.push({ url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 })

  // Category pages: /listings/housing (12)
  for (const cat of categories) {
    entries.push({
      url: `${SITE_URL}/listings/${cat.slug}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    })

    // Subcategory pages: /listings/housing/apartments (~200)
    for (const sub of cat.subs) {
      entries.push({
        url: `${SITE_URL}/listings/${cat.slug}/${slugify(sub)}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
      })
    }
  }

  // Borough pages: /manhattan (5)
  for (const b of boroughs) {
    entries.push({
      url: `${SITE_URL}/${b.slug}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    })

    // Borough + category: /manhattan/housing (60)
    for (const cat of categories) {
      entries.push({
        url: `${SITE_URL}/${b.slug}/${cat.slug}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.7,
      })
    }

    // Neighborhood pages: /manhattan/east-village (~126)
    for (const n of b.neighborhoods) {
      const nhSlug = neighborhoodSlug(n)
      entries.push({
        url: `${SITE_URL}/${b.slug}/${nhSlug}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
      })

      // Neighborhood + category: /manhattan/east-village/housing (~1,560)
      for (const cat of categories) {
        entries.push({
          url: `${SITE_URL}/${b.slug}/${nhSlug}/${cat.slug}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.6,
        })

        // Neighborhood + subcategory: /manhattan/east-village/housing/apartments (~26,000)
        for (const sub of cat.subs) {
          entries.push({
            url: `${SITE_URL}/${b.slug}/${nhSlug}/${cat.slug}/${slugify(sub)}`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.5,
          })
        }
      }
    }
  }

  // ── The Porch ──

  // /porch (1)
  entries.push({ url: `${SITE_URL}/porch`, lastModified: now, changeFrequency: 'daily', priority: 0.9 })

  // /porch/[borough] (5)
  for (const b of boroughs) {
    entries.push({
      url: `${SITE_URL}/porch/${b.slug}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    })

    // /porch/[borough]/[neighborhood] (~126)
    for (const n of b.neighborhoods) {
      const nhSlug = neighborhoodSlug(n)
      entries.push({
        url: `${SITE_URL}/porch/${b.slug}/${nhSlug}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
      })

      // /porch/[borough]/[neighborhood]/[postType] (~1,512)
      for (const pt of porchPostTypes) {
        entries.push({
          url: `${SITE_URL}/porch/${b.slug}/${nhSlug}/${pt.slug}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      }
    }
  }

  // Business directory
  entries.push({ url: `${SITE_URL}/business`, lastModified: now, changeFrequency: 'daily', priority: 0.9 })

  // Blog index + all posts
  entries.push({ url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 })
  for (const slug of getBlogSlugs()) {
    entries.push({
      url: `${SITE_URL}/blog/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  // Static pages
  for (const page of ['about', 'search', 'legal', 'privacy', 'terms', 'guidelines']) {
    entries.push({
      url: `${SITE_URL}/${page}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    })
  }

  return entries
}
