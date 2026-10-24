import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeftRight, ChevronRight, LogOut, Shield, UserRound, type LucideIcon } from 'lucide-react'
import { requireProfile } from '@/lib/auth/require-profile'
import { signOut } from '@/lib/auth/actions'
import { ScreenBody, ScreenHeader } from '@/components/screen-header'

export const metadata: Metadata = { title: 'Más' }

const LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/reasignar', label: 'Reasignar clientes', icon: ArrowLeftRight },
  { href: '/auditoria', label: 'Auditoría', icon: Shield },
  { href: '/mi-cuenta', label: 'Mi cuenta', icon: UserRound },
]

const rowClass =
  'flex min-h-14 w-full items-center gap-3 border-t border-border px-4 text-left font-medium text-text first:border-t-0 hover:bg-row-hover hover:text-text hover:no-underline'

export default async function MasPage() {
  await requireProfile()
  return (
    <>
      <ScreenHeader title="Más" />
      <ScreenBody>
        <nav data-screen-label="Más" className="flex flex-col overflow-hidden rounded-[8px] border border-border bg-surface">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={rowClass}>
              <Icon className="size-5 text-primary" aria-hidden="true" />
              <span className="flex-1">{label}</span>
              <ChevronRight className="size-[18px] text-text-muted" aria-hidden="true" />
            </Link>
          ))}
          <form action={signOut} className="border-t border-border">
            <button type="submit" className={`${rowClass} cursor-pointer border-t-0`}>
              <LogOut className="size-5 text-text-muted" aria-hidden="true" />
              <span className="flex-1">Salir</span>
            </button>
          </form>
        </nav>
      </ScreenBody>
    </>
  )
}
