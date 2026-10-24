// Formatos de CRM-123: euros, fechas y horas siempre en hora de Madrid (TECHNICAL_SPEC.md §13).
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { TZDate } from '@date-fns/tz'

export const TIME_ZONE = 'Europe/Madrid'

const euros = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  useGrouping: 'always',
})

/** 1234.5 → "1.234,50 €" (agrupa también las cifras de 4 dígitos). */
export function formatEuros(amount: number | string | null | undefined): string {
  return euros.format(Number(amount ?? 0))
}

function inMadrid(value: Date | string | number): TZDate {
  return new TZDate(new Date(value).getTime(), TIME_ZONE)
}

/** "dd/mm/aaaa" en hora de Madrid. */
export function formatDate(value: Date | string | number): string {
  return format(inMadrid(value), 'dd/MM/yyyy')
}

/** "HH:mm" (24 h) en hora de Madrid. */
export function formatTime(value: Date | string | number): string {
  return format(inMadrid(value), 'HH:mm')
}

/** Fecha larga: "Lunes, 02/11/2026". */
export function formatHeaderDate(value: Date | string | number = Date.now()): string {
  const label = format(inMadrid(value), "EEEE, dd/MM/yyyy", { locale: es })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** Cabecera de la PWA: "Lun 02/11". */
export function formatShortHeaderDate(value: Date | string | number = Date.now()): string {
  const day = format(inMadrid(value), 'EEE', { locale: es }).replace('.', '')
  return `${day.charAt(0).toUpperCase()}${day.slice(1, 3)} ${format(inMadrid(value), 'dd/MM')}`
}
