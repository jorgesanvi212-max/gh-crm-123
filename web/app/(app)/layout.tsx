import { Suspense } from 'react'
import { requireProfile } from '@/lib/auth/require-profile'
import { USER_ROLE } from '@/lib/labels'
import { AppSidebar } from '@/components/app-sidebar'
import { FlashToast } from '@/components/flash-toast'

// Armazón del escritorio: barra lateral fija de 220 px + contenido.
export default async function AppLayout({ children }: LayoutProps<'/'>) {
  const { supabase, profile } = await requireProfile()

  // Contador rojo de Tareas: vencidas por vendedor (RLS: el vendedor solo ve su fila).
  const { data: kpis } = await supabase.from('v_seller_kpis').select('profile_id, tasks_overdue')
  const overdueBySeller = Object.fromEntries((kpis ?? []).map((k) => [k.profile_id, k.tasks_overdue]))

  return (
    <div className="grid h-screen grid-cols-[220px_minmax(0,1fr)]">
      <Suspense>
        <AppSidebar fullName={profile.full_name} roleLabel={USER_ROLE[profile.role]} overdueBySeller={overdueBySeller} />
      </Suspense>
      <main className="flex h-screen min-w-0 flex-col overflow-auto">{children}</main>
      <Suspense>
        <FlashToast />
      </Suspense>
    </div>
  )
}
