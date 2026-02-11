import type { Metadata } from 'next'
import LayoutClient from './LayoutClient'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  themeColor: '#2563eb',
  title: {
    default: 'The NYC Classifieds — Free Classifieds in New York City',
    template: '%s | The NYC Classifieds',
  },
  description: 'Free local classifieds for New York City. Buy, sell, find housing, jobs, and services from real, geo-verified New Yorkers. Post for free in all 5 boroughs.',
  keywords: ['NYC classifieds', 'New York City classifieds', 'free classifieds NYC', 'apartments NYC', 'jobs NYC', 'for sale NYC', 'services NYC', 'Brooklyn classifieds', 'Manhattan classifieds', 'Queens classifieds', 'Bronx classifieds', 'Staten Island classifieds', 'Craigslist NYC alternative', 'local classifieds New York'],
  openGraph: {
    siteName: 'The NYC Classifieds',
    type: 'website',
    locale: 'en_US',
    title: 'The NYC Classifieds — Free. Real. Local. Verified.',
    description: 'Free local classifieds for New York City. Geo-verified users only. Housing, jobs, services, for sale, community, and more across all 5 boroughs and 126+ neighborhoods.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The NYC Classifieds — Free. Real. Local. Verified.',
    description: 'Free classifieds for New York City. Geo-verified, real New Yorkers only.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://thenycclassifieds.com',
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
