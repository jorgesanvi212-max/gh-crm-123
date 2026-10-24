import type { Metadata } from 'next'
import { requireProfile } from '@/lib/auth/require-profile'
import { ComingSoon } from '@/components/coming-soon'
import { PageBody } from '@/components/page-body'
import { PageHeader } from '@/components/page-header'

export const metadata: Metadata = { title: 'Cliente nuevo' }

// Se construye en el Hito 3.
export default async function ClienteNuevoPage() {
  await requireProfile()
  return (
    <>
      <PageHeader title="Cliente nuevo" back={{ href: '/clientes', label: 'Clientes' }} />
      <PageBody>
        <ComingSoon />
      </PageBody>
    </>
  )
}
