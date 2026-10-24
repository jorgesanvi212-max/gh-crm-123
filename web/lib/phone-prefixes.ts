// Prefijos europeos del selector de teléfono (+34 por defecto). Sin dependencias: se usa también en el navegador.
export const PHONE_PREFIXES = [
  { country: 'ES', code: '+34', flag: '🇪🇸' },
  { country: 'PT', code: '+351', flag: '🇵🇹' },
  { country: 'FR', code: '+33', flag: '🇫🇷' },
  { country: 'IT', code: '+39', flag: '🇮🇹' },
  { country: 'DE', code: '+49', flag: '🇩🇪' },
  { country: 'GB', code: '+44', flag: '🇬🇧' },
  { country: 'NL', code: '+31', flag: '🇳🇱' },
  { country: 'BE', code: '+32', flag: '🇧🇪' },
  { country: 'CH', code: '+41', flag: '🇨🇭' },
  { country: 'IE', code: '+353', flag: '🇮🇪' },
] as const

export type PrefixCountry = (typeof PHONE_PREFIXES)[number]['country']

export const DEFAULT_PREFIX: PrefixCountry = 'ES'

export function isPrefixCountry(value: unknown): value is PrefixCountry {
  return PHONE_PREFIXES.some((p) => p.country === value)
}
