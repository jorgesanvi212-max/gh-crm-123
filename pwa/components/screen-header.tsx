import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { formatShortHeaderDate } from '@/lib/format'

// Cabecera común: título a la izquierda (con Volver si aplica) y fecha corta a la derecha.
export function ScreenHeader({ title, backHref }: { title: string; backHref?: string }) {
  return (
    <header className="sticky top-0 z-10 flex min-h-14 flex-none items-center gap-2 bg-bg px-4 pt-[max(6px,env(safe-area-inset-top))] pb-2.5">
      {backHref && (
        <Link
          href={backHref}
          aria-label="Volver"
          className="-ml-2.5 flex size-11 items-center justify-center rounded-full text-text hover:bg-skeleton hover:text-text hover:no-underline"
        >
          <ChevronLeft className="size-[22px]" aria-hidden="true" />
        </Link>
      )}
      <h1 className="m-0 flex-1 truncate text-[22px] font-semibold tracking-[-0.01em]">{title}</h1>
      <span className="text-sm font-medium text-text-muted">{formatShortHeaderDate()}</span>
    </header>
  )
}

export function ScreenBody({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col gap-3 px-4 pb-6">{children}</div>
}
