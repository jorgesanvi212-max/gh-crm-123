import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Sin conexión' }
export const dynamic = 'force-static'

// Página estática que el service worker guarda y muestra sin red. Estilos en línea y un enlace
// (no un botón con JavaScript) para que funcione aunque no se hayan podido cargar los recursos.
export default function OfflinePage() {
  return (
    <div
      data-screen-label="Sin conexión"
      style={{
        minHeight: '100dvh',
        maxWidth: 480,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 14,
        padding: 32,
        background: '#F7F8F7',
        color: '#1C2420',
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
        fontSize: 16,
      }}
    >
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#5B655F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20h.01" />
        <path d="M8.5 16.429a5 5 0 0 1 7 0" />
        <path d="M5 12.859a10 10 0 0 1 5.17-2.69" />
        <path d="M19 12.859a10 10 0 0 0-2.007-1.523" />
        <path d="M2 8.82a15 15 0 0 1 4.177-2.643" />
        <path d="M22 8.82a15 15 0 0 0-11.288-3.764" />
        <path d="m2 2 20 20" />
      </svg>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>Sin conexión.</h1>
      <p style={{ margin: 0, color: '#5B655F' }}>Revisa tu red e inténtalo de nuevo.</p>
      {/* Navegación completa a propósito: sin red no hay JavaScript de Next.js disponible. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a
        href="/"
        style={{
          height: 48,
          borderRadius: 8,
          background: '#1E6B45',
          color: '#FFFFFF',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
        }}
      >
        Reintentar
      </a>
    </div>
  )
}
