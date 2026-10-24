import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { ServiceWorker } from '@/components/service-worker'
import './globals.css'

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: { default: 'CRM-123 Supervisor', template: '%s · CRM-123' },
  applicationName: 'CRM-123 Supervisor',
  appleWebApp: { capable: true, title: 'CRM-123', statusBarStyle: 'default' },
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#1E6B45',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es-ES" className={inter.variable}>
      <body className="min-h-dvh bg-bg">
        {children}
        <Toaster />
        <ServiceWorker />
      </body>
    </html>
  )
}
