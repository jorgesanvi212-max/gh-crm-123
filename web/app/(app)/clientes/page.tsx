import type { Metadata } from 'next'
import { requireProfile } from '@/lib/auth/require-profile'
import { ComingSoon } from '@/components/coming-soon'
import { PageBody } from '@/components/page-body'
import { PageHeader } from '@/components/page-header'

export const metadata: Metadata = { title: 'Clientes' }

// Se construye en el Hito 3.
export default async function ClientesPage() {
  await requireProfile()
  return (
    <>
      <PageHeader title="Clientes" />
      <PageBody>
        <ComingSoon />
      </PageBody>
    </>
  )
}
