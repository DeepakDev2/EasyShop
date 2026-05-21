import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import MobileNav from '@/components/layout/MobileNav'

export const metadata: Metadata = {
  title: 'EasyShop — India\'s Best Online Shopping',
  description: 'Shop for mobiles, electronics, fashion, home & more at best prices on EasyShop.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased pb-16 md:pb-0">
        <Providers>
          {children}
          <MobileNav />
        </Providers>
      </body>
    </html>
  )
}
