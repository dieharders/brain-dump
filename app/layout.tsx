import { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import '@/app/globals.css'
import { fontMono, fontSans } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { TailwindIndicator } from '@/components/core/tailwind-indicator'
import { Providers } from '@/components/core/providers'
import { Header } from '@/components/features/layout/header'
import { GlobalEvents } from '@/components/core/global-events'

export const metadata: Metadata = {
  title: 'Obrew Studio - Build your Ai',
  description: 'A tool for building Ai agents and automated workflows on your device.',
  applicationName: 'Obrew Studio',
  metadataBase: new URL('https://studio.openbrewai.com'),
  alternates: {
    canonical: 'https://studio.openbrewai.com',
  },
  keywords: ['ai', 'agents', 'localai', 'text-generation', 'inference-engine'],
  // twitter: { card: 'summary', images: [{ url: cardWide.src }] },
  openGraph: {
    title: 'Obrew Studio - Free & private Ai builder',
    description: 'Build private Ai on your device. No subscriptions or limits.',
    url: 'https://studio.openbrewai.com',
    siteName: 'Obrew Studio',
    type: 'website',
    locale: 'en_US',
    // images: [
    //   {
    //     url: cardWide.src,
    //     alt: "Obrew logo and title",
    //     width: cardWide.width,
    //     height: cardWide.height,
    //   },
    // ],
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/icon-192.png',
    apple: '/icon-180.png.png',
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn('font-sans antialiased', fontSans.variable, fontMono.variable)}>
        <Toaster />
        <Providers attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen flex-col">
            <GlobalEvents />
            <Header />
            <main className="flex flex-1 flex-col items-center justify-evenly bg-background">{children}</main>
          </div>
          <TailwindIndicator />
        </Providers>
      </body>
    </html>
  )
}
