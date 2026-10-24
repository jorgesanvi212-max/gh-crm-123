'use server'

import { revalidatePath } from 'next/cache'
import { requireProfile } from '@/lib/auth/require-profile'
import { toUserMessage } from '@/lib/errors'
import { fieldErrors, formValues, taskSchema } from '@/lib/validation/crm'
import { isUuid } from '@/lib/validation/uuid'
import { NO_PERMISSION, REVIEW_FIELDS, type ActionResult } from './result'

/** Nueva tarea. Desde la ficha el cliente es fijo; desde Tareas se elige en el formulario. */
export async function createTask(fixedClientId: string | null, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireProfile()
  const values = formValues(formData, ['client_id', 'title', 'due_at', 'opportunity_id'])
  if (fixedClientId) values.client_id = fixedClientId

  const parsed = taskSchema.safeParse(values)
  if (!parsed.success) return { error: REVIEW_FIELDS, fieldErrors: fieldErrors(parsed.error) }
  const { client_id, title, due_at, opportunity_id } = parsed.data

  // La tarea pertenece siempre al vendedor del cliente.
  const { data: client } = await supabase.from('clients').select('owner_id').eq('id', client_id).maybeSingle()
  if (!client) return { error: REVIEW_FIELDS, fieldErrors: { client_id: 'Elige un cliente' } }

  const { error } = await supabase
    .from('tasks')
    .insert({ client_id, title, due_at: due_at as string, opportunity_id, owner_id: client.owner_id })
  if (error) return { error: toUserMessage(error) }
  revalidatePath('/', 'layout')
  return { ok: true, message: 'Tarea guardada' }
}

async function setTaskStatus(taskId: string, status: 'hecha' | 'cancelada', message: string): Promise<ActionResult> {
  const { supabase } = await requireProfile()
  if (!isUuid(taskId)) return { error: NO_PERMISSION }
  const { data, error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId)
    .eq('status', 'pendiente')
    .select('id')
    .maybeSingle()
  if (error) return { error: toUserMessage(error) }
  if (!data) return { error: NO_PERMISSION }
  revalidatePath('/', 'layout')
  return { ok: true, message }
}

export async function completeTask(taskId: string): Promise<ActionResult> {
  return setTaskStatus(taskId, 'hecha', 'Tarea marcada como hecha')
}

export async function cancelTask(taskId: string): Promise<ActionResult> {
  return setTaskStatus(taskId, 'cancelada', 'Tarea cancelada')
}
