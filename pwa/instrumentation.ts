// Comprobación al arrancar el servidor: si falta alguna variable, el registro de Vercel lo dice claramente.
import { supabaseEnv } from './lib/env'

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') supabaseEnv()
}
