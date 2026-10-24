'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createTask } from '@/lib/actions/tasks'
import { toMadridLocalInput } from '@/lib/dates'
import type { ActionResult } from '@/lib/actions/result'
import { useFormAction } from './use-form-action'
import { Button } from '@/components/ui/button'
import { Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Field, FormError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export type OppOption = { id: string; title: string; client_id: string }

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Desde la ficha: cliente fijo. Desde Tareas: null y se elige en el selector. */
  client: { id: string; trade_name: string } | null
  clients?: { id: string; trade_name: string }[]
  opportunities: OppOption[]
}

export function TaskDialog({ open, onOpenChange, ...props }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>{open && <TaskForm {...props} onDone={() => onOpenChange(false)} />}</DialogContent>
    </Dialog>
  )
}

function TaskForm({ client, clients = [], opportunities, onDone }: Omit<Props, 'open' | 'onOpenChange'> & { onDone: () => void }) {
  const [clientId, setClientId] = useState(client?.id ?? '')
  // Por defecto, la próxima hora en punto (hora de Madrid).
  const [defaultDue] = useState(() => toMadridLocalInput(Date.now() + 3_600_000).slice(0, 14) + '00')
  const [state, onSubmit, pending] = useFormAction(async (prev: ActionResult, formData: FormData) => {
    const result = await createTask(client?.id ?? null, prev, formData)
    if (result?.ok) {
      toast.success(result.message)
      onDone()
    }
    return result
  })
  const errors = state?.fieldErrors ?? {}
  const oppOptions = opportunities.filter((o) => o.client_id === clientId)

  return (
    <form onSubmit={onSubmit} noValidate>
      <DialogHeader title="Nueva tarea" description={client?.trade_name} />
      <DialogBody disabled={pending}>
        <FormError message={state?.error} />
        {!client && (
          <Field label="Cliente *" htmlFor="task-client" error={errors.client_id}>
            <Select name="client_id" value={clientId} onValueChange={setClientId}>
              <SelectTrigger id="task-client" className="h-9" aria-invalid={!!errors.client_id}>
                <SelectValue placeholder="Selecciona…" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.trade_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
        <Field label="Título *" htmlFor="task-title" error={errors.title}>
          <Input id="task-title" name="title" maxLength={150} placeholder="Llamar el jueves 9:00" aria-invalid={!!errors.title} />
        </Field>
        <Field label="Fecha y hora de vencimiento *" hint="Hora de Madrid" htmlFor="task-due" error={errors.due_at}>
          <Input id="task-due" name="due_at" type="datetime-local" defaultValue={defaultDue} aria-invalid={!!errors.due_at} />
        </Field>
        <Field label="Oportunidad relacionada (opcional)" htmlFor="task-opp">
          <OppSelect id="task-opp" options={oppOptions} key={clientId} />
        </Field>
      </DialogBody>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={pending}>
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit" className="px-4" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar tarea'}
        </Button>
      </DialogFooter>
    </form>
  )
}

/** Selector "Ninguna / oportunidades abiertas del cliente" (Radix no admite un valor vacío). */
export function OppSelect({ id, options }: { id: string; options: { id: string; title: string }[] }) {
  const [value, setValue] = useState('ninguna')
  return (
    <>
      <input type="hidden" name="opportunity_id" value={value === 'ninguna' ? '' : value} />
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger id={id} className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ninguna">Ninguna</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )
}
