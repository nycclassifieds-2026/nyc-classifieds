import type { Metadata } from 'next'
import ThreadClient from './ThreadClient'

export const metadata: Metadata = {
  title: 'Conversation',
}

export default async function ThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params
  return <ThreadClient threadId={threadId} />
}
