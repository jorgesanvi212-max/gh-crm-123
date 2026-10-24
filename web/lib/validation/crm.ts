// Esquemas Zod: espejo de las restricciones de SCRIPTS-SQL.md, con los mensajes del diseño.
import { z } from 'zod'
import { isISODate, madridLocalToISO } from '@/lib/dates'
import { PHONE_PREFIXES } from '@/lib/phone-prefixes'
import { isUuid } from '@/lib/validation/uuid'

const BUSINESS_TYPES = ['fruteria', 'hosteleria', 'supermercado', 'mercado_mayorista', 'otro'] as const
export const STAGES = ['nueva', 'oferta_enviada', 'negociacion', 'ganada', 'perdida'] as const
const LOSS_REASONS = ['precio', 'calidad', 'plazo', 'competencia', 'otro'] as const
const ACTIVITY_TYPES = ['llamada', 'visita', 'whatsapp', 'email', 'nota'] as const
const COUNTRIES = PHONE_PREFIXES.map((p) => p.country) as [string, ...string[]]

const TOO_LONG = 'Texto demasiado largo'
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, TOO_LONG)
    .transform((v) => v || null)

const optionalUuid = z
  .string()
  .transform((v) => v || null)
  .refine((v) => v === null || isUuid(v), 'Elige una opción válida')

/** Acepta "1234,5", "1.234,50" o "1234.50" → número con 2 decimales; null si no es válido. */
export function parseAmount(raw: string): number | null {
  let value = raw.replace(/[\s€]/g, '')
  if (!value) return null
  if (value.includes(',')) value = value.replace(/\./g, '').replace(',', '.')
  else if (/^\d{1,3}(\.\d{3})+$/.test(value)) value = value.replace(/\./g, '')
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return null
  const amount = Number(value)
  return amount >= 0 && amount < 1e10 ? Math.round(amount * 100) / 100 : null
}

export const clientSchema = z.object({
  trade_name: z.string().trim().min(2, 'Escribe el nombre comercial (mínimo 2 caracteres)').max(150, TOO_LONG),
  business_type: z.enum(BUSINESS_TYPES, { message: 'Elige el tipo de negocio' }),
  contact_name: z.string().trim().min(2, 'Escribe la persona de contacto (mínimo 2 caracteres)').max(120, TOO_LONG),
  prefix: z.enum(COUNTRIES, { message: 'Teléfono no válido' }),
  phone: z.string().trim().min(1, 'Escribe el teléfono').max(30, 'Teléfono no válido'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254, 'Email no válido')
    .refine((v) => !v || EMAIL.test(v), 'Email no válido')
    .transform((v) => v || null),
  delivery_address: optionalText(250),
  city: optionalText(100),
  province: optionalText(100),
  notes: optionalText(2000),
  owner_id: z.string().optional(),
})

export const opportunitySchema = z
  .object({
    title: z.string().trim().min(2, 'Escribe un título de al menos 2 caracteres').max(150, TOO_LONG),
    description: optionalText(2000),
    amount: z
      .string()
      .transform((v) => parseAmount(v))
      .refine((v) => v !== null, 'Indica un importe igual o mayor que 0'),
    expected_close_date: z.string().refine(isISODate, 'Elige la fecha prevista de cierre'),
    stage: z.enum(STAGES, { message: 'Elige una etapa' }),
    loss_reason: z.string().optional(),
    loss_note: optionalText(500),
  })
  .superRefine((v, ctx) => {
    if (v.stage === 'perdida' && !LOSS_REASONS.includes(v.loss_reason as never)) {
      ctx.addIssue({ code: 'custom', path: ['loss_reason'], message: 'Elige el motivo de la pérdida' })
    }
  })
  .transform((v) => ({
    ...v,
    amount: v.amount as number,
    loss_reason: v.stage === 'perdida' ? (v.loss_reason as (typeof LOSS_REASONS)[number]) : null,
    loss_note: v.stage === 'perdida' ? v.loss_note : null,
  }))

export const stageSchema = z
  .object({
    stage: z.enum(STAGES, { message: 'Elige una etapa' }),
    loss_reason: z.string().optional(),
    loss_note: optionalText(500),
  })
  .superRefine((v, ctx) => {
    if (v.stage === 'perdida' && !LOSS_REASONS.includes(v.loss_reason as never)) {
      ctx.addIssue({ code: 'custom', path: ['loss_reason'], message: 'Elige el motivo de la pérdida' })
    }
  })
  .transform((v) => ({
    stage: v.stage,
    loss_reason: v.stage === 'perdida' ? (v.loss_reason as (typeof LOSS_REASONS)[number]) : null,
    loss_note: v.stage === 'perdida' ? v.loss_note : null,
  }))

export const taskSchema = z.object({
  client_id: z.string().refine(isUuid, 'Elige un cliente'),
  title: z.string().trim().min(2, 'Escribe un título de al menos 2 caracteres').max(150, TOO_LONG),
  due_at: z
    .string()
    .transform((v) => madridLocalToISO(v))
    .refine((v) => v !== null, 'Elige fecha y hora'),
  opportunity_id: optionalUuid,
})

export const activitySchema = z.object({
  client_id: z.string().refine(isUuid, 'Elige un cliente'),
  type: z.enum(ACTIVITY_TYPES, { message: 'Elige el tipo' }),
  description: z.string().trim().min(1, 'Escribe una descripción').max(2000, TOO_LONG),
  occurred_at: z
    .string()
    .transform((v) => (v ? madridLocalToISO(v) : new Date().toISOString()))
    .refine((v) => v !== null, 'Elige fecha y hora')
    .refine((v) => v === null || new Date(v).getTime() <= Date.now(), 'La fecha no puede ser futura'),
  opportunity_id: optionalUuid,
})

/** Primer mensaje de cada campo con error. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form')
    if (!out[key]) out[key] = issue.message
  }
  return out
}

/** FormData → objeto plano de textos (los campos ausentes, vacíos). */
export function formValues(formData: FormData, keys: readonly string[]): Record<string, string> {
  return Object.fromEntries(keys.map((k) => [k, String(formData.get(k) ?? '')]))
}
