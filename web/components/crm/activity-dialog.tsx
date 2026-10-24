'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import { toast } from 'sonner'
import { createActivity } from '@/lib/actions/activities'
import type { ActionResult } from '@/lib/actions/result'
import { useFormAction } from './use-form-action'
import type { Enums } from '@/lib/database.types'
import { ACTIVITY_TYPE } from '@/lib/labels'
import { toMadridLocalInput } from '@/lib/dates'
import { Button } from '@/components/ui/button'
import { Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Field, FormError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { OppSelect } from './task-dialog'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: { id: string; trade_name: string }
  opportunities: { id: string; title: string }[]
}

export function ActivityDialog({ open, onOpenChange, ...props }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>{open && <ActivityForm {...props} onDone={() => onOpenChange(false)} />}</DialogContent>
    </Dialog>
  )
}

function ActivityForm({ client, opportunities, onDone }: Omit<Props, 'open' | 'onOpenChange'> & { onDone: () => void }) {
  const [type, setType] = useState<Enums<'activity_type'>>('llamada')
  // Por defecto, ahora (hora de Madrid); no se admite una fecha futura.
  const [now] = useState(() => toMadridLocalInput())
  const [state, onSubmit, pending] = useFormAction(async (prev: ActionResult, formData: FormData) => {
    const result = await createActivity(client.id, prev, formData)
    if (result?.ok) {
      toast.success(result.message)
      onDone()
    }
    return result
  })
  const errors = state?.fieldErrors ?? {}

  return (
    <form onSubmit={onSubmit} noValidate>
      <DialogHeader title="Registrar actividad" description={client.trade_name} />
      <DialogBody disabled={pending}>
        <FormError message={state?.error} />
        <div className="flex flex-col gap-1.5">
          <Label id="act-type-label">Tipo *</Label>
          <input type="hidden" name="type" value={type} />
          <ToggleGroup
            type="single"
            variant="solid"
            aria-labelledby="act-type-label"
            value={type}
            onValueChange={(v) => v && setType(v as Enums<'activity_type'>)}
            className="grid grid-cols-5"
          >
            {Object.entries(ACTIVITY_TYPE).map(([value, label]) => (
              <ToggleGroupItem key={value} value={value} className="px-1">
                {label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <Field label="Descripción *" htmlFor="act-desc" error={errors.description}>
          <Textarea id="act-desc" name="description" maxLength={2000} rows={3} aria-invalid={!!errors.description} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha y hora" htmlFor="act-when" error={errors.occurred_at}>
            <Input id="act-when" name="occurred_at" type="datetime-local" defaultValue={now} max={now} aria-invalid={!!errors.occurred_at} />
          </Field>
          <Field label="Oportunidad relacionada" htmlFor="act-opp">
            <OppSelect id="act-opp" options={opportunities} />
          </Field>
        </div>
        <span className="flex items-center gap-1.5 rounded-[6px] bg-info-soft px-2.5 py-2 text-xs text-info">
          <Info className="size-3.5 shrink-0" aria-hidden="true" />
          Las actividades no se pueden modificar una vez guardadas
        </span>
      </DialogBody>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={pending}>
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit" className="px-4" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar actividad'}
        </Button>
      </DialogFooter>
    </form>
  )
}
