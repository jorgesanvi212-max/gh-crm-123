'use client'

import type { Enums } from '@/lib/database.types'
import { LOSS_REASON, OPPORTUNITY_STAGE } from '@/lib/labels'
import { Field } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

type Stage = Enums<'opportunity_stage'>

/** Etapa y, si es "Perdida", motivo obligatorio + nota opcional. */
export function StageFields({
  stage,
  onStageChange,
  lossReason,
  lossNote,
  errors,
  idPrefix,
}: {
  stage: Stage
  onStageChange: (stage: Stage) => void
  lossReason?: string | null
  lossNote?: string | null
  errors: Record<string, string>
  idPrefix: string
}) {
  return (
    <>
      <Field label="Etapa *" htmlFor={`${idPrefix}-stage`} error={errors.stage}>
        <Select name="stage" value={stage} onValueChange={(v) => onStageChange(v as Stage)}>
          <SelectTrigger id={`${idPrefix}-stage`} className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(OPPORTUNITY_STAGE).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      {stage === 'perdida' && (
        <>
          <Field label="Motivo de la pérdida *" htmlFor={`${idPrefix}-loss`} error={errors.loss_reason}>
            <Select name="loss_reason" defaultValue={lossReason ?? undefined}>
              <SelectTrigger id={`${idPrefix}-loss`} className="h-9" aria-invalid={!!errors.loss_reason}>
                <SelectValue placeholder="Selecciona…" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LOSS_REASON).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Nota (opcional)" htmlFor={`${idPrefix}-note`} error={errors.loss_note}>
            <Textarea id={`${idPrefix}-note`} name="loss_note" maxLength={500} rows={2} defaultValue={lossNote ?? ''} />
          </Field>
        </>
      )}
    </>
  )
}
