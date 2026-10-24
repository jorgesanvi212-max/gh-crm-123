'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Archive, ChevronDown, Copy, Pencil, Plus, SquareCheck, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { archiveClient, restoreClient } from '@/lib/actions/clients'
import type { ActionResult } from '@/lib/actions/result'
import { Button } from '@/components/ui/button'
import { Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Field, FormError } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ActivityDialog } from './activity-dialog'
import { ConfirmDialog } from './confirm-dialog'
import { OpportunitySheet } from './opportunity-dialogs'
import { TaskDialog } from './task-dialog'
import { useFormAction } from './use-form-action'

type Client = { id: string; trade_name: string }
type Dialog = 'opp' | 'task' | 'act' | 'archive' | null

// Acciones de la cabecera de la ficha: Editar · Nueva oportunidad · Nueva tarea · Registrar actividad · Más (supervisor).
export function ClientActions({
  client,
  isSupervisor,
  openOpportunities,
}: {
  client: Client
  isSupervisor: boolean
  openOpportunities: { id: string; title: string }[]
}) {
  const [dialog, setDialog] = useState<Dialog>(null)
  const close = (open: boolean) => !open && setDialog(null)

  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="outline" className="h-[34px] px-3">
        <Link href={`/clientes/${client.id}/editar`} className="text-text hover:text-text hover:no-underline">
          <Pencil className="size-[15px]" aria-hidden="true" />
          Editar
        </Link>
      </Button>
      <Button variant="outline" className="h-[34px] px-3" onClick={() => setDialog('opp')}>
        <TrendingUp className="size-[15px]" aria-hidden="true" />
        Nueva oportunidad
      </Button>
      <Button variant="outline" className="h-[34px] px-3" onClick={() => setDialog('task')}>
        <SquareCheck className="size-[15px]" aria-hidden="true" />
        Nueva tarea
      </Button>
      <Button className="h-[34px] px-3" onClick={() => setDialog('act')}>
        <Plus className="size-[15px]" aria-hidden="true" />
        Registrar actividad
      </Button>
      {isSupervisor && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-[34px] px-3">
              Más
              <ChevronDown className="size-3.5" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-[180px]">
            <DropdownMenuItem onSelect={() => setDialog('archive')}>
              <Archive aria-hidden="true" />
              Archivar cliente
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <OpportunitySheet open={dialog === 'opp'} onOpenChange={close} clientId={client.id} />
      <TaskDialog
        open={dialog === 'task'}
        onOpenChange={close}
        client={client}
        opportunities={openOpportunities.map((o) => ({ ...o, client_id: client.id }))}
      />
      <ActivityDialog open={dialog === 'act'} onOpenChange={close} client={client} opportunities={openOpportunities} />
      <ConfirmDialog
        open={dialog === 'archive'}
        onOpenChange={close}
        title="Archivar cliente"
        subtitle={client.trade_name}
        text="El cliente dejará de verse en las listas del vendedor. Podrás restaurarlo cuando quieras."
        confirmLabel="Archivar"
        pendingLabel="Archivando…"
        action={() => archiveClient(client.id)}
      />
    </div>
  )
}

// Botón "Restaurar" del banner de cliente archivado: pide el vendedor asignado.
export function RestoreClientButton({
  client,
  sellers,
  defaultOwnerId,
}: {
  client: Client
  sellers: { id: string; full_name: string }[]
  defaultOwnerId?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="outline" size="sm" className="h-[30px] border-border-input" onClick={() => setOpen(true)}>
        Restaurar
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          {open && <RestoreForm client={client} sellers={sellers} defaultOwnerId={defaultOwnerId} onDone={() => setOpen(false)} />}
        </DialogContent>
      </Dialog>
    </>
  )
}

function RestoreForm({
  client,
  sellers,
  defaultOwnerId,
  onDone,
}: {
  client: Client
  sellers: { id: string; full_name: string }[]
  defaultOwnerId?: string
  onDone: () => void
}) {
  const [state, onSubmit, pending] = useFormAction(async (prev: ActionResult, formData: FormData) => {
    const result = await restoreClient(client.id, prev, formData)
    if (result?.ok) {
      toast.success(result.message)
      onDone()
    }
    return result
  })
  const errors = state?.fieldErrors ?? {}

  return (
    <form onSubmit={onSubmit} noValidate>
      <DialogHeader title="Restaurar cliente" description={client.trade_name} />
      <DialogBody disabled={pending}>
        <FormError message={state?.error} />
        <Field label="Vendedor asignado *" htmlFor="restore-owner" error={errors.owner_id}>
          <Select name="owner_id" defaultValue={defaultOwnerId}>
            <SelectTrigger id="restore-owner" className="h-9" aria-invalid={!!errors.owner_id}>
              <SelectValue placeholder="Selecciona…" />
            </SelectTrigger>
            <SelectContent>
              {sellers.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </DialogBody>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={pending}>
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit" className="px-4" disabled={pending}>
          {pending ? 'Restaurando…' : 'Restaurar'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function CopyPhoneButton({ phone }: { phone: string }) {
  return (
    <Button
      variant="outline"
      size="icon"
      className="size-[26px]"
      aria-label="Copiar teléfono"
      title="Copiar teléfono"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(phone)
          toast.success('Teléfono copiado')
        } catch {
          toast.error('No se ha podido copiar el teléfono')
        }
      }}
    >
      <Copy className="size-[13px]" />
    </Button>
  )
}
