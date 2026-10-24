import { Suspense } from 'react'
import { requireProfile } from '@/lib/auth/require-profile'
import { FlashToast } from '@/components/flash-toast'
import { MobileFrame } from '@/components/mobile-frame'
import { TabBar } from '@/components/tab-bar'

// Armazón de la PWA: contenido + barra inferior [Equipo · Usuarios · Resumen · Más].
export default async function AppLayout({ children }: LayoutProps<'/'>) {
  await requireProfile()

  return (
    <MobileFrame>
      <main className="flex flex-1 flex-col">{children}</main>
      <TabBar />
      <Suspense>
        <FlashToast />
      </Suspense>
    </MobileFrame>
  )
}
