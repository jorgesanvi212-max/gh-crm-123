'use server'

import { revalidatePath } from 'next/cache'
import { requireProfile } from '@/lib/auth/require-profile'
import { toUserMessage } from '@/lib/errors'
import { fieldErrors, formValues, opportunitySchema, stageSchema } from '@/lib/validation/crm'
import { isUuid } from '@/lib/validation/uuid'
import { NO_PERMISSION, REVIEW_FIELDS, type ActionResult } from './result'

const OPP_FIELDS = ['title', 'description', 'amount', 'expected_close_date', 'stage', 'loss_reason', 'loss_note'] as const

/** Nueva (oppId = null) o editar oportunidad. closed_at y archived_* los pone la base de datos. */
export async function saveOpportunity(
  clientId: string,
  oppId: string | null,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase } = await requireProfile()
  if (!isUuid(clientId) || (oppId !== null && !isUuid(oppId))) return { error: NO_PERMISSION }

  const parsed = opportunitySchema.safeParse(formValues(formData, OPP_FIELDS))
  if (!parsed.success) return { error: REVIEW_FIELDS, fieldErrors: fieldErrors(parsed.error) }
  const values = parsed.data

  let result
  if (oppId) {
    result = await supabase.from('opportunities').update(values).eq('id', oppId).select('id').maybeSingle()
  } else {
    // La oportunidad pertenece siempre al vendedor del cliente.
    const { data: client } = await supabase.from('clients').select('owner_id').eq('id', clientId).maybeSingle()
    if (!client) return { error: NO_PERMISSION }
    result = await supabase
      .from('opportunities')
      .insert({ ...values, client_id: clientId, owner_id: client.owner_id })
      .select('id')
      .single()
  }

  if (result.error) return { error: toUserMessage(result.error) }
  if (!result.data) return { error: NO_PERMISSION }
  revalidatePath('/', 'layout')
  return { ok: true, message: values.stage === 'ganada' ? 'Oportunidad ganada' : 'Oportunidad guardada' }
}

/** Cambiar etapa. "Perdida" exige motivo (y la base de datos lo comprueba). */
export async function changeStage(oppId: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireProfile()
  if (!isUuid(oppId)) return { error: NO_PERMISSION }
  const parsed = stageSchema.safeParse(formValues(formData, ['stage', 'loss_reason', 'loss_note']))
  if (!parsed.success) return { error: REVIEW_FIELDS, fieldErrors: fieldErrors(parsed.error) }

  const { data, error } = await supabase
    .from('opportunities')
    .update(parsed.data)
    .eq('id', oppId)
    .select('id')
    .maybeSingle()
  if (error) return { error: toUserMessage(error) }
  if (!data) return { error: NO_PERMISSION }
  revalidatePath('/', 'layout')
  return { ok: true, message: parsed.data.stage === 'ganada' ? 'Oportunidad ganada' : 'Etapa actualizada' }
}

/** Archivar o restaurar (solo supervisor). */
export async function setOpportunityArchived(oppId: string, archived: boolean): Promise<ActionResult> {
  const { supabase, profile } = await requireProfile()
  if (profile.role !== 'supervisor' || !isUuid(oppId)) return { error: NO_PERMISSION }
  const { data, error } = await supabase
    .from('opportunities')
    .update({ is_archived: archived })
    .eq('id', oppId)
    .select('id')
    .maybeSingle()
  if (error) return { error: toUserMessage(error) }
  if (!data) return { error: NO_PERMISSION }
  revalidatePath('/', 'layout')
  return { ok: true, message: archived ? 'Oportunidad archivada' : 'Oportunidad restaurada' }
}
