import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buildMetadata, breadcrumbSchema, articleSchema, SITE_NAME } from '@/lib/seo'
import { blogPosts, getPostBySlug, getAllSlugs } from '@/lib/blog-posts'

export function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}

  return buildMetadata({
    title: `${post.title} — ${SITE_NAME}`,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    type: 'article',
  })
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const schemas = [
    articleSchema({
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      datePublished: post.date,
      author: post.author,
    }),
    breadcrumbSchema([
      { name: 'Blog', url: '/blog' },
      { name: post.title, url: `/blog/${post.slug}` },
    ]),
  ]

  // Simple markdown-ish rendering: ## headings, **bold**, paragraphs
  const paragraphs = post.content.split('\n\n')

  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 20px 64px', fontFamily: "'DM Sans', sans-serif" }}>
        <Link href="/blog" style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '24px', display: 'inline-block' }}>
          &larr; Back to Blog
        </Link>

        <article>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', marginBottom: '8px', lineHeight: 1.3 }}>
            {post.title}
          </h1>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '32px' }}>
            {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            {' '}&middot;{' '}{post.author}
          </div>

          <div style={{ color: '#374151', lineHeight: 1.8, fontSize: '1.0625rem' }}>
            {paragraphs.map((para, i) => {
              // ## Heading
              if (para.startsWith('## ')) {
                return (
                  <h2 key={i} style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginTop: '28px', marginBottom: '12px' }}>
                    {para.slice(3)}
                  </h2>
                )
              }

              // Numbered list
              if (/^\d+\.\s/.test(para.split('\n')[0])) {
                const items = para.split('\n').filter(l => l.trim())
                return (
                  <ol key={i} style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                    {items.map((item, j) => (
                      <li key={j} style={{ marginBottom: '6px' }} dangerouslySetInnerHTML={{
                        __html: item.replace(/^\d+\.\s/, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                      }} />
                    ))}
                  </ol>
                )
              }

              // Bullet list
              if (para.startsWith('- ')) {
                const items = para.split('\n').filter(l => l.trim())
                return (
                  <ul key={i} style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                    {items.map((item, j) => (
                      <li key={j} style={{ marginBottom: '6px' }} dangerouslySetInnerHTML={{
                        __html: item.replace(/^- /, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                      }} />
                    ))}
                  </ul>
                )
              }

              // Regular paragraph with bold support
              return (
                <p key={i} style={{ marginBottom: '16px' }} dangerouslySetInnerHTML={{
                  __html: para.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                }} />
              )
            })}
          </div>
        </article>

        <nav style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>More from the blog</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {blogPosts.filter(p => p.slug !== post.slug).slice(0, 3).map(p => (
              <Link key={p.slug} href={`/blog/${p.slug}`} style={{ color: '#2563eb', fontSize: '0.9375rem' }}>
                {p.title}
              </Link>
            ))}
          </div>
        </nav>
      </main>
    </>
  )
}
