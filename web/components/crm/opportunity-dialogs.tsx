'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { changeStage, saveOpportunity } from '@/lib/actions/opportunities'
import type { ActionResult } from '@/lib/actions/result'
import type { Enums } from '@/lib/database.types'
import { amountToInput, formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  SheetContent,
  SheetHeader,
} from '@/components/ui/dialog'
import { Field, FormError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { StageFields } from './stage-fields'
import { useFormAction } from './use-form-action'

export type OppData = {
  id: string
  client_id: string
  client_name?: string
  title: string
  description: string | null
  amount: number
  stage: Enums<'opportunity_stage'>
  expected_close_date: string
  loss_reason: Enums<'loss_reason'> | null
  loss_note: string | null
  closed_at: string | null
}

const toastResult = (result: ActionResult, done: () => void) => {
  if (result?.ok) {
    toast.success(result.message)
    done()
  }
  return result
}

// Panel lateral "Nueva / Editar oportunidad". Cerrada + vendedor = solo lectura.
export function OpportunitySheet({
  open,
  onOpenChange,
  clientId,
  opp,
  readOnly = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  opp?: OppData
  readOnly?: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <SheetContent aria-describedby={undefined}>
        {open && <OpportunityForm clientId={clientId} opp={opp} readOnly={readOnly} onDone={() => onOpenChange(false)} />}
      </SheetContent>
    </Dialog>
  )
}

function OpportunityForm({ clientId, opp, readOnly, onDone }: { clientId: string; opp?: OppData; readOnly: boolean; onDone: () => void }) {
  const [stage, setStage] = useState<Enums<'opportunity_stage'>>(opp?.stage ?? 'nueva')
  const [state, onSubmit, pending] = useFormAction(async (prev: ActionResult, formData: FormData) =>
    toastResult(await saveOpportunity(clientId, opp?.id ?? null, prev, formData), onDone),
  )
  const errors = state?.fieldErrors ?? {}
  const title = opp ? (readOnly ? 'Oportunidad' : 'Editar oportunidad') : 'Nueva oportunidad'

  return (
    <form onSubmit={onSubmit} noValidate className="flex h-full flex-col">
      <SheetHeader title={title} />
      <div className="flex flex-1 flex-col gap-3.5 overflow-auto p-5">
        {readOnly && opp?.closed_at && (
          <div className="rounded-[6px] bg-neutral-soft px-3 py-2.5 text-[13px] font-medium text-neutral-strong">
            Oportunidad cerrada el {formatDate(opp.closed_at)}. Solo lectura.
          </div>
        )}
        <FormError message={state?.error} />
        <fieldset disabled={readOnly || pending} className="flex flex-col gap-3.5">
          <Field label="Título *" htmlFor="opp-title" error={errors.title}>
            <Input id="opp-title" name="title" maxLength={150} defaultValue={opp?.title} aria-invalid={!!errors.title} />
          </Field>
          <Field label="Detalle de la venta" htmlFor="opp-desc" error={errors.description}>
            <Textarea
              id="opp-desc"
              name="description"
              maxLength={2000}
              rows={3}
              placeholder="200 kg tomate pera + 50 cajas lechuga"
              defaultValue={opp?.description ?? ''}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Importe estimado (€) *" htmlFor="opp-amount" error={errors.amount}>
              <Input
                id="opp-amount"
                name="amount"
                inputMode="decimal"
                placeholder="0,00"
                defaultValue={opp ? amountToInput(opp.amount) : ''}
                className="text-right tabular-nums"
                aria-invalid={!!errors.amount}
              />
            </Field>
            <Field label="Fecha prevista de cierre *" htmlFor="opp-date" error={errors.expected_close_date}>
              <Input
                id="opp-date"
                name="expected_close_date"
                type="date"
                defaultValue={opp?.expected_close_date}
                aria-invalid={!!errors.expected_close_date}
              />
            </Field>
          </div>
          <StageFields
            idPrefix="opp"
            stage={stage}
            onStageChange={setStage}
            lossReason={opp?.loss_reason}
            lossNote={opp?.loss_note}
            errors={errors}
          />
        </fieldset>
      </div>
      <div className="flex justify-end gap-2 border-t border-border px-5 py-3.5">
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={pending}>
            {readOnly ? 'Cerrar' : 'Cancelar'}
          </Button>
        </DialogClose>
        {!readOnly && (
          <Button type="submit" className="px-4" disabled={pending}>
            {pending ? 'Guardando…' : 'Guardar oportunidad'}
          </Button>
        )}
      </div>
    </form>
  )
}

// "Cambiar etapa" (también desde la etiqueta en Oportunidades): Perdida exige motivo.
export function StageDialog({ open, onOpenChange, opp }: { open: boolean; onOpenChange: (open: boolean) => void; opp: OppData }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>{open && <StageForm opp={opp} onDone={() => onOpenChange(false)} />}</DialogContent>
    </Dialog>
  )
}

function StageForm({ opp, onDone }: { opp: OppData; onDone: () => void }) {
  const [stage, setStage] = useState(opp.stage)
  const [state, onSubmit, pending] = useFormAction(async (prev: ActionResult, formData: FormData) =>
    toastResult(await changeStage(opp.id, prev, formData), onDone),
  )
  const errors = state?.fieldErrors ?? {}

  return (
    <form onSubmit={onSubmit} noValidate>
      <DialogHeader title="Cambiar etapa" description={opp.client_name ? `${opp.title} · ${opp.client_name}` : opp.title} />
      <DialogBody disabled={pending}>
        <FormError message={state?.error} />
        <StageFields
          idPrefix="stage"
          stage={stage}
          onStageChange={setStage}
          lossReason={opp.loss_reason}
          lossNote={opp.loss_note}
          errors={errors}
        />
      </DialogBody>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={pending}>
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit" className="px-4" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar'}
        </Button>
      </DialogFooter>
    </form>
  )
}
