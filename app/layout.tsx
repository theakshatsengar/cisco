import './global.css'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Navbar } from './components/nav'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { baseUrl } from './sitemap'
import { auth } from '../auth'
import { SessionProvider } from 'next-auth/react'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'chat with cisco',
    template: '%s | chat with cisco',
  },
  description: 'chat with cisco.',
  openGraph: {
    title: 'chat with cisco',
    description: 'chat with cisco.',
    url: baseUrl,
    siteName: 'chat with cisco',
    locale: 'en_in',
    type: 'website',
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
}

const cx = (...classes) => classes.filter(Boolean).join(' ')

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  return (
    <html
      lang="en"
      className={cx(
        'text-black bg-white dark:text-white dark:bg-black',
        GeistSans.variable,
        GeistMono.variable
      )}
    >
      <body className="antialiased max-w-xl mx-4 mt-8 lg:mx-auto">
        <SessionProvider session={session}>
          <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
            {session && <Navbar session={session} />}
            {children}
            <Analytics />
            <SpeedInsights />
          </main>
        </SessionProvider>
      </body>
    </html>
  )
}
