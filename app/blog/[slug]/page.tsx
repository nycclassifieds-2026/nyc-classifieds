import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buildMetadata, breadcrumbSchema, articleSchema, SITE_NAME } from '@/lib/seo'
import { blogPosts, getPostBySlug, getAllSlugs, BLOG_CATEGORIES } from '@/lib/blog-posts'
import BlogPostClient from './BlogPostClient'

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
      { name: post.category, url: '/blog' },
      { name: post.title, url: `/blog/${post.slug}` },
    ]),
  ]

  // Estimate read time
  const wordCount = post.content.split(/\s+/).length
  const readTime = Math.max(1, Math.round(wordCount / 250))

  // Related posts (same category first, then others)
  const related = [
    ...blogPosts.filter(p => p.slug !== post.slug && p.category === post.category),
    ...blogPosts.filter(p => p.slug !== post.slug && p.category !== post.category),
  ].slice(0, 3)

  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <BlogPostClient
        post={post}
        readTime={readTime}
        categories={BLOG_CATEGORIES as unknown as string[]}
        relatedPosts={related}
        allPosts={blogPosts}
      />
    </>
  )
}
