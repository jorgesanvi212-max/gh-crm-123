import { Suspense } from 'react'
import { requireProfile } from '@/lib/auth/require-profile'
import { USER_ROLE } from '@/lib/labels'
import { AppSidebar } from '@/components/app-sidebar'
import { FlashToast } from '@/components/flash-toast'

// Armazón del escritorio: barra lateral fija de 220 px + contenido.
export default async function AppLayout({ children }: LayoutProps<'/'>) {
  const { profile } = await requireProfile()

  return (
    <div className="grid h-screen grid-cols-[220px_minmax(0,1fr)]">
      {/* Hito 2: sin consultas de datos; el contador de vencidas llega en el Hito 3. */}
      <AppSidebar fullName={profile.full_name} roleLabel={USER_ROLE[profile.role]} overdue={0} />
      <main className="flex h-screen min-w-0 flex-col overflow-auto">{children}</main>
      <Suspense>
        <FlashToast />
      </Suspense>
    </div>
  )
}
