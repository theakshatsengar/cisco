import './global.css'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Footer from './components/footer'
import { baseUrl } from './sitemap'
import { AuthProvider } from './providers'
import Nav from './components/nav'
import Sidebar from './components/sidebar'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'cisco',
    template: 'your ai pookie.',
  },
  description: 'your ai pookie.',
  openGraph: {
    title: 'cisco',
    description: 'your ai pookie.',
    url: baseUrl,
    siteName: 'cisco',
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
  icons: {
    icon: '/favicon.png',
  },
}

const cx = (...classes) => classes.filter(Boolean).join(' ')

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={cx(
        'text-black bg-white dark:text-white dark:bg-black',
        GeistSans.variable,
        GeistMono.variable
      )}
    >
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="flex min-h-screen w-full bg-background">
        <AuthProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col md:ml-20">
            <Nav />
            <main className="flex flex-col items-center justify-center min-h-screen w-full">
              <div className="w-full max-w-2xl px-4 flex flex-col flex-1 justify-center items-center">
                {children}
                <Footer />
                <Analytics />
                <SpeedInsights />
              </div>
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
