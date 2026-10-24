import type { Metadata } from 'next'
import { requireProfile } from '@/lib/auth/require-profile'
import { ComingSoon } from '@/components/coming-soon'
import { ScreenBody, ScreenHeader } from '@/components/screen-header'

export const metadata: Metadata = { title: 'Nuevo usuario' }

// Se construye en el Hito 4.
export default async function NuevoUsuarioPage() {
  await requireProfile()
  return (
    <>
      <ScreenHeader title="Nuevo usuario" backHref="/usuarios" />
      <ScreenBody>
        <ComingSoon />
      </ScreenBody>
    </>
  )
}
