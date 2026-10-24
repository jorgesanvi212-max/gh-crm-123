// Traducción de errores de Postgres a mensajes para el usuario (TECHNICAL_SPEC.md §13).
export const GENERIC_ERROR = 'No se ha podido completar la acción. Inténtalo de nuevo'

type DbError = { code?: string; message?: string; details?: string | null } | null | undefined

// Los mensajes propios de la base de datos están en español; los de Postgres, en inglés.
function looksSpanish(message: string): boolean {
  return /[áéíóúñ¿¡]|\b(no|debe|solo|sin|el|la|los|las|un|una|antes|espera)\b/i.test(message)
}

export function toUserMessage(error: DbError): string {
  if (!error) return GENERIC_ERROR
  const message = error.message ?? ''
  const where = `${message} ${error.details ?? ''}`
  switch (error.code) {
    case '23505':
      if (where.includes('clients_phone_key')) return 'Ya existe un cliente con este teléfono'
      if (where.includes('profiles_email_key')) return 'Ya existe un usuario con este email'
      return GENERIC_ERROR
    case '23514':
      return 'Revisa los datos del formulario'
    case '42501':
      return message && looksSpanish(message) ? message : 'No tienes permiso para esta acción'
    case 'P0001':
      return message || GENERIC_ERROR
    default:
      return GENERIC_ERROR
  }
}
