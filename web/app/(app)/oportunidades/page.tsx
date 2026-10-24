import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { requireProfile } from '@/lib/auth/require-profile'
import { currentMonthISO, currentWeekISO, isISODate, todayISO } from '@/lib/dates'
import { formatDay, formatEuros } from '@/lib/format'
import { LOSS_REASON } from '@/lib/labels'
import { getArchivedClientIds, getScope, param } from '@/lib/scope'
import { STAGES } from '@/lib/validation/crm'
import type { Enums } from '@/lib/database.types'
import { cn } from '@/lib/utils'
import { StageButton } from '@/components/crm/opportunity-menu'
import { OpportunityFilters } from '@/components/crm/opportunity-filters'
import { PAGE_SIZE, pageFrom, Pagination } from '@/components/crm/pagination'
import { PageBody } from '@/components/page-body'
import { PageHeader } from '@/components/page-header'

export const metadata: Metadata = { title: 'Oportunidades' }

const isStage = (value: string): value is Enums<'opportunity_stage'> => (STAGES as readonly string[]).includes(value)

export default async function OportunidadesPage({ searchParams }: PageProps<'/oportunidades'>) {
  const { supabase, profile } = await requireProfile()
  const params = await searchParams
  const { isSupervisor, ownerId, showArchived } = getScope(profile, params)
  const etapa = param(params, 'etapa') || 'abiertas'
  const fecha = param(params, 'fecha') || 'todas'
  const page = pageFrom(param(params, 'pagina'))
  const today = todayISO()

  // Rango de fecha prevista según el filtro.
  let range: [string | null, string | null] = [null, null]
  if (fecha === 'semana') range = currentWeekISO()
  if (fecha === 'mes') range = currentMonthISO()
  if (fecha === 'rango') {
    const desde = param(params, 'desde')
    const hasta = param(params, 'hasta')
    range = [isISODate(desde) ? desde : null, isISODate(hasta) ? hasta : null]
  }
  const archivedIds = showArchived ? [] : await getArchivedClientIds(supabase, ownerId)

  // Filas de la página (50) y, con los mismos filtros, los importes para el total en euros.
  let rowsQuery = supabase
    .from('v_opportunities_list')
    .select(
      'id, client_id, client_name, owner_name, title, description, amount, stage, expected_close_date, loss_reason, loss_note, closed_at, is_open, is_archived',
      { count: 'exact' },
    )
  let totalsQuery = supabase.from('v_opportunities_list').select('amount')
  if (etapa === 'abiertas') {
    rowsQuery = rowsQuery.eq('is_open', true)
    totalsQuery = totalsQuery.eq('is_open', true)
  } else if (isStage(etapa)) {
    rowsQuery = rowsQuery.eq('stage', etapa)
    totalsQuery = totalsQuery.eq('stage', etapa)
  }
  if (range[0]) {
    rowsQuery = rowsQuery.gte('expected_close_date', range[0])
    totalsQuery = totalsQuery.gte('expected_close_date', range[0])
  }
  if (range[1]) {
    rowsQuery = rowsQuery.lte('expected_close_date', range[1])
    totalsQuery = totalsQuery.lte('expected_close_date', range[1])
  }
  if (ownerId) {
    rowsQuery = rowsQuery.eq('owner_id', ownerId)
    totalsQuery = totalsQuery.eq('owner_id', ownerId)
  }
  if (!showArchived) {
    rowsQuery = rowsQuery.eq('is_archived', false)
    totalsQuery = totalsQuery.eq('is_archived', false)
    if (archivedIds.length) {
      rowsQuery = rowsQuery.not('client_id', 'in', `(${archivedIds.join(',')})`)
      totalsQuery = totalsQuery.not('client_id', 'in', `(${archivedIds.join(',')})`)
    }
  }

  const [rowsResult, totalsResult] = await Promise.all([
    rowsQuery
      .order('expected_close_date')
      .order('client_name')
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1),
    totalsQuery,
  ])
  if (rowsResult.error || totalsResult.error) throw new Error('No se han podido cargar los datos')

  const rows = rowsResult.data ?? []
  const total = rowsResult.count ?? 0
  const totalAmount = (totalsResult.data ?? []).reduce((sum, o) => sum + Number(o.amount), 0)
  const anyFilter = etapa !== 'abiertas' || fecha !== 'todas'
  const columns = ['110px', 'minmax(140px,1.2fr)', 'minmax(160px,1.6fr)', '120px', '140px', '130px', ...(isSupervisor ? ['minmax(100px,.9fr)'] : [])].join(' ')

  return (
    <>
      <PageHeader title="Oportunidades" archivedToggle />
      <PageBody className="gap-3">
        <div data-screen-label="Oportunidades" className="flex flex-col gap-3">
          <OpportunityFilters />
          <div className="flex items-center gap-2 rounded-[8px] bg-primary-soft px-3.5 py-2.5 font-medium text-primary-hover">
            <span className="tabular-nums">
              {total} {total === 1 ? 'oportunidad' : 'oportunidades'} · {formatEuros(totalAmount)} en total
            </span>
          </div>
          <div className="max-h-[calc(100vh-260px)] overflow-auto rounded-[8px] border border-border bg-surface">
            <div className="min-w-[860px] pb-2.5">
              <div
                className="sticky top-0 z-[1] grid h-9 items-center gap-3 border-b border-border bg-bg px-4 text-xs font-semibold text-text-muted"
                style={{ gridTemplateColumns: columns }}
              >
                <span>Fecha prevista ↑</span>
                <span>Cliente</span>
                <span>Título</span>
                <span className="text-right">Importe</span>
                <span>Etapa</span>
                <span>Motivo de pérdida</span>
                {isSupervisor && <span>Vendedor</span>}
              </div>
              {rows.map((o, i) => {
                const late = o.is_open && o.expected_close_date < today
                const locked = (!o.is_open && !isSupervisor) || o.is_archived
                return (
                  <div
                    key={o.id}
                    className={cn('grid min-h-[38px] items-center gap-3 px-4 hover:bg-row-hover', i > 0 && 'border-t border-border')}
                    style={{ gridTemplateColumns: columns }}
                  >
                    <span className={cn('flex items-center gap-1 tabular-nums', late && 'font-semibold text-danger')}>
                      {late && <Clock className="size-[13px]" strokeWidth={2.5} aria-label="Fecha pasada" />}
                      {formatDay(o.expected_close_date)}
                    </span>
                    <Link href={`/clientes/${o.client_id}`} className="truncate font-medium">
                      {o.client_name}
                    </Link>
                    <span className="truncate">{o.title}</span>
                    <span className="text-right font-semibold tabular-nums">{formatEuros(o.amount)}</span>
                    <span>
                      <StageButton opp={o} locked={locked} />
                    </span>
                    <span className="text-[13px] text-text-muted">{o.loss_reason ? LOSS_REASON[o.loss_reason] : ''}</span>
                    {isSupervisor && <span className="truncate">{o.owner_name}</span>}
                  </div>
                )
              })}
              {rows.length === 0 && (
                <div className="px-4 py-9 text-text-muted">
                  {anyFilter ? 'No hay oportunidades con estos filtros' : 'No hay oportunidades abiertas'}
                </div>
              )}
            </div>
          </div>
          <Pagination page={page} total={total} noun={['oportunidad', 'oportunidades']} pathname="/oportunidades" params={params} />
        </div>
      </PageBody>
    </>
  )
}
