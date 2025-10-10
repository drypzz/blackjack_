import type { Metadata } from 'next'

import { Geist, Geist_Mono } from 'next/font/google'

import { Footer } from '@/app/components/Footer'

import { Providers } from '@/app/providers'

import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'MZ2K Bet - Cassino Online',
  description: 'Desenvolvido por GL Code Lab',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='pt-BR' className="h-full">
      <body suppressHydrationWarning={true} className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col h-full`}>
        <Providers>
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}