'use server'

import { revalidatePath } from 'next/cache'
import { requireProfile } from '@/lib/auth/require-profile'
import { toUserMessage } from '@/lib/errors'
import { activitySchema, fieldErrors, formValues } from '@/lib/validation/crm'
import { REVIEW_FIELDS, type ActionResult } from './result'

/** Registrar actividad (solo inserción: las actividades no se modifican nunca). */
export async function createActivity(clientId: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireProfile()
  const values = { ...formValues(formData, ['type', 'description', 'occurred_at', 'opportunity_id']), client_id: clientId }
  const parsed = activitySchema.safeParse(values)
  if (!parsed.success) return { error: REVIEW_FIELDS, fieldErrors: fieldErrors(parsed.error) }
  const { client_id, type, description, occurred_at, opportunity_id } = parsed.data

  const { error } = await supabase
    .from('activities')
    .insert({ client_id, type, description, occurred_at: occurred_at as string, opportunity_id })
  if (error) return { error: toUserMessage(error) }
  revalidatePath('/', 'layout')
  return { ok: true, message: 'Actividad registrada' }
}
