import type { Metadata } from 'next'
import Link from 'next/link'
import { requireProfile } from '@/lib/auth/require-profile'
import { formatEuros } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { PageBody } from '@/components/page-body'
import { PageHeader } from '@/components/page-header'

export const metadata: Metadata = { title: 'Tablero del día' }

// 4 columnas si el contenedor mide ≥ 780 px; si no, 2 × 2 (nunca 3 + 1).
const KPI_GRID = {
  gridTemplateColumns:
    'repeat(auto-fit, minmax(max(calc(25% - 9px), min(calc(50% - 6px), calc((780px - 100%) * 999))), 1fr))',
}

// Hito 2: estructura completa con indicadores a 0 y listas vacías (sin consultas de datos).
const kpi = { tasks_today: 0, tasks_overdue: 0, open_opps_count: 0, open_opps_amount: 0, won_month_amount: 0 }

export default async function TableroPage({ searchParams }: PageProps<'/'>) {
  const { profile } = await requireProfile()
  const { vendedor } = await searchParams
  const teamView = profile.role === 'supervisor' && !vendedor

  return (
    <>
      <PageHeader title="Tablero del día" primary={{ href: '/clientes/nuevo', label: 'Añadir cliente' }} />
      <PageBody>
        <div data-screen-label="Tablero del día" className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-[8px] border border-primary-soft-border bg-primary-soft px-4 py-3">
            <span className="flex-1 font-medium text-primary-hover">Empieza añadiendo tu primer cliente</span>
            <Button asChild size="sm">
              <Link href="/clientes/nuevo" className="text-primary-foreground hover:text-primary-foreground hover:no-underline">
                Añadir cliente
              </Link>
            </Button>
          </div>

          <div className="grid gap-3" style={KPI_GRID}>
            <KpiCard label="Tareas de hoy" value={String(kpi.tasks_today)} />
            <KpiCard
              label="Tareas vencidas"
              value={String(kpi.tasks_overdue)}
              className={kpi.tasks_overdue > 0 ? 'border-danger-border' : undefined}
              valueClassName={kpi.tasks_overdue > 0 ? 'text-danger' : undefined}
            />
            <KpiCard
              label="Oportunidades abiertas"
              value={String(kpi.open_opps_count)}
              sub={formatEuros(kpi.open_opps_amount)}
            />
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
              <div className="border-t border-border px-4 py-7 text-text-muted">Sin tareas para hoy. Buen trabajo.</div>
            </Card>

            <Card className="min-w-0 flex-[40_1_340px] overflow-hidden">
              <CardHeader>
                <CardTitle>Cierres previstos en 7 días</CardTitle>
              </CardHeader>
              <div className="border-t border-border px-4 py-7 text-text-muted">No hay cierres previstos esta semana.</div>
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
  className,
  valueClassName,
}: {
  label: string
  value: string
  sub?: string
  className?: string
  valueClassName?: string
}) {
  return (
    <Card className={cn('flex flex-col gap-1.5 p-4', className)}>
      <span className="truncate text-[13px] font-medium text-text-muted">{label}</span>
      <span className={cn('whitespace-nowrap text-[28px] font-semibold tabular-nums', valueClassName)}>
        {value}
      </span>
      {sub && <span className="text-[13px] text-text-muted tabular-nums">{sub}</span>}
    </Card>
  )
}
