import type { Metadata } from 'next'
import ListingDetailClient from './ListingDetailClient'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  return { title: `Listing #${id}` }
}

export default async function ListingDetailPage({ params }: { params: Promise<{ category: string; id: string }> }) {
  const { id } = await params
  return <ListingDetailClient id={id} />
}
