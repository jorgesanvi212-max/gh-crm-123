import Link from 'next/link'
import { ChevronLeft, Plus } from 'lucide-react'
import { getCurrentProfile } from '@/lib/auth/require-profile'
import { formatHeaderDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { SellerFilter } from '@/components/seller-filter'

type Props = {
  title: string
  back?: { href: string; label: string }
  primary?: { href: string; label: string }
}

// Cabecera de contenido: título, fecha de hoy (Madrid), selector de vendedor (supervisor) y botón principal.
export async function PageHeader({ title, back, primary }: Props) {
  const { supabase, profile } = await getCurrentProfile()
  const isSupervisor = profile?.role === 'supervisor'
  const sellers = isSupervisor
    ? ((await supabase.from('profiles').select('id, full_name').eq('role', 'vendedor').order('full_name')).data ?? [])
    : []

  return (
    <header className="flex flex-wrap items-center gap-4 px-7 pt-[18px] pb-3.5">
      <div className="flex min-w-[200px] flex-1 flex-col gap-0.5">
        {back && (
          <Link
            href={back.href}
            className="flex items-center gap-1 self-start text-[13px] text-text-muted hover:text-primary hover:no-underline"
          >
            <ChevronLeft className="size-3.5" aria-hidden="true" />
            {back.label}
          </Link>
        )}
        <h1 className="m-0 text-xl font-semibold tracking-[-0.01em]">{title}</h1>
        <span className="text-[13px] text-text-muted">{formatHeaderDate()}</span>
      </div>
      {isSupervisor && <SellerFilter sellers={sellers} />}
      {primary && (
        <Button asChild>
          <Link href={primary.href} className="text-primary-foreground hover:text-primary-foreground hover:no-underline">
            <Plus aria-hidden="true" />
            {primary.label}
          </Link>
        </Button>
      )}
    </header>
  )
}
