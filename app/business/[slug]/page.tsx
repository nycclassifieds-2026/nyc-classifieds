import { RedirectClient } from './RedirectClient'

export default async function OldBusinessProfileRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <RedirectClient slug={slug} />
}
