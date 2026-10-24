// Variables públicas de Supabase. Se referencian de forma literal para que Next.js las incluya en el navegador.
// Nunca se imprimen sus valores: solo los nombres de las que faltan.

export function supabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const missing = [
    !url && 'NEXT_PUBLIC_SUPABASE_URL',
    !anonKey && 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ].filter(Boolean)
  if (missing.length > 0 || !url || !anonKey) {
    throw new Error(
      `CRM-123: faltan variables de entorno: ${missing.join(', ')}. ` +
        'Créalas en Vercel → Settings → Environment Variables (Production) y vuelve a desplegar.',
    )
  }
  return { url, anonKey }
}
