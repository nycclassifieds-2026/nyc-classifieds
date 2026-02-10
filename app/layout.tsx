import type { Metadata } from 'next'
import LayoutClient from './LayoutClient'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'NYC Classifieds — Buy, Sell & Trade in New York City',
    template: '%s | NYC Classifieds',
  },
  description: 'Verified local classifieds for New York City. Buy, sell, find housing, jobs, and services from real, identity-verified New Yorkers.',
  openGraph: {
    siteName: 'NYC Classifieds',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-to-content">Skip to content</a>
        <LayoutClient>
          <div id="main-content">{children}</div>
        </LayoutClient>
      </body>
    </html>
  )
}
