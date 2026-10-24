import type { Metadata } from 'next'
import { requireProfile } from '@/lib/auth/require-profile'
import { ComingSoon } from '@/components/coming-soon'
import { ScreenBody, ScreenHeader } from '@/components/screen-header'

export const metadata: Metadata = { title: 'Usuarios' }

// Se construye en el Hito 4.
export default async function UsuariosPage() {
  await requireProfile()
  return (
    <>
      <ScreenHeader title="Usuarios" />
      <ScreenBody>
        <ComingSoon />
      </ScreenBody>
    </>
  )
}
