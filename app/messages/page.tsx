import type { Metadata } from 'next'
import InboxClient from './InboxClient'

export const metadata: Metadata = {
  title: 'Messages',
}

export default function MessagesPage() {
  return <InboxClient />
}
