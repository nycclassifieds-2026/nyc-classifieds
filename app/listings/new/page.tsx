import type { Metadata } from 'next'
import PostListingClient from './PostListingClient'

export const metadata: Metadata = {
  title: 'Post a Listing',
}

export default function PostListingPage() {
  return <PostListingClient />
}
