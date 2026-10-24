import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Archive, FileText, Mail, MapPin, MessageCircle, Phone, type LucideIcon } from 'lucide-react'
import { requireProfile } from '@/lib/auth/require-profile'
import type { Enums } from '@/lib/database.types'
import { madridDayOf, todayISO } from '@/lib/dates'
import { formatDate, formatDateTime, formatDay, formatEuros } from '@/lib/format'
import { ACTIVITY_TYPE, BUSINESS_TYPE, TASK_STATUS } from '@/lib/labels'
import { formatPhone } from '@/lib/phone'
import { getActiveSellers } from '@/lib/scope'
import { cn } from '@/lib/utils'
import { isUuid } from '@/lib/validation/uuid'
import { Badge } from '@/components/ui/badge'
import { Card, CardTitle } from '@/components/ui/card'
import { OverdueBadge, StageBadge } from '@/components/crm/badges'
import { ClientActions, CopyPhoneButton, RestoreClientButton } from '@/components/crm/client-actions'
import { ClosedTasks } from '@/components/crm/closed-tasks'
import { OpportunityMenu } from '@/components/crm/opportunity-menu'
import { CancelTaskButton, TaskDoneCheckbox, TaskRow, TaskRowStatus } from '@/components/crm/task-row'
import { PageBody } from '@/components/page-body'
import { PageHeader } from '@/components/page-header'

export const metadata: Metadata = { title: 'Ficha de cliente' }

const ACTIVITY_ICON: Record<Enums<'activity_type'>, LucideIcon> = {
  llamada: Phone,
  visita: MapPin,
  whatsapp: MessageCircle,
  email: Mail,
  nota: FileText,
}

const OPEN_STAGES = ['nueva', 'oferta_enviada', 'negociacion']

export default async function FichaClientePage({ params }: PageProps<'/clientes/[id]'>) {
  const { supabase, profile } = await requireProfile()
  const { id } = await params
  if (!isUuid(id)) notFound()
  const isSupervisor = profile.role === 'supervisor'

  const { data: client, error: clientError } = await supabase.from('v_clients_list').select('*').eq('id', id).maybeSingle()
  if (clientError) throw new Error('No se han podido cargar los datos')
  // El vendedor no ve clientes archivados.
  if (!client || (client.is_archived && !isSupervisor)) notFound()

  let oppsQuery = supabase
    .from('v_opportunities_list')
    .select('id, client_id, title, description, amount, stage, expected_close_date, loss_reason, loss_note, closed_at, is_archived')
    .eq('client_id', id)
    .order('expected_close_date')
  if (!isSupervisor) oppsQuery = oppsQuery.eq('is_archived', false)

  const [opps, tasks, activities, sellers] = await Promise.all([
    oppsQuery,
    supabase.from('tasks').select('id, title, due_at, status, opportunity_id').eq('client_id', id).order('due_at'),
    supabase
      .from('activities')
      .select('id, type, description, occurred_at, opportunity_id, created_by')
      .eq('client_id', id)
      .order('occurred_at', { ascending: false })
      .limit(100),
    isSupervisor && client.is_archived ? getActiveSellers(supabase) : Promise.resolve([]),
  ])
  if (opps.error || tasks.error || activities.error) throw new Error('No se han podido cargar los datos')

  // Nombre del autor de cada actividad, si es visible para el usuario (RLS de profiles).
  const authorIds = [...new Set((activities.data ?? []).map((a) => a.created_by))]
  const { data: authors } = authorIds.length
    ? await supabase.from('profiles').select('id, full_name').in('id', authorIds)
    : { data: [] }
  const authorName = new Map((authors ?? []).map((a) => [a.id, a.full_name]))

  const editable = !client.is_archived
  const oppTitle = new Map((opps.data ?? []).map((o) => [o.id, o.title]))
  const openOpps = (opps.data ?? []).filter((o) => OPEN_STAGES.includes(o.stage) && !o.is_archived)
  const pending = (tasks.data ?? []).filter((t) => t.status === 'pendiente')
  const closed = (tasks.data ?? []).filter((t) => t.status !== 'pendiente').reverse()
  const today = todayISO()
  const address = [client.delivery_address, client.city, client.province].filter(Boolean).join(', ') || '—'
  const ownerActive = sellers.some((s) => s.id === client.owner_id)
  const clientRef = { id: client.id, trade_name: client.trade_name }

  return (
    <>
      <PageHeader title="Ficha de cliente" back={{ href: '/clientes', label: 'Clientes' }} />
      <PageBody>
        <div data-screen-label="Ficha de cliente" className="flex flex-col gap-4">
          {client.is_archived && (
            <div className="flex items-center gap-2.5 rounded-[8px] border border-neutral-border bg-neutral-soft px-3.5 py-2.5">
              <Archive className="size-4 text-neutral-strong" aria-hidden="true" />
              <span className="flex-1 font-medium text-neutral-strong">
                Cliente archivado el {client.archived_at ? formatDate(client.archived_at) : '—'}
              </span>
              {isSupervisor && (
                <RestoreClientButton client={clientRef} sellers={sellers} defaultOwnerId={ownerActive ? client.owner_id : undefined} />
              )}
            </div>
          )}

          <Card className="flex flex-col gap-3.5 px-5 py-[18px]">
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex min-w-[260px] flex-1 flex-wrap items-center gap-2.5">
                <h2 className="m-0 text-xl font-semibold">{client.trade_name}</h2>
                <Badge className="bg-primary-soft text-primary-hover">{BUSINESS_TYPE[client.business_type]}</Badge>
              </div>
              {editable && (
                <ClientActions
                  client={clientRef}
                  isSupervisor={isSupervisor}
                  openOpportunities={openOpps.map((o) => ({ id: o.id, title: o.title }))}
                />
              )}
            </div>
            <div className="grid gap-x-6 gap-y-2.5 text-[13px] [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
              <Info label="Persona de contacto">{client.contact_name}</Info>
              <Info label="Teléfono">
                <span className="flex items-center gap-1.5 tabular-nums">
                  {formatPhone(client.phone)}
                  <CopyPhoneButton phone={client.phone} />
                </span>
              </Info>
              <Info label="Email">{client.email || '—'}</Info>
              <Info label="Dirección de entrega">{address}</Info>
              {isSupervisor && <Info label="Vendedor">{client.owner_name}</Info>}
            </div>
          </Card>

          <div className="flex flex-wrap items-start gap-4">
            <div className="flex min-w-0 flex-[65_1_560px] flex-col gap-4">
              <Card className="pb-1">
                <div className="px-4 py-3.5">
                  <CardTitle>Oportunidades</CardTitle>
                </div>
                {(opps.data ?? []).length === 0 && <div className="border-t border-border px-4 py-[22px] text-text-muted">Sin oportunidades</div>}
                {(opps.data ?? []).map((o) => {
                  const isClosed = !OPEN_STAGES.includes(o.stage)
                  return (
                    <div
                      key={o.id}
                      className={cn(
                        'grid min-h-10 grid-cols-[minmax(120px,1fr)_104px_118px_84px_30px] items-center gap-2.5 border-t border-border px-4 py-1',
                        (isClosed || o.is_archived) && 'opacity-60',
                      )}
                    >
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate font-medium">{o.title}</span>
                        {o.description && <span className="truncate text-xs text-text-muted">{o.description}</span>}
                      </span>
                      <span className="text-right font-semibold tabular-nums">{formatEuros(o.amount)}</span>
                      <span className="flex flex-wrap gap-1">
                        <StageBadge stage={o.stage} />
                        {o.is_archived && <Badge variant="neutral">Archivada</Badge>}
                      </span>
                      <span className="text-[13px] text-text-muted tabular-nums">{formatDay(o.expected_close_date)}</span>
                      <span className="flex justify-end">
                        <OpportunityMenu
                          opp={{ ...o, client_name: client.trade_name }}
                          isSupervisor={isSupervisor}
                          archived={o.is_archived}
                          clientArchived={client.is_archived}
                        />
                      </span>
                    </div>
                  )
                })}
              </Card>

              <Card className="overflow-hidden">
                <div className="px-4 py-3.5">
                  <CardTitle>Tareas</CardTitle>
                </div>
                {pending.length === 0 && <div className="border-t border-border px-4 py-[22px] text-text-muted">Sin tareas pendientes</div>}
                {pending.map((t) => {
                  const overdue = madridDayOf(t.due_at) < today
                  const opp = t.opportunity_id ? oppTitle.get(t.opportunity_id) : undefined
                  return (
                    <TaskRow
                      key={t.id}
                      taskId={t.id}
                      className="grid min-h-[38px] grid-cols-[24px_128px_minmax(0,1fr)_auto_auto] items-center gap-2.5 border-t border-border px-4"
                    >
                      <TaskDoneCheckbox disabled={!editable} />
                      <span className={cn('text-[13px] tabular-nums', overdue && 'font-semibold text-danger')}>{formatDateTime(t.due_at)}</span>
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate">{t.title}</span>
                        {opp && <span className="text-xs text-text-muted">{opp}</span>}
                      </span>
                      <span>
                        <TaskRowStatus>{overdue && <OverdueBadge />}</TaskRowStatus>
                      </span>
                      {editable ? <CancelTaskButton taskId={t.id} title={t.title} /> : <span />}
                    </TaskRow>
                  )
                })}
                <ClosedTasks count={closed.length}>
                  {closed.map((t) => (
                    <div
                      key={t.id}
                      className="grid min-h-9 grid-cols-[128px_minmax(0,1fr)_auto] items-center gap-2.5 border-t border-border py-0 pr-4 pl-[50px] text-[13px] text-text-muted"
                    >
                      <span className="tabular-nums">{formatDateTime(t.due_at)}</span>
                      <span className="truncate line-through">{t.title}</span>
                      <span className="text-xs font-semibold">{TASK_STATUS[t.status]}</span>
                    </div>
                  ))}
                </ClosedTasks>
              </Card>
            </div>

            <div className="flex min-w-0 flex-[35_1_300px] flex-col gap-4">
              {client.notes && (
                <Card className="flex flex-col gap-1.5 px-4 py-3.5">
                  <h3 className="m-0 text-sm font-semibold">Notas</h3>
                  <p className="m-0 whitespace-pre-wrap">{client.notes}</p>
                </Card>
              )}
              <Card className="flex flex-col gap-3 px-4 py-3.5">
                <CardTitle>Actividad</CardTitle>
                {(activities.data ?? []).length === 0 && <span className="text-text-muted">Aún no hay actividad registrada</span>}
                <div className="flex flex-col">
                  {(activities.data ?? []).map((a) => {
                    const Icon = ACTIVITY_ICON[a.type]
                    const opp = a.opportunity_id ? oppTitle.get(a.opportunity_id) : undefined
                    const author = authorName.get(a.created_by)
                    return (
                      <div key={a.id} className="grid grid-cols-[30px_minmax(0,1fr)] gap-2.5 pb-3.5">
                        <span className="flex size-[30px] items-center justify-center rounded-full bg-primary-soft text-primary">
                          <Icon className="size-[15px]" aria-hidden="true" />
                        </span>
                        <div className="flex min-w-0 flex-col gap-[3px]">
                          <span className="flex flex-wrap items-baseline gap-2">
                            <span className="font-semibold">{ACTIVITY_TYPE[a.type]}</span>
                            <span className="text-xs text-text-muted tabular-nums">
                              {formatDateTime(a.occurred_at)}
                              {author && ` · ${author}`}
                            </span>
                          </span>
                          <span className="whitespace-pre-wrap">{a.description}</span>
                          {opp && <span className="text-xs text-text-muted">Oportunidad: {opp}</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </PageBody>
    </>
  )
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-text-muted">{label}</span>
      <span className="font-medium break-words">{children}</span>
    </div>
  )
}
