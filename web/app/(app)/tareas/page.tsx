import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { requireProfile } from '@/lib/auth/require-profile'
import type { TaskBucket } from '@/lib/database.types'
import { formatDateTime } from '@/lib/format'
import { getScope, param } from '@/lib/scope'
import { cn } from '@/lib/utils'
import { NewTaskButton } from '@/components/crm/new-task-button'
import { PAGE_SIZE, pageFrom, Pagination } from '@/components/crm/pagination'
import { CancelTaskButton, TaskDoneCheckbox, TaskRow, TaskRowStatus } from '@/components/crm/task-row'
import { PageBody } from '@/components/page-body'
import { PageHeader } from '@/components/page-header'

export const metadata: Metadata = { title: 'Tareas' }

const TABS: { key: string; bucket: Exclude<TaskBucket, 'cerrada'>; label: string; empty: string }[] = [
  { key: 'hoy', bucket: 'hoy', label: 'Hoy', empty: 'Nada pendiente para hoy' },
  { key: 'vencidas', bucket: 'vencida', label: 'Vencidas', empty: 'No tienes tareas vencidas ✓' },
  { key: 'proximas', bucket: 'proxima', label: 'Próximas', empty: 'Sin tareas programadas' },
]

const COLUMNS = 'grid-cols-[40px_140px_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_90px]'

export default async function TareasPage({ searchParams }: PageProps<'/tareas'>) {
  const { supabase, profile } = await requireProfile()
  const params = await searchParams
  const { isSupervisor, ownerId } = getScope(profile, params)
  const tab = TABS.find((t) => t.key === param(params, 'pestana')) ?? TABS[0]
  const page = pageFrom(param(params, 'pagina'))
  // El vendedor ve sus tareas; el supervisor, las del equipo o las del vendedor filtrado.
  const taskOwner = ownerId ?? (isSupervisor ? null : profile.id)

  const count = (bucket: TaskBucket) => {
    let q = supabase.from('v_tasks_list').select('id', { count: 'exact', head: true }).eq('bucket', bucket)
    if (taskOwner) q = q.eq('owner_id', taskOwner)
    return q
  }
  let rowsQuery = supabase
    .from('v_tasks_list')
    .select('id, client_id, client_name, opportunity_title, title, due_at', { count: 'exact' })
    .eq('bucket', tab.bucket)
    .order('due_at')
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
  if (taskOwner) rowsQuery = rowsQuery.eq('owner_id', taskOwner)

  // Opciones del diálogo "Nueva tarea": clientes no archivados y sus oportunidades abiertas.
  let clientsQuery = supabase.from('v_clients_list').select('id, trade_name').eq('is_archived', false).order('trade_name').limit(1000)
  let oppsQuery = supabase
    .from('v_opportunities_list')
    .select('id, title, client_id')
    .eq('is_open', true)
    .eq('is_archived', false)
    .order('title')
    .limit(2000)
  if (ownerId) {
    clientsQuery = clientsQuery.eq('owner_id', ownerId)
    oppsQuery = oppsQuery.eq('owner_id', ownerId)
  }

  const [rows, hoy, vencida, proxima, clients, opps] = await Promise.all([
    rowsQuery,
    count('hoy'),
    count('vencida'),
    count('proxima'),
    clientsQuery,
    oppsQuery,
  ])
  if (rows.error || hoy.error || vencida.error || proxima.error) throw new Error('No se han podido cargar los datos')
  const counts: Record<string, number> = { hoy: hoy.count ?? 0, vencida: vencida.count ?? 0, proxima: proxima.count ?? 0 }

  const tabHref = (key: string) => {
    const query = new URLSearchParams()
    const seller = param(params, 'vendedor')
    if (seller) query.set('vendedor', seller)
    if (key !== 'hoy') query.set('pestana', key)
    const qs = query.toString()
    return qs ? `/tareas?${qs}` : '/tareas'
  }

  return (
    <>
      <PageHeader title="Tareas" actions={<NewTaskButton clients={clients.data ?? []} opportunities={opps.data ?? []} />} />
      <PageBody className="gap-3">
        <div data-screen-label="Tareas" className="flex flex-col gap-3">
          <nav aria-label="Tareas" className="flex gap-1 border-b border-border">
            {TABS.map((t) => {
              const active = t.key === tab.key
              const alert = t.bucket === 'vencida' && counts.vencida > 0
              return (
                <Link
                  key={t.key}
                  href={tabHref(t.key)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    '-mb-px flex h-[38px] items-center gap-1.5 border-b-2 border-transparent px-3.5 font-semibold hover:no-underline',
                    alert ? 'text-danger hover:text-danger' : active ? 'text-text hover:text-text' : 'text-text-muted hover:text-text',
                    active && (alert ? 'border-danger' : 'border-primary'),
                  )}
                >
                  {alert && <Clock className="size-3.5" strokeWidth={2.5} aria-hidden="true" />}
                  {t.label} ({counts[t.bucket]})
                </Link>
              )
            })}
          </nav>

          <div className="overflow-auto rounded-[8px] border border-border bg-surface">
            <div className="min-w-[760px] pb-2.5">
              <div className={cn('sticky top-0 grid h-9 items-center gap-3 border-b border-border bg-bg px-4 text-xs font-semibold text-text-muted', COLUMNS)}>
                <span>Hecha</span>
                <span>Fecha y hora</span>
                <span>Título</span>
                <span>Cliente</span>
                <span>Oportunidad</span>
                <span />
              </div>
              {(rows.data ?? []).map((t, i) => (
                <TaskRow
                  key={t.id}
                  taskId={t.id}
                  className={cn('grid min-h-[38px] items-center gap-3 px-4', COLUMNS, i > 0 && 'border-t border-border')}
                >
                  <TaskDoneCheckbox />
                  <span className={cn('text-[13px] tabular-nums', tab.bucket === 'vencida' && 'font-semibold text-danger')}>
                    {formatDateTime(t.due_at)}
                  </span>
                  <span className="truncate">{t.title}</span>
                  <Link href={`/clientes/${t.client_id}`} className="truncate">
                    {t.client_name}
                  </Link>
                  <span className="truncate text-[13px] text-text-muted">{t.opportunity_title || '—'}</span>
                  <span className="flex justify-end">
                    <TaskRowStatus>
                      <CancelTaskButton taskId={t.id} title={t.title} />
                    </TaskRowStatus>
                  </span>
                </TaskRow>
              ))}
              {(rows.data ?? []).length === 0 && <div className="px-4 py-9 text-text-muted">{tab.empty}</div>}
            </div>
          </div>
          {(rows.count ?? 0) > PAGE_SIZE && (
            <Pagination page={page} total={rows.count ?? 0} noun={['tarea', 'tareas']} pathname="/tareas" params={params} />
          )}
        </div>
      </PageBody>
    </>
  )
}
