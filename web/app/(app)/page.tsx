import type { Metadata } from 'next'
import Link from 'next/link'
import { CircleAlert } from 'lucide-react'
import { requireProfile } from '@/lib/auth/require-profile'
import { addDaysISO, todayISO } from '@/lib/dates'
import { formatDate, formatDay, formatEuros, formatTime } from '@/lib/format'
import { getArchivedClientIds, getScope } from '@/lib/scope'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { OverdueBadge, StageBadge } from '@/components/crm/badges'
import { TaskDoneCheckbox, TaskRow, TaskRowStatus } from '@/components/crm/task-row'
import { PageBody } from '@/components/page-body'
import { PageHeader } from '@/components/page-header'

export const metadata: Metadata = { title: 'Tablero del día' }

// 4 columnas si el contenedor mide ≥ 780 px; si no, 2 × 2 (nunca 3 + 1).
const KPI_GRID = {
  gridTemplateColumns:
    'repeat(auto-fit, minmax(max(calc(25% - 9px), min(calc(50% - 6px), calc((780px - 100%) * 999))), 1fr))',
}

export default async function TableroPage({ searchParams }: PageProps<'/'>) {
  const { supabase, profile } = await requireProfile()
  const params = await searchParams
  const { isSupervisor, ownerId } = getScope(profile, params)
  const today = todayISO()
  const archivedIds = await getArchivedClientIds(supabase, ownerId)

  // Indicadores: el vendedor ve su fila (RLS); el supervisor, la suma del equipo o la del vendedor filtrado.
  let kpiQuery = supabase
    .from('v_seller_kpis')
    .select('tasks_today, tasks_overdue, open_opps_count, open_opps_amount, won_month_amount')
  if (ownerId) kpiQuery = kpiQuery.eq('profile_id', ownerId)

  // Tareas de hoy y vencidas (bucket calculado en hora de Madrid).
  let tasksQuery = supabase
    .from('v_tasks_list')
    .select('id, client_id, client_name, title, due_at, bucket')
    .in('bucket', ['vencida', 'hoy'])
    .order('due_at')
    .limit(100)
  const taskOwner = ownerId ?? (isSupervisor ? null : profile.id)
  if (taskOwner) tasksQuery = tasksQuery.eq('owner_id', taskOwner)

  // Cierres previstos en 7 días: abiertas, no archivadas, de clientes no archivados.
  let closingsQuery = supabase
    .from('v_opportunities_list')
    .select('id, client_id, client_name, title, amount, stage, expected_close_date')
    .eq('is_open', true)
    .eq('is_archived', false)
    .gte('expected_close_date', today)
    .lte('expected_close_date', addDaysISO(today, 7))
    .order('expected_close_date')
    .limit(50)
  if (ownerId) closingsQuery = closingsQuery.eq('owner_id', ownerId)
  if (archivedIds.length) closingsQuery = closingsQuery.not('client_id', 'in', `(${archivedIds.join(',')})`)

  let clientsQuery = supabase.from('clients').select('id', { count: 'exact', head: true }).eq('is_archived', false)
  if (ownerId) clientsQuery = clientsQuery.eq('owner_id', ownerId)

  const [kpis, tasks, closings, clients] = await Promise.all([kpiQuery, tasksQuery, closingsQuery, clientsQuery])
  if (kpis.error || tasks.error || closings.error || clients.error) throw new Error('No se han podido cargar los datos')

  const kpi = (kpis.data ?? []).reduce(
    (sum, k) => ({
      tasks_today: sum.tasks_today + k.tasks_today,
      tasks_overdue: sum.tasks_overdue + k.tasks_overdue,
      open_opps_count: sum.open_opps_count + k.open_opps_count,
      open_opps_amount: sum.open_opps_amount + Number(k.open_opps_amount),
      won_month_amount: sum.won_month_amount + Number(k.won_month_amount),
    }),
    { tasks_today: 0, tasks_overdue: 0, open_opps_count: 0, open_opps_amount: 0, won_month_amount: 0 },
  )
  // Primero las vencidas y luego las de hoy, por hora.
  const dashTasks = [
    ...(tasks.data ?? []).filter((t) => t.bucket === 'vencida'),
    ...(tasks.data ?? []).filter((t) => t.bucket === 'hoy'),
  ]
  const teamView = isSupervisor && !ownerId

  return (
    <>
      <PageHeader title="Tablero del día" primary={{ href: '/clientes/nuevo', label: 'Añadir cliente' }} />
      <PageBody>
        <div data-screen-label="Tablero del día" className="flex flex-col gap-4">
          {clients.count === 0 && (
            <div className="flex items-center gap-3 rounded-[8px] border border-primary-soft-border bg-primary-soft px-4 py-3">
              <span className="flex-1 font-medium text-primary-hover">Empieza añadiendo tu primer cliente</span>
              <Button asChild size="sm">
                <Link href="/clientes/nuevo" className="text-primary-foreground hover:text-primary-foreground hover:no-underline">
                  Añadir cliente
                </Link>
              </Button>
            </div>
          )}

          <div className="grid gap-3" style={KPI_GRID}>
            <KpiCard label="Tareas de hoy" value={String(kpi.tasks_today)} />
            <KpiCard
              label="Tareas vencidas"
              value={String(kpi.tasks_overdue)}
              icon={kpi.tasks_overdue > 0}
              className={kpi.tasks_overdue > 0 ? 'border-danger-border' : undefined}
              valueClassName={kpi.tasks_overdue > 0 ? 'text-danger' : undefined}
            />
            <KpiCard label="Oportunidades abiertas" value={String(kpi.open_opps_count)} sub={formatEuros(kpi.open_opps_amount)} />
            <KpiCard label="Ganado este mes" value={formatEuros(kpi.won_month_amount)} valueClassName="text-primary" />
          </div>

          <div className="flex flex-wrap items-start gap-4">
            <Card className="min-w-0 flex-[60_1_520px] overflow-hidden">
              <CardHeader>
                <CardTitle>{teamView ? 'Tareas de hoy y vencidas del equipo' : 'Mis tareas de hoy y vencidas'}</CardTitle>
                <Button asChild variant="ghost" size="xs" className="h-auto px-1.5 py-1">
                  <Link href="/tareas" className="hover:no-underline">
                    Ver todas
                  </Link>
                </Button>
              </CardHeader>
              {dashTasks.length === 0 && (
                <div className="border-t border-border px-4 py-7 text-text-muted">Sin tareas para hoy. Buen trabajo.</div>
              )}
              {dashTasks.map((t) => {
                const overdue = t.bucket === 'vencida'
                return (
                  <TaskRow
                    key={t.id}
                    taskId={t.id}
                    className={cn(
                      'grid min-h-[38px] grid-cols-[24px_92px_minmax(0,1fr)_minmax(0,170px)_76px] items-center gap-2.5 border-t border-border px-4',
                      overdue && 'bg-danger-row',
                    )}
                  >
                    <TaskDoneCheckbox />
                    <span className={cn('text-[13px] tabular-nums', overdue && 'font-semibold text-danger')}>
                      {overdue ? formatDate(t.due_at) : formatTime(t.due_at)}
                    </span>
                    <span className="truncate">{t.title}</span>
                    <Link href={`/clientes/${t.client_id}`} className="truncate text-[13px]">
                      {t.client_name}
                    </Link>
                    <span className="flex justify-end">
                      <TaskRowStatus>{overdue && <OverdueBadge />}</TaskRowStatus>
                    </span>
                  </TaskRow>
                )
              })}
            </Card>

            <Card className="min-w-0 flex-[40_1_340px] overflow-hidden">
              <CardHeader>
                <CardTitle>Cierres previstos en 7 días</CardTitle>
              </CardHeader>
              {(closings.data ?? []).length === 0 && (
                <div className="border-t border-border px-4 py-7 text-text-muted">No hay cierres previstos esta semana.</div>
              )}
              {(closings.data ?? []).map((o) => (
                <div key={o.id} className="grid grid-cols-[78px_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-1 border-t border-border px-4 py-[9px]">
                  <span className="row-span-2 text-[13px] text-text-muted tabular-nums">{formatDay(o.expected_close_date)}</span>
                  <Link href={`/clientes/${o.client_id}`} className="truncate font-medium">
                    {o.client_name}
                  </Link>
                  <span className="text-right font-semibold tabular-nums">{formatEuros(o.amount)}</span>
                  <span className="truncate text-[13px] text-text-muted">{o.title}</span>
                  <span className="justify-self-end">
                    <StageBadge stage={o.stage} />
                  </span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </PageBody>
    </>
  )
}

function KpiCard({
  label,
  value,
  sub,
  icon,
  className,
  valueClassName,
}: {
  label: string
  value: string
  sub?: string
  icon?: boolean
  className?: string
  valueClassName?: string
}) {
  return (
    <Card className={cn('flex flex-col gap-1.5 p-4', className)}>
      <span className="truncate text-[13px] font-medium text-text-muted">{label}</span>
      <span className={cn('flex items-center gap-2 whitespace-nowrap text-[28px] font-semibold tabular-nums', valueClassName)}>
        {value}
        {icon && <CircleAlert className="size-5" aria-hidden="true" />}
      </span>
      {sub && <span className="text-[13px] text-text-muted tabular-nums">{sub}</span>}
    </Card>
  )
}
