import type { Metadata } from 'next'
import Link from 'next/link'
import { requireProfile } from '@/lib/auth/require-profile'
import { formatDate } from '@/lib/format'
import { BUSINESS_TYPE } from '@/lib/labels'
import { formatPhone } from '@/lib/phone'
import { getScope, param } from '@/lib/scope'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ClearSearchButton, ClientsToolbar } from '@/components/crm/clients-toolbar'
import { PAGE_SIZE, pageFrom, Pagination } from '@/components/crm/pagination'
import { PageBody } from '@/components/page-body'
import { PageHeader } from '@/components/page-header'

export const metadata: Metadata = { title: 'Clientes' }

const BUSINESS_TYPES = Object.keys(BUSINESS_TYPE)

/** Texto de búsqueda seguro para el filtro or() de PostgREST. */
function cleanSearch(value: string): string {
  return value.replace(/[^\p{L}\p{N}\s.'&-]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, 100)
}

export default async function ClientesPage({ searchParams }: PageProps<'/clientes'>) {
  const { supabase, profile } = await requireProfile()
  const params = await searchParams
  const { isSupervisor, ownerId, showArchived } = getScope(profile, params)
  const q = cleanSearch(param(params, 'q'))
  const tipo = param(params, 'tipo')
  const page = pageFrom(param(params, 'pagina'))

  let query = supabase
    .from('v_clients_list')
    .select('id, trade_name, business_type, contact_name, phone, city, open_opps_count, last_activity_at, owner_name, is_archived', {
      count: 'exact',
    })
    .order('trade_name')
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
  if (!showArchived) query = query.eq('is_archived', false)
  if (ownerId) query = query.eq('owner_id', ownerId)
  if (BUSINESS_TYPES.includes(tipo)) query = query.eq('business_type', tipo as never)
  if (q) {
    const digits = q.replace(/\D/g, '')
    query =
      digits.length >= 3
        ? query.or(`trade_name.ilike."*${q}*",phone.ilike.*${digits}*`)
        : query.ilike('trade_name', `%${q}%`)
  }

  const { data, count, error } = await query
  if (error) throw new Error('No se han podido cargar los datos')
  const rows = data ?? []
  const filtered = Boolean(q || BUSINESS_TYPES.includes(tipo))

  const columns = [
    'minmax(160px,1.6fr)',
    'minmax(120px,1.1fr)',
    'minmax(110px,1fr)',
    '140px',
    'minmax(90px,.9fr)',
    '90px',
    '110px',
    ...(isSupervisor ? ['minmax(100px,.9fr)'] : []),
    ...(showArchived ? ['96px'] : []),
  ].join(' ')

  return (
    <>
      <PageHeader title="Clientes" archivedToggle primary={{ href: '/clientes/nuevo', label: 'Añadir cliente' }} />
      <PageBody className="gap-3">
        <div data-screen-label="Clientes" className="flex flex-col gap-3">
          <ClientsToolbar />
          <div className="max-h-[calc(100vh-220px)] overflow-auto rounded-[8px] border border-border bg-surface">
            <div className="pb-2.5" style={{ minWidth: isSupervisor ? 1080 : 960 }}>
              <div
                className="sticky top-0 z-[1] grid h-9 items-center gap-3 border-b border-border bg-bg px-4 text-xs font-semibold text-text-muted"
                style={{ gridTemplateColumns: columns }}
              >
                <span>Nombre comercial ↑</span>
                <span>Tipo de negocio</span>
                <span>Contacto</span>
                <span>Teléfono</span>
                <span>Población</span>
                <span className="text-right">Oport. abiertas</span>
                <span>Última actividad</span>
                {isSupervisor && <span>Vendedor</span>}
                {showArchived && <span>Estado</span>}
              </div>
              {rows.map((c, i) => (
                <div
                  key={c.id}
                  className={cn(
                    'grid min-h-[38px] items-center gap-3 px-4 hover:bg-row-hover',
                    i > 0 && 'border-t border-border',
                    c.is_archived && 'opacity-60',
                  )}
                  style={{ gridTemplateColumns: columns }}
                >
                  <Link href={`/clientes/${c.id}`} className="truncate font-semibold text-text hover:text-primary">
                    {c.trade_name}
                  </Link>
                  <span className="truncate">{BUSINESS_TYPE[c.business_type]}</span>
                  <span className="truncate">{c.contact_name}</span>
                  <span className="whitespace-nowrap tabular-nums">{formatPhone(c.phone)}</span>
                  <span className="truncate">{c.city || '—'}</span>
                  <span className="text-right tabular-nums">{c.open_opps_count}</span>
                  <span className="text-text-muted tabular-nums">{c.last_activity_at ? formatDate(c.last_activity_at) : '—'}</span>
                  {isSupervisor && <span className="truncate">{c.owner_name}</span>}
                  {showArchived && <span>{c.is_archived && <Badge variant="neutral">Archivado</Badge>}</span>}
                </div>
              ))}
              {rows.length === 0 && (
                <div className="flex flex-col items-start gap-2.5 px-4 py-9">
                  {filtered ? (
                    <>
                      <span>{q ? `No hay clientes que coincidan con «${q}»` : 'No hay clientes que coincidan con estos filtros'}</span>
                      <ClearSearchButton />
                    </>
                  ) : (
                    <>
                      <span>Aún no tienes clientes.</span>
                      <Button asChild size="sm" className="h-[34px]">
                        <Link href="/clientes/nuevo" className="text-primary-foreground hover:text-primary-foreground hover:no-underline">
                          Añadir cliente
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <Pagination page={page} total={count ?? 0} noun={['cliente', 'clientes']} pathname="/clientes" params={params} />
        </div>
      </PageBody>
    </>
  )
}
