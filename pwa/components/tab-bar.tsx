'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Ellipsis, Mail, UserRound, Users, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS: { href: string; label: string; icon: LucideIcon; match: string[] }[] = [
  { href: '/', label: 'Equipo', icon: Users, match: ['/vendedores'] },
  { href: '/usuarios', label: 'Usuarios', icon: UserRound, match: ['/usuarios'] },
  { href: '/resumen', label: 'Resumen', icon: Mail, match: ['/resumen'] },
  { href: '/mas', label: 'Más', icon: Ellipsis, match: ['/mas', '/reasignar', '/auditoria', '/mi-cuenta'] },
]

function isActive(pathname: string, tab: (typeof TABS)[number]) {
  if (tab.href === '/' && pathname === '/') return true
  return tab.match.some((m) => pathname === m || pathname.startsWith(`${m}/`))
}

// Barra inferior de 4 pestañas, con zona segura inferior.
export function TabBar() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Navegación principal"
      className="sticky bottom-0 z-10 grid flex-none grid-cols-4 border-t border-border bg-surface px-1 pt-1 pb-[max(22px,env(safe-area-inset-bottom))]"
    >
      {TABS.map((tab) => {
        const active = isActive(pathname, tab)
        const Icon = tab.icon
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex min-h-[52px] flex-col items-center justify-center gap-[3px] rounded-[8px] text-xs hover:no-underline',
              active ? 'font-semibold text-primary hover:text-primary' : 'font-medium text-text-muted hover:text-text-muted',
            )}
          >
            <Icon className="size-[22px]" aria-hidden="true" />
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
