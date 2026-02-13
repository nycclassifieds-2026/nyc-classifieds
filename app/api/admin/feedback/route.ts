import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin, logAdminAction } from '@/lib/admin-auth'
import { sendEmail } from '@/lib/email'
import { feedbackReplyEmail } from '@/lib/email-templates'
import { createNotification } from '@/lib/notifications'

const VALID_STATUSES = ['new', 'read', 'in_progress', 'resolved', 'dismissed']

// GET — list feedback (paginated, filterable by status)
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, 'moderator')
  if (auth instanceof NextResponse) return auth

  const { searchParams } = request.nextUrl
  const status = searchParams.get('status') || 'new'
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = 50
  const offset = (page - 1) * limit

  const db = getSupabaseAdmin()
  const { data: items, count, error } = await db
    .from('feedback')
    .select('*, user:users!feedback_user_id_fkey(id, email, name), replier:users!feedback_replied_by_fkey(id, email, name)', { count: 'exact' })
    .eq('status', status)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 })
  }

  return NextResponse.json({ items: items || [], total: count || 0, page, limit })
}

// PATCH — update status or reply
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request, 'moderator')
  if (auth instanceof NextResponse) return auth

  const body = await request.json()
  const { id } = body

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  // Reply operation
  if (body.reply !== undefined) {
    const replyText = body.reply?.trim()
    if (!replyText) {
      return NextResponse.json({ error: 'Reply text required' }, { status: 400 })
    }

    const { data: feedback } = await db.from('feedback').select('*, user:users!feedback_user_id_fkey(id, email, name)').eq('id', id).single()
    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
    }

    await db.from('feedback').update({
      admin_reply: replyText,
      replied_by: auth.id,
      replied_at: new Date().toISOString(),
      status: 'resolved',
    }).eq('id', id)

    await logAdminAction(request, auth.email, 'admin_reply_feedback', 'feedback', id, { reply: replyText })

    // Notify user (in-app + email)
    const feedbackUser = feedback.user as { id: number; email: string; name: string | null } | null
    if (feedbackUser?.id) {
      await createNotification(
        feedbackUser.id,
        'feedback_reply',
        'Your feedback got a reply',
        replyText.length > 100 ? replyText.slice(0, 100) + '...' : replyText,
        '/notifications',
      )
    }

    const notifyEmail = feedbackUser?.email || feedback.email
    if (notifyEmail && !notifyEmail.endsWith('@example.com')) {
      sendEmail(notifyEmail, feedbackReplyEmail(
        feedbackUser?.name || 'there',
        feedback.category,
        replyText,
      )).catch(() => {})
    }

    return NextResponse.json({ updated: true })
  }

  // Status update operation
  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    await db.from('feedback').update({ status: body.status }).eq('id', id)
    await logAdminAction(request, auth.email, 'admin_update_feedback_status', 'feedback', id, { status: body.status })

    return NextResponse.json({ updated: true })
  }

  return NextResponse.json({ error: 'No operation specified' }, { status: 400 })
}
