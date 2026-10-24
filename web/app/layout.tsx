import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: { default: 'CRM-123', template: '%s · CRM-123' },
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es-ES" className={inter.variable}>
      <body className="min-h-screen bg-bg">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
