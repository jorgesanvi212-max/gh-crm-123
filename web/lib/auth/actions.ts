'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireProfile } from '@/lib/auth/require-profile'
import { changePasswordSchema, signInSchema } from '@/lib/validation/auth'
import { GENERIC_ERROR, toUserMessage } from '@/lib/errors'

export type FormState = { error?: string; ok?: boolean; email?: string } | null

const LOGIN_ERROR = 'Email o contraseña incorrectos'
const INACTIVE_ERROR = 'Tu acceso está desactivado. Contacta con tu supervisor'

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get('email') ?? '').slice(0, 200)
  const parsed = signInSchema.safeParse({ email, password: formData.get('password') })
  if (!parsed.success) return { error: LOGIN_ERROR, email }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data)
  // Mensaje genérico ante cualquier error: no se detalla la causa.
  if (error || !data.user) return { error: LOGIN_ERROR, email }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_active, must_change_password')
    .eq('id', data.user.id)
    .maybeSingle()
  if (!profile || !profile.is_active) {
    await supabase.auth.signOut()
    return { error: INACTIVE_ERROR, email }
  }

  redirect(profile.must_change_password ? '/cambiar-contrasena' : '/')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/acceso')
}

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, user, profile } = await requireProfile({ allowPasswordChange: true })

  const parsed = changePasswordSchema.safeParse({
    current: formData.get('current') ?? '',
    next: formData.get('next') ?? '',
    repeat: formData.get('repeat') ?? '',
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR }

  // La contraseña actual se verifica volviendo a entrar con ella.
  const { error: currentError } = await supabase.auth.signInWithPassword({
    email: user.email ?? profile.email,
    password: parsed.data.current,
  })
  if (currentError) return { error: 'La contraseña actual no es correcta' }

  const { error: updateError } = await supabase.auth.updateUser({ password: parsed.data.next })
  if (updateError) {
    if (updateError.code === 'same_password') return { error: 'La nueva contraseña debe ser distinta de la actual' }
    if (updateError.code === 'weak_password') return { error: 'Revisa los requisitos de la nueva contraseña' }
    return { error: GENERIC_ERROR }
  }

  const { error: rpcError } = await supabase.rpc('mark_password_changed')
  if (rpcError) return { error: toUserMessage(rpcError) }

  // Primer acceso: al Tablero, con el aviso de éxito.
  if (profile.must_change_password) redirect('/?aviso=contrasena')
  return { ok: true }
}
