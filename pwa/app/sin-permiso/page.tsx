import type { Metadata } from 'next'
import { Monitor } from 'lucide-react'
import { LogoutButton } from '@/components/logout-button'
import { MobileFrame } from '@/components/mobile-frame'

export const metadata: Metadata = { title: 'Solo supervisores' }

// El proxy ya ha cerrado la sesión del vendedor; "Salir" vuelve a la pantalla de acceso.
export default function SinPermisoPage() {
  return (
    <MobileFrame data-screen-label="Solo supervisores" className="justify-center gap-4 px-6 py-8">
      <Monitor className="size-9 text-primary" aria-hidden="true" />
      <p className="m-0 text-xl font-semibold">Esta aplicación es solo para supervisores. Usa CRM-123 en el ordenador.</p>
      <LogoutButton className="flex h-12 w-full items-center justify-center gap-2 rounded-[8px] border border-border-input bg-surface font-semibold" />
    </MobileFrame>
  )
}
