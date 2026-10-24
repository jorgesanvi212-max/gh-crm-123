import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'
import { supabaseEnv } from '@/lib/env'

// Renueva la sesión de Supabase en cada petición y decide a dónde puede ir el usuario.
export async function updateSession(request: NextRequest) {
  const { url, anonKey } = supabaseEnv()
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value))
      },
    },
  })

  // Las redirecciones conservan las cookies y cabeceras de sesión que se acaban de escribir.
  const redirectTo = (target: string) => {
    const redirect = NextResponse.redirect(new URL(target, request.url))
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
    for (const key of ['cache-control', 'expires', 'pragma']) {
      const value = response.headers.get(key)
      if (value) redirect.headers.set(key, value)
    }
    return redirect
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isPublic = path === '/acceso' || path === '/sin-permiso'
  if (!user) return isPublic ? response : redirectTo('/acceso')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active, must_change_password')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || !profile.is_active) {
    await supabase.auth.signOut()
    const shown = path === '/acceso' && request.nextUrl.searchParams.get('motivo') === 'desactivado'
    return shown ? response : redirectTo('/acceso?motivo=desactivado')
  }

  // La PWA es solo para supervisores: un vendedor ve /sin-permiso y se cierra su sesión.
  if (profile.role !== 'supervisor') {
    await supabase.auth.signOut()
    return path === '/sin-permiso' ? response : redirectTo('/sin-permiso')
  }

  if (profile.must_change_password) {
    return path === '/cambiar-contrasena' ? response : redirectTo('/cambiar-contrasena')
  }

  if (path === '/acceso' || path === '/cambiar-contrasena') return redirectTo('/')
  return response
}
