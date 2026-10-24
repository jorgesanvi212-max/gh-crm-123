import 'server-only'
import type { Profile } from '@/lib/auth/require-profile'
import type { createClient } from '@/lib/supabase/server'
import { isUuid } from '@/lib/validation/uuid'

type Supabase = Awaited<ReturnType<typeof createClient>>
type SearchParams = Record<string, string | string[] | undefined>

export function param(params: SearchParams, key: string): string {
  const value = params[key]
  return (Array.isArray(value) ? value[0] : value) ?? ''
}

/**
 * Alcance de las consultas según el usuario:
 * - vendedor: lo que ya le permite RLS (sus clientes y lo de sus clientes), nunca archivados;
 * - supervisor: "Vendedor: Todos / uno" (?vendedor=) y "Mostrar archivados" (?archivados=1).
 */
export function getScope(profile: Profile, params: SearchParams) {
  const isSupervisor = profile.role === 'supervisor'
  const seller = param(params, 'vendedor')
  return {
    isSupervisor,
    /** Vendedor elegido por el supervisor; null = sin filtro (todo el equipo, o el propio vendedor por RLS). */
    ownerId: isSupervisor && isUuid(seller) ? seller : null,
    showArchived: isSupervisor && param(params, 'archivados') === '1',
  }
}

/** Vendedores activos (para asignar clientes y restaurarlos). */
export async function getActiveSellers(supabase: Supabase) {
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'vendedor')
    .eq('is_active', true)
    .order('full_name')
  return data ?? []
}

/** Clientes archivados visibles: sus oportunidades no se muestran salvo con "Mostrar archivados". */
export async function getArchivedClientIds(supabase: Supabase, ownerId: string | null): Promise<string[]> {
  let query = supabase.from('clients').select('id').eq('is_archived', true)
  if (ownerId) query = query.eq('owner_id', ownerId)
  const { data } = await query
  return (data ?? []).map((c) => c.id)
}
