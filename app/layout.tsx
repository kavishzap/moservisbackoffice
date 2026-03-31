import type { Metadata, Viewport } from 'next'
import { ZOTSERVIS_LOGO_BG } from '@/lib/brand'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'ZotServis Back Office System',
  description: 'ZotServis back office for worker and operations management',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: ZOTSERVIS_LOGO_BG,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Toaster richColors position="top-right" />
        <Analytics />
      </body>
    </html>
  )
}
