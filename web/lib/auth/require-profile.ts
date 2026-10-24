import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/database.types'

export type Profile = Pick<
  Tables<'profiles'>,
  'id' | 'full_name' | 'email' | 'role' | 'is_active' | 'must_change_password'
>

// Usuario validado contra Supabase (getUser, nunca getSession) y su perfil leído de `profiles`.
// El rol y el estado salen siempre de la tabla, nunca del JWT ni de datos del cliente.
export const getCurrentProfile = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, profile: null }
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, is_active, must_change_password')
    .eq('id', user.id)
    .maybeSingle()
  return { supabase, user, profile: profile as Profile | null }
})

/**
 * Exige un usuario activo con perfil. Se usa en cada página, Server Action y Route Handler,
 * aunque el proxy ya haya hecho la comprobación.
 */
export async function requireProfile(options: { allowPasswordChange?: boolean } = {}) {
  const { supabase, user, profile } = await getCurrentProfile()
  if (!user) redirect('/acceso')
  // El proxy cierra la sesión al pasar por /acceso con este motivo.
  if (!profile || !profile.is_active) redirect('/acceso?motivo=desactivado')
  if (profile.must_change_password && !options.allowPasswordChange) redirect('/cambiar-contrasena')
  return { supabase, user, profile }
}
