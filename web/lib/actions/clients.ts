'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireProfile } from '@/lib/auth/require-profile'
import { toUserMessage } from '@/lib/errors'
import { toE164 } from '@/lib/phone'
import { isPrefixCountry } from '@/lib/phone-prefixes'
import { PHONE_MESSAGES } from '@/lib/phone-messages'
import { clientSchema, fieldErrors, formValues } from '@/lib/validation/crm'
import { isUuid } from '@/lib/validation/uuid'
import { NO_PERMISSION, REVIEW_FIELDS, type ActionResult, type PhoneCheck } from './result'

const CLIENT_FIELDS = [
  'trade_name',
  'business_type',
  'contact_name',
  'prefix',
  'phone',
  'email',
  'delivery_address',
  'city',
  'province',
  'notes',
  'owner_id',
] as const

/** Comprobación del teléfono al salir del campo (RPC phone_status). */
export async function checkPhone(country: string, national: string, clientId?: string): Promise<PhoneCheck> {
  const { supabase } = await requireProfile()
  if (!national.trim()) return { status: null }
  const e164 = isPrefixCountry(country) ? toE164(country, national) : null
  if (!e164) return { status: 'formato_invalido' }

  // Al editar, el teléfono que ya tenía el cliente no es un duplicado.
  if (clientId && isUuid(clientId)) {
    const { data } = await supabase.from('clients').select('phone').eq('id', clientId).maybeSingle()
    if (data?.phone === e164) return { status: null }
  }

  const { data: status, error } = await supabase.rpc('phone_status', { p_phone: e164 })
  if (error || !status) return { status: null }
  if (status === 'propio') {
    const { data } = await supabase.from('clients').select('id').eq('phone', e164).maybeSingle()
    return { status, clientId: data?.id }
  }
  return { status }
}

/** Alta (clientId = null) o edición de un cliente. */
export async function saveClient(clientId: string | null, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { supabase, profile } = await requireProfile()
  const isSupervisor = profile.role === 'supervisor'
  if (clientId !== null && !isUuid(clientId)) return { error: NO_PERMISSION }

  const parsed = clientSchema.safeParse(formValues(formData, CLIENT_FIELDS))
  const errors = parsed.success ? {} : fieldErrors(parsed.error)
  const ownerId = String(formData.get('owner_id') ?? '')
  if (isSupervisor && !isUuid(ownerId)) errors.owner_id = 'Elige un vendedor'

  const phone = parsed.success && isPrefixCountry(parsed.data.prefix) ? toE164(parsed.data.prefix, parsed.data.phone) : null
  if (parsed.success && !phone) errors.phone = PHONE_MESSAGES.formato_invalido

  // Se vuelve a comprobar el teléfono en el servidor (salvo que sea el mismo del cliente que se edita).
  if (phone && !errors.phone) {
    const current = clientId
      ? (await supabase.from('clients').select('phone').eq('id', clientId).maybeSingle()).data?.phone
      : null
    if (phone !== current) {
      const { data: status } = await supabase.rpc('phone_status', { p_phone: phone })
      if (status && status !== 'libre') errors.phone = PHONE_MESSAGES[status]
    }
  }

  if (!parsed.success || !phone || Object.keys(errors).length > 0) return { error: REVIEW_FIELDS, fieldErrors: errors }

  const { trade_name, business_type, contact_name, email, delivery_address, city, province, notes } = parsed.data
  const row = { trade_name, business_type, contact_name, phone, email, delivery_address, city, province, notes }

  const result = clientId
    ? await supabase
        .from('clients')
        .update(isSupervisor ? { ...row, owner_id: ownerId } : row)
        .eq('id', clientId)
        .select('id')
        .maybeSingle()
    : await supabase
        .from('clients')
        .insert({ ...row, owner_id: isSupervisor ? ownerId : profile.id })
        .select('id')
        .single()

  if (result.error) {
    const message = toUserMessage(result.error)
    if (message === 'Ya existe un cliente con este teléfono') {
      return { error: REVIEW_FIELDS, fieldErrors: { phone: message } }
    }
    return { error: message }
  }
  if (!result.data) return { error: NO_PERMISSION }

  revalidatePath('/', 'layout')
  redirect(`/clientes/${result.data.id}?aviso=cliente`)
}

async function requireSupervisor() {
  const context = await requireProfile()
  return context.profile.role === 'supervisor' ? context : null
}

export async function archiveClient(clientId: string): Promise<ActionResult> {
  const context = await requireSupervisor()
  if (!context || !isUuid(clientId)) return { error: NO_PERMISSION }
  const { data, error } = await context.supabase
    .from('clients')
    .update({ is_archived: true })
    .eq('id', clientId)
    .select('id')
    .maybeSingle()
  if (error) return { error: toUserMessage(error) }
  if (!data) return { error: NO_PERMISSION }
  revalidatePath('/', 'layout')
  return { ok: true, message: 'Cliente archivado' }
}

/** Restaurar exige un vendedor activo (preseleccionado si el anterior sigue activo). */
export async function restoreClient(clientId: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const context = await requireSupervisor()
  if (!context || !isUuid(clientId)) return { error: NO_PERMISSION }
  const ownerId = String(formData.get('owner_id') ?? '')
  if (!isUuid(ownerId)) return { error: REVIEW_FIELDS, fieldErrors: { owner_id: 'Elige un vendedor' } }
  const { data, error } = await context.supabase
    .from('clients')
    .update({ is_archived: false, owner_id: ownerId })
    .eq('id', clientId)
    .select('id')
    .maybeSingle()
  if (error) return { error: toUserMessage(error) }
  if (!data) return { error: NO_PERMISSION }
  revalidatePath('/', 'layout')
  return { ok: true, message: 'Cliente restaurado' }
}
