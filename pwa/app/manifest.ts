import type { MetadataRoute } from 'next'

// TECHNICAL_SPEC.md §14
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CRM-123 Supervisor',
    short_name: 'CRM-123',
    lang: 'es-ES',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    theme_color: '#1E6B45',
    background_color: '#F7F8F7',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
