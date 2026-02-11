import type { Metadata } from 'next'
import Link from 'next/link'
import { buildMetadata, breadcrumbSchema, SITE_NAME, SITE_URL } from '@/lib/seo'
import { blogPosts } from '@/lib/blog-posts'

export const metadata: Metadata = buildMetadata({
  title: `Blog — ${SITE_NAME}`,
  description: 'News, stories, and updates from NYC Classifieds. Learn about our features, verification process, community, and what makes us different.',
  path: '/blog',
})

function blogListSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Blog — ${SITE_NAME}`,
    description: 'News, stories, and updates from NYC Classifieds.',
    url: `${SITE_URL}/blog`,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: blogPosts.length,
      itemListElement: blogPosts.map((post, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/blog/${post.slug}`,
        name: post.title,
      })),
    },
  }
}

export default function BlogIndexPage() {
  const schemas = [
    blogListSchema(),
    breadcrumbSchema([{ name: 'Blog', url: '/blog' }]),
  ]

  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 20px 64px', fontFamily: "'DM Sans', sans-serif" }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Blog</h1>
        <p style={{ fontSize: '1.125rem', color: '#4b5563', marginBottom: '40px', lineHeight: 1.6 }}>
          News, stories, and updates from {SITE_NAME}.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {blogPosts.map(post => (
            <article key={post.slug} style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '32px' }}>
              <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                <h2 style={{ fontSize: '1.375rem', fontWeight: 600, color: '#111827', marginBottom: '6px', lineHeight: 1.3 }}>
                  {post.title}
                </h2>
              </Link>
              <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '10px' }}>
                {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                {' '}&middot;{' '}{post.author}
              </div>
              <p style={{ color: '#374151', lineHeight: 1.7, marginBottom: '10px' }}>
                {post.excerpt}
              </p>
              <Link href={`/blog/${post.slug}`} style={{ color: '#2563eb', fontSize: '0.875rem', fontWeight: 500 }}>
                Read more
              </Link>
            </article>
          ))}
        </div>
      </main>
    </>
  )
}
