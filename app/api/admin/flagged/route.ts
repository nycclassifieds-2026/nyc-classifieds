import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

// GET — list flagged content
export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get('status') || 'pending'

  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('flagged_content')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }

  return NextResponse.json({ items: data || [] })
}

// PATCH — update flagged item status
export async function PATCH(request: NextRequest) {
  const { id, status } = await request.json()

  if (!id || !['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  await db.from('flagged_content').update({ status }).eq('id', id)

  return NextResponse.json({ updated: true })
}
