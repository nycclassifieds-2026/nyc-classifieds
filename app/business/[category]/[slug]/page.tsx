'use client'

import { use } from 'react'
import BusinessProfileClient from './BusinessProfileClient'

export default function BusinessProfilePage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = use(params)

  return <BusinessProfileClient slug={slug} category={category} />
}
