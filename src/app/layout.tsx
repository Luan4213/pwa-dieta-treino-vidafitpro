import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Vida FitPro - Seu Personal Trainer Digital',
  description: 'App completo de dieta e treino com design premium e UX impecável',
  manifest: '/manifest.json',
  themeColor: '#F97316',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Vida FitPro'
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon-192.png'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Vida FitPro" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="font-inter bg-[#0B0F14] text-[#E6EBF2] overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
