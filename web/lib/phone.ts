// Teléfonos: validación por país y normalización a E.164 (lo que guarda la base de datos).
import { parsePhoneNumberFromString } from 'libphonenumber-js/min'
import { DEFAULT_PREFIX, PHONE_PREFIXES, type PrefixCountry } from './phone-prefixes'

const E164 = /^\+[1-9][0-9]{7,14}$/

/** Prefijo + número nacional → "+34600123456", o null si no es válido. */
export function toE164(country: PrefixCountry, national: string): string | null {
  const parsed = parsePhoneNumberFromString(national, country)
  if (!parsed || !parsed.isValid()) return null
  return E164.test(parsed.number) ? parsed.number : null
}

/** "+34600123456" → { country: 'ES', national: '600123456' } (para editar). */
export function splitE164(e164: string): { country: PrefixCountry; national: string } {
  const parsed = parsePhoneNumberFromString(e164)
  const code = parsed ? `+${parsed.countryCallingCode}` : ''
  const prefix = PHONE_PREFIXES.find((p) => p.code === code)
  if (!parsed || !prefix) return { country: DEFAULT_PREFIX, national: e164.replace(/^\+/, '') }
  return { country: prefix.country, national: String(parsed.nationalNumber) }
}

/** "+34600123456" → "+34 600 123 456" (grupos de 3 tras el prefijo). */
export function formatPhone(e164: string): string {
  const parsed = parsePhoneNumberFromString(e164)
  if (!parsed) return e164
  const groups = String(parsed.nationalNumber).match(/.{1,3}/g) ?? []
  return [`+${parsed.countryCallingCode}`, ...groups].join(' ')
}
