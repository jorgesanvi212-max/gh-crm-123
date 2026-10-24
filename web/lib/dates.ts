// Fechas de negocio en hora de Madrid ("hoy", semanas, meses) y conversión hora de Madrid ↔ UTC.
import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from 'date-fns'
import { TZDate } from '@date-fns/tz'
import { TIME_ZONE } from './format'

function madridNow(): TZDate {
  return new TZDate(Date.now(), TIME_ZONE)
}

/** Fecha de hoy en Madrid, "yyyy-MM-dd". */
export function todayISO(): string {
  return format(madridNow(), 'yyyy-MM-dd')
}

/** Suma días a una fecha "yyyy-MM-dd" (sin horas, sin zonas). */
export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

/** Semana actual de lunes a domingo, en Madrid. */
export function currentWeekISO(): [string, string] {
  const now = madridNow()
  return [
    format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  ]
}

/** Mes actual, en Madrid. */
export function currentMonthISO(): [string, string] {
  const now = madridNow()
  return [format(startOfMonth(now), 'yyyy-MM-dd'), format(endOfMonth(now), 'yyyy-MM-dd')]
}

export function isISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

/** "yyyy-MM-ddTHH:mm" introducido en hora de Madrid → instante UTC (ISO). */
export function madridLocalToISO(local: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local)
  if (!m || !isISODate(`${m[1]}-${m[2]}-${m[3]}`)) return null
  const date = new TZDate(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], TIME_ZONE)
  return Number.isNaN(date.getTime()) ? null : new Date(date.getTime()).toISOString()
}

/** Instante → valor de un campo datetime-local en hora de Madrid. */
export function toMadridLocalInput(value: Date | string | number = Date.now()): string {
  return format(new TZDate(new Date(value).getTime(), TIME_ZONE), "yyyy-MM-dd'T'HH:mm")
}

/** Día (en Madrid) de un instante, "yyyy-MM-dd": para saber si una tarea está vencida o es de hoy. */
export function madridDayOf(value: Date | string | number): string {
  return format(new TZDate(new Date(value).getTime(), TIME_ZONE), 'yyyy-MM-dd')
}
