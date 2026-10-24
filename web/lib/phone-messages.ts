import type { PhoneStatus } from '@/lib/database.types'

// Avisos de la comprobación del teléfono (DESIGN_BRIEF.md §5.6). Nunca revelan datos de otro vendedor.
export const PHONE_MESSAGES: Record<Exclude<PhoneStatus, 'libre'>, string> = {
  propio: 'Este cliente ya está en tu cartera',
  otro_vendedor: 'Este cliente ya está asignado. Contacta con tu supervisor',
  archivado: 'Este teléfono pertenece a un cliente archivado. Contacta con tu supervisor',
  formato_invalido: 'Teléfono no válido',
}
