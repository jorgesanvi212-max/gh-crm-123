import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'
import { supabaseEnv } from '@/lib/env'

// Cliente del navegador (clave anónima). Las escrituras se hacen con Server Actions.
export function createClient() {
  const { url, anonKey } = supabaseEnv()
  return createBrowserClient<Database>(url, anonKey)
}
