import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, 'moderator')
  if (auth instanceof NextResponse) return auth

  const db = getSupabaseAdmin()

  const [users, listings, messages, pendingFlags, porchPosts, porchReplies, recentAudit] = await Promise.all([
    db.from('users').select('id', { count: 'exact', head: true }),
    db.from('listings').select('id', { count: 'exact', head: true }),
    db.from('messages').select('id', { count: 'exact', head: true }),
    db.from('flagged_content').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    db.from('porch_posts').select('id', { count: 'exact', head: true }),
    db.from('porch_replies').select('id', { count: 'exact', head: true }),
    db.from('audit_log').select('*').order('created_at', { ascending: false }).limit(10),
  ])

  return NextResponse.json({
    stats: {
      users: users.count || 0,
      listings: listings.count || 0,
      messages: messages.count || 0,
      pendingFlags: pendingFlags.count || 0,
      porchPosts: porchPosts.count || 0,
      porchReplies: porchReplies.count || 0,
    },
    recentActivity: recentAudit.data || [],
  })
}
