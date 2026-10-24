import type { Metadata } from 'next'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageBody } from '@/components/page-body'

export const metadata: Metadata = { title: 'Sin permiso' }

export default function SinPermisoPage() {
  return (
    <PageBody className="pt-[18px]">
      <div data-screen-label="Sin permiso" className="flex max-w-[460px] flex-1 flex-col items-start gap-3 py-16">
        <Lock className="size-7 text-text-muted" aria-hidden="true" />
        <h1 className="m-0 text-xl font-semibold">No tienes permiso para ver esto</h1>
        <Button asChild variant="outline">
          <Link href="/" className="text-text hover:text-text hover:no-underline">
            Volver al inicio
          </Link>
        </Button>
      </div>
    </PageBody>
  )
}
