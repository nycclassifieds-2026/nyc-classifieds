import type { MetadataRoute } from 'next'
import { boroughs, categories, neighborhoodSlug, slugify, porchPostTypes } from '@/lib/data'
import { getAllSlugs as getBlogSlugs } from '@/lib/blog-posts'
import { getSupabaseAdmin } from '@/lib/supabase-server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thenycclassifieds.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString()
  const entries: MetadataRoute.Sitemap = []
  const db = getSupabaseAdmin()

  // ── Query which category+subcategory combos have active listings ──
  const { data: listingCombos } = await db
    .from('listings')
    .select('category_slug, subcategory_slug, location')
    .eq('status', 'active')

  // Build sets of populated slugs
  const populatedCategories = new Set<string>()
  const populatedSubcategories = new Set<string>()  // "cat:sub"
  const populatedLocations = new Set<string>()       // raw location text for matching

  if (listingCombos) {
    for (const row of listingCombos) {
      populatedCategories.add(row.category_slug)
      if (row.subcategory_slug) {
        populatedSubcategories.add(`${row.category_slug}:${row.subcategory_slug}`)
      }
      if (row.location) {
        populatedLocations.add(row.location.toLowerCase())
      }
    }
  }

  // ── Query which borough/neighborhood combos have porch posts ──
  const { data: porchCombos } = await db
    .from('porch_posts')
    .select('borough_slug, neighborhood_slug, post_type')

  const populatedPorchBoroughs = new Set<string>()
  const populatedPorchNeighborhoods = new Set<string>()  // "borough:nh"
  const populatedPorchTypes = new Set<string>()           // "borough:nh:type"

  if (porchCombos) {
    for (const row of porchCombos) {
      populatedPorchBoroughs.add(row.borough_slug)
      populatedPorchNeighborhoods.add(`${row.borough_slug}:${row.neighborhood_slug}`)
      populatedPorchTypes.add(`${row.borough_slug}:${row.neighborhood_slug}:${row.post_type}`)
    }
  }

  // Helper: check if a neighborhood has any listing content
  function nhHasListings(nhName: string, boroughName: string): boolean {
    const needle = nhName.toLowerCase()
    const boroughNeedle = boroughName.toLowerCase()
    for (const loc of populatedLocations) {
      if (loc.includes(needle) && loc.includes(boroughNeedle)) return true
    }
    return false
  }

  // ── Homepage — always included ──
  entries.push({ url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 })

  // ── Category pages — only if category has listings ──
  for (const cat of categories) {
    if (!populatedCategories.has(cat.slug)) continue

    entries.push({
      url: `${SITE_URL}/listings/${cat.slug}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    })

    // Subcategory pages — only if subcategory has listings
    for (const sub of cat.subs) {
      const subSlug = slugify(sub)
      if (!populatedSubcategories.has(`${cat.slug}:${subSlug}`)) continue

      entries.push({
        url: `${SITE_URL}/listings/${cat.slug}/${subSlug}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
      })
    }
  }

  // ── Borough pages — always include (these are hub pages) ──
  for (const b of boroughs) {
    entries.push({
      url: `${SITE_URL}/${b.slug}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    })

    // Borough + category — only if category has listings
    for (const cat of categories) {
      if (!populatedCategories.has(cat.slug)) continue
      entries.push({
        url: `${SITE_URL}/${b.slug}/${cat.slug}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.7,
      })
    }

    // Neighborhood pages — only if neighborhood has content
    for (const n of b.neighborhoods) {
      const nhSlug = neighborhoodSlug(n)
      const hasListings = nhHasListings(n, b.slug.replace(/-/g, ' '))
      const hasPorch = populatedPorchNeighborhoods.has(`${b.slug}:${nhSlug}`)

      if (!hasListings && !hasPorch) continue

      entries.push({
        url: `${SITE_URL}/${b.slug}/${nhSlug}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
      })

      // Neighborhood + category — only if category has content
      if (hasListings) {
        for (const cat of categories) {
          if (!populatedCategories.has(cat.slug)) continue
          entries.push({
            url: `${SITE_URL}/${b.slug}/${nhSlug}/${cat.slug}`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.6,
          })
          // Skip neighborhood+category+subcategory — too granular until we have density
        }
      }
    }
  }

  // ── The Porch — only populated sections ──
  if (populatedPorchBoroughs.size > 0) {
    entries.push({ url: `${SITE_URL}/porch`, lastModified: now, changeFrequency: 'daily', priority: 0.9 })

    for (const b of boroughs) {
      if (!populatedPorchBoroughs.has(b.slug)) continue

      entries.push({
        url: `${SITE_URL}/porch/${b.slug}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
      })

      for (const n of b.neighborhoods) {
        const nhSlug = neighborhoodSlug(n)
        if (!populatedPorchNeighborhoods.has(`${b.slug}:${nhSlug}`)) continue

        entries.push({
          url: `${SITE_URL}/porch/${b.slug}/${nhSlug}`,
          lastModified: now,
          changeFrequency: 'daily',
          priority: 0.8,
        })

        // Post type pages — only if that combo has posts
        for (const pt of porchPostTypes) {
          if (!populatedPorchTypes.has(`${b.slug}:${nhSlug}:${pt.slug}`)) continue
          entries.push({
            url: `${SITE_URL}/porch/${b.slug}/${nhSlug}/${pt.slug}`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.6,
          })
        }
      }
    }
  }

  // ── Business directory — always include ──
  entries.push({ url: `${SITE_URL}/business`, lastModified: now, changeFrequency: 'daily', priority: 0.9 })

  // ── Blog ──
  entries.push({ url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 })
  for (const slug of getBlogSlugs()) {
    entries.push({
      url: `${SITE_URL}/blog/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  // ── Static pages ──
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
