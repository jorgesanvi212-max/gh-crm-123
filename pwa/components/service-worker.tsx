'use client'

import { useEffect } from 'react'

// Registra el service worker mínimo (solo la página sin conexión) y lleva a /offline si se pierde la red.
export function ServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => {})
    }
    const goOffline = () => {
      // Navegación completa a propósito: así la intercepta el service worker y sirve la copia guardada.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      if (window.location.pathname !== '/offline') window.location.assign('/offline')
    }
    window.addEventListener('offline', goOffline)
    return () => window.removeEventListener('offline', goOffline)
  }, [])
  return null
}
