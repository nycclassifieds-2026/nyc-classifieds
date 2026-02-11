import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin, logAdminAction } from '@/lib/admin-auth'
import { sendEmail } from '@/lib/email'
import { porchPostRemovedEmail } from '@/lib/email-templates'
import { createNotification } from '@/lib/notifications'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, 'moderator')
  if (auth instanceof NextResponse) return auth

  const { searchParams } = request.nextUrl
  const search = searchParams.get('search') || ''
  const postType = searchParams.get('post_type') || ''
  const borough = searchParams.get('borough') || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = 50
  const offset = (page - 1) * limit

  const db = getSupabaseAdmin()
  let query = db
    .from('porch_posts')
    .select('id, user_id, post_type, title, body, borough_slug, neighborhood_slug, pinned, expires_at, created_at, users!inner(email, name)', { count: 'exact' })

  if (search) {
    query = query.ilike('title', `%${search}%`)
  }
  if (postType) {
    query = query.eq('post_type', postType)
  }
  if (borough) {
    query = query.eq('borough_slug', borough)
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch porch posts' }, { status: 500 })
  }

  // Attach reply counts
  const postIds = (data || []).map(p => p.id)
  let replyCounts: Record<number, number> = {}

  if (postIds.length > 0) {
    const { data: replies } = await db
      .from('porch_replies')
      .select('post_id')
      .in('post_id', postIds)

    if (replies) {
      for (const r of replies) {
        replyCounts[r.post_id] = (replyCounts[r.post_id] || 0) + 1
      }
    }
  }

  const posts = (data || []).map(p => ({
    ...p,
    reply_count: replyCounts[p.id] || 0,
  }))

  return NextResponse.json({ posts, total: count || 0, page, limit })
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request, 'moderator')
  if (auth instanceof NextResponse) return auth

  const { id, pinned } = await request.json()
  if (!id || typeof pinned !== 'boolean') {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  await db.from('porch_posts').update({ pinned }).eq('id', id)
  await logAdminAction(request, auth.email, pinned ? 'admin_pin_porch_post' : 'admin_unpin_porch_post', 'porch_post', id)

  return NextResponse.json({ updated: true })
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request, 'admin')
  if (auth instanceof NextResponse) return auth

  const { id } = await request.json()
  if (!id) {
    return NextResponse.json({ error: 'Post ID required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  // Notify the post author before deleting
  const { data: post } = await db.from('porch_posts').select('title, user_id, users!inner(email, name)').eq('id', id).single()
  if (post) {
    await createNotification(
      post.user_id,
      'porch_post_removed',
      'Your Porch post was removed',
      post.title,
      '/porch',
    )
    const author = post.users as unknown as { email: string; name: string | null }
    if (author?.email && !author.email.endsWith('@example.com')) {
      sendEmail(author.email, porchPostRemovedEmail(author.name || 'there', post.title)).catch(() => {})
    }
  }

  await db.from('porch_posts').delete().eq('id', id)
  await logAdminAction(request, auth.email, 'admin_delete_porch_post', 'porch_post', id)

  return NextResponse.json({ deleted: true })
}
