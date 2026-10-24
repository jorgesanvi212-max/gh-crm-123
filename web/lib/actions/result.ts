import type { PhoneStatus } from '@/lib/database.types'

// Resultado común de las Server Actions de los formularios y diálogos.
export type ActionResult = {
  ok?: boolean
  /** Texto del aviso de éxito (toast). */
  message?: string
  /** Error general (resumen arriba del formulario). */
  error?: string
  /** Mensaje bajo cada campo. */
  fieldErrors?: Record<string, string>
} | null

export type PhoneCheck = { status: PhoneStatus | null; clientId?: string }

export const REVIEW_FIELDS = 'Revisa los campos marcados.'
export const NO_PERMISSION = 'No tienes permiso para esta acción'
