import { Clock } from 'lucide-react'
import type { Enums } from '@/lib/database.types'
import { OPPORTUNITY_STAGE } from '@/lib/labels'
import { Badge } from '@/components/ui/badge'

// Colores de etapa (README.handoff §3.1).
export const STAGE_VARIANT = {
  nueva: 'neutral',
  oferta_enviada: 'info',
  negociacion: 'warning',
  ganada: 'success',
  perdida: 'lost',
} as const

export function StageBadge({ stage }: { stage: Enums<'opportunity_stage'> }) {
  return <Badge variant={STAGE_VARIANT[stage]}>{OPPORTUNITY_STAGE[stage]}</Badge>
}

/** Lo vencido siempre lleva rojo + icono + texto: el color nunca es la única señal. */
export function OverdueBadge() {
  return (
    <Badge variant="danger">
      <Clock strokeWidth={2.5} aria-hidden="true" />
      Vencida
    </Badge>
  )
}
