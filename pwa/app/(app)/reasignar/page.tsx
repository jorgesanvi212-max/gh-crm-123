import type { Metadata } from 'next'
import { requireProfile } from '@/lib/auth/require-profile'
import { ComingSoon } from '@/components/coming-soon'
import { ScreenBody, ScreenHeader } from '@/components/screen-header'

export const metadata: Metadata = { title: 'Reasignar clientes' }

// Se construye en el Hito 4.
export default async function ReasignarPage() {
  await requireProfile()
  return (
    <>
      <ScreenHeader title="Reasignar clientes" backHref="/mas" />
      <ScreenBody>
        <ComingSoon />
      </ScreenBody>
    </>
  )
}
