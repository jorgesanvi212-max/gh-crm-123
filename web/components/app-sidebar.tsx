'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { LayoutDashboard, SquareCheck, TrendingUp, UserRound, Users, type LucideIcon } from 'lucide-react'
import { LogoutButton } from '@/components/logout-button'
import { cn } from '@/lib/utils'

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/', label: 'Tablero', icon: LayoutDashboard },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/oportunidades', label: 'Oportunidades', icon: TrendingUp },
  { href: '/tareas', label: 'Tareas', icon: SquareCheck },
]

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}

const itemClass = (active: boolean) =>
  cn(
    'flex items-center gap-2.5 rounded-[6px] px-2.5 text-text hover:bg-primary-soft hover:text-text hover:no-underline',
    active ? 'bg-primary-soft font-semibold text-primary-hover hover:text-primary-hover' : 'font-medium',
  )

/**
 * Barra lateral. El filtro "Vendedor" del supervisor (?vendedor=) se mantiene al cambiar de pantalla.
 * `overdueBySeller`: tareas vencidas por vendedor (v_seller_kpis); el contador suma las del filtro actual.
 */
export function AppSidebar({
  fullName,
  roleLabel,
  overdueBySeller,
}: {
  fullName: string
  roleLabel: string
  overdueBySeller: Record<string, number>
}) {
  const pathname = usePathname()
  const params = useSearchParams()
  const seller = params.get('vendedor')
  const keep = seller ? `?vendedor=${encodeURIComponent(seller)}` : ''
  const overdue =
    seller && seller in overdueBySeller
      ? overdueBySeller[seller]
      : Object.values(overdueBySeller).reduce((sum, n) => sum + n, 0)

  return (
    <aside className="flex flex-col gap-1 border-r border-border bg-surface px-3 py-4">
      <div className="px-2.5 pt-1.5 pb-[18px] text-xl font-semibold text-primary">CRM-123</div>
      <nav aria-label="Navegación principal" className="flex flex-col gap-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href)
          return (
            <Link key={href} href={`${href}${keep}`} aria-current={active ? 'page' : undefined} className={cn(itemClass(active), 'h-9')}>
              <Icon className="size-[18px]" aria-hidden="true" />
              <span className="flex-1">{label}</span>
              {href === '/tareas' && overdue > 0 && (
                <span
                  aria-label={`${overdue} tareas vencidas`}
                  className="flex h-5 min-w-5 items-center justify-center rounded-[10px] bg-danger px-1.5 text-xs font-semibold text-white"
                >
                  {overdue}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-0.5 border-t border-border pt-3">
        <div className="flex flex-col gap-0.5 px-2.5 pt-1 pb-2.5">
          <span className="font-semibold">{fullName}</span>
          <span className="text-xs text-text-muted">{roleLabel}</span>
        </div>
        <Link
          href="/mi-cuenta"
          aria-current={isActive(pathname, '/mi-cuenta') ? 'page' : undefined}
          className={cn(itemClass(isActive(pathname, '/mi-cuenta')), 'h-[34px]')}
        >
          <UserRound className="size-4" aria-hidden="true" />
          Mi cuenta
        </Link>
        <LogoutButton className="flex h-[34px] w-full items-center gap-2.5 rounded-[6px] px-2.5 font-medium text-text hover:bg-hover-neutral" />
      </div>
    </aside>
  )
}
