import 'server-only'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'
import { supabaseEnv } from '@/lib/env'

// Cliente con la sesión del usuario (clave anónima + cookies): RLS siempre aplica.
export async function createClient() {
  const cookieStore = await cookies()
  const { url, anonKey } = supabaseEnv()
  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Desde un componente de servidor no se pueden escribir cookies; el proxy renueva la sesión.
        }
      },
    },
  })
}
