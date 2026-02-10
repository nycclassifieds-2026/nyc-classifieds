import type { Metadata } from 'next'
import { Suspense } from 'react'
import SearchClient from './SearchClient'

export const metadata: Metadata = {
  title: 'Search Listings',
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>}>
      <SearchClient />
    </Suspense>
  )
}
