import type { Metadata } from 'next'
import LayoutClient from './LayoutClient'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  themeColor: '#2563eb',
  title: {
    default: 'NYC Classifieds — Free Ads from Verified New Yorkers | Craigslist Alternative',
    template: '%s | The NYC Classifieds',
  },
  description: 'The only NYC classifieds where every user is verified with a live selfie + GPS. Apartments, jobs, services, for sale, gigs & more across 126+ neighborhoods in all 5 boroughs. 100% free to post.',
  keywords: ['NYC classifieds', 'New York City classifieds', 'free classifieds NYC', 'Craigslist NYC alternative', 'apartments NYC', 'jobs NYC', 'for sale NYC', 'services NYC', 'Brooklyn classifieds', 'Manhattan classifieds', 'Queens classifieds', 'Bronx classifieds', 'Staten Island classifieds'],
  openGraph: {
    siteName: 'The NYC Classifieds',
    type: 'website',
    locale: 'en_US',
    title: 'NYC Classifieds — Free Ads from Verified New Yorkers',
    description: 'The only NYC classifieds where every user is verified with a live selfie + GPS. Apartments, jobs, services, for sale & more. 100% free.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NYC Classifieds — Free Ads from Verified New Yorkers',
    description: 'The only NYC classifieds where every user is verified with a live selfie + GPS. 100% free to post.',
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
