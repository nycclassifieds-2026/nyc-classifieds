import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, 'moderator')
  if (auth instanceof NextResponse) return auth

  const { searchParams } = request.nextUrl
  const action = searchParams.get('action') || ''
  const entity = searchParams.get('entity') || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = 50
  const offset = (page - 1) * limit

  const db = getSupabaseAdmin()
  let query = db
    .from('audit_log')
    .select('*', { count: 'exact' })

  if (action) {
    query = query.eq('action', action)
  }
  if (entity) {
    query = query.eq('entity', entity)
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch audit log' }, { status: 500 })
  }

  return NextResponse.json({ entries: data || [], total: count || 0, page, limit })
}
