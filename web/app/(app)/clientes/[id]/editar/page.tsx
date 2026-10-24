import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { requireProfile } from '@/lib/auth/require-profile'
import { splitE164 } from '@/lib/phone'
import { getActiveSellers } from '@/lib/scope'
import { isUuid } from '@/lib/validation/uuid'
import { ClientForm } from '@/components/crm/client-form'
import { PageBody } from '@/components/page-body'
import { PageHeader } from '@/components/page-header'

export const metadata: Metadata = { title: 'Editar cliente' }

export default async function EditarClientePage({ params }: PageProps<'/clientes/[id]/editar'>) {
  const { supabase, profile } = await requireProfile()
  const { id } = await params
  if (!isUuid(id)) notFound()

  const { data: client } = await supabase
    .from('clients')
    .select('id, trade_name, business_type, contact_name, phone, email, delivery_address, city, province, notes, owner_id, is_archived')
    .eq('id', id)
    .maybeSingle()
  if (!client) notFound()
  // Un cliente archivado es de solo lectura.
  if (client.is_archived) redirect(`/clientes/${id}`)

  const isSupervisor = profile.role === 'supervisor'
  const sellers = isSupervisor ? await getActiveSellers(supabase) : []
  const { country, national } = splitE164(client.phone)

  return (
    <>
      <PageHeader title="Editar cliente" back={{ href: `/clientes/${id}`, label: client.trade_name }} />
      <PageBody>
        <ClientForm client={{ ...client, prefix: country, national }} isSupervisor={isSupervisor} sellers={sellers} />
      </PageBody>
    </>
  )
}
