import Link from 'next/link'
import { cn } from '@/lib/utils'

export const PAGE_SIZE = 50

/** Página actual (1, 2, …) desde ?pagina= */
export function pageFrom(value: string): number {
  const page = Number.parseInt(value, 10)
  return Number.isFinite(page) && page > 0 ? page : 1
}

// "1–50 de 120" + Anterior / Siguiente (50 filas por página, paginación en el servidor).
export function Pagination({
  page,
  total,
  noun,
  pathname,
  params,
}: {
  page: number
  total: number
  noun: [string, string]
  pathname: string
  params: Record<string, string | string[] | undefined>
}) {
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, total)
  const href = (p: number) => {
    const query = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string' && key !== 'pagina') query.set(key, value)
    }
    if (p > 1) query.set('pagina', String(p))
    const qs = query.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }
  const linkClass = (enabled: boolean) =>
    cn(
      'flex h-[30px] items-center rounded-[6px] border border-border bg-surface px-2.5 text-text hover:no-underline',
      enabled ? 'hover:bg-hover-neutral hover:text-text' : 'pointer-events-none opacity-50',
    )

  return (
    <div className="flex items-center justify-between text-[13px] text-text-muted">
      <span className="tabular-nums">{total === 0 ? `0 ${noun[1]}` : `${from}–${to} de ${total}`}</span>
      <nav aria-label="Paginación" className="flex gap-1.5">
        <Link href={href(page - 1)} aria-disabled={page <= 1} tabIndex={page <= 1 ? -1 : undefined} className={linkClass(page > 1)}>
          Anterior
        </Link>
        <Link href={href(page + 1)} aria-disabled={to >= total} tabIndex={to >= total ? -1 : undefined} className={linkClass(to < total)}>
          Siguiente
        </Link>
      </nav>
    </div>
  )
}
