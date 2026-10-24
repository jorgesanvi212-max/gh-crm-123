import type { Metadata } from 'next'
import { requireProfile } from '@/lib/auth/require-profile'
import { getActiveSellers, getScope } from '@/lib/scope'
import { ClientForm } from '@/components/crm/client-form'
import { PageBody } from '@/components/page-body'
import { PageHeader } from '@/components/page-header'

export const metadata: Metadata = { title: 'Cliente nuevo' }

export default async function ClienteNuevoPage({ searchParams }: PageProps<'/clientes/nuevo'>) {
  const { supabase, profile } = await requireProfile()
  const { isSupervisor, ownerId } = getScope(profile, await searchParams)
  const sellers = isSupervisor ? await getActiveSellers(supabase) : []

  return (
    <>
      <PageHeader title="Cliente nuevo" back={{ href: '/clientes', label: 'Clientes' }} />
      <PageBody>
        <ClientForm
          isSupervisor={isSupervisor}
          sellers={sellers}
          defaultOwnerId={ownerId && sellers.some((s) => s.id === ownerId) ? ownerId : undefined}
        />
      </PageBody>
    </>
  )
}
