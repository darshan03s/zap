import { Metadata } from 'next'
import { env } from './env'

export const APP_NAME = 'Zap'

const APP_DESCRIPTION = 'Component playground'

const APP_KEYWORDS: string[] = []

export const APP_URL = env.NEXT_PUBLIC_APP_URL

export const siteMetadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  keywords: APP_KEYWORDS,
  robots: {
    index: true,
    follow: true
  },
  metadataBase: new URL(APP_URL),
  icons: {
    icon: '/favicon.ico'
  },
  authors: [{ name: APP_NAME, url: APP_URL }],
  creator: 'Darshan S',
  publisher: 'Darshan S',
  applicationName: APP_NAME,
  alternates: {
    canonical: APP_URL
  },
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: APP_URL,
    siteName: APP_NAME,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${APP_URL}/api/og`,
        width: 1200,
        height: 630,
        alt: APP_NAME
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [
      {
        url: `${APP_URL}/api/og-twitter`,
        width: 1200,
        height: 628,
        alt: APP_NAME
      }
    ]
  }
}
