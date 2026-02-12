import type { Metadata } from 'next'
import PostListingClient from './PostListingClient'

export const metadata: Metadata = {
  title: 'Post a Listing',
  robots: { index: false, follow: false },
}

export default function PostListingPage() {
  return <PostListingClient />
}
