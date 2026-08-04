import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import { siteMetadata } from '@/metadata'
import './globals.css'

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin']
})

export const metadata: Metadata = siteMetadata

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col [--header-height:--spacing(12)] [--main-full-height:calc(100vh-var(--header-height))] [&_button]:cursor-pointer [&_a]:cursor-pointer">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
