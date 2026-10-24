import type { Metadata } from 'next'
import Link from 'next/link'
import { requireProfile } from '@/lib/auth/require-profile'
import { Button } from '@/components/ui/button'
import { ScreenBody, ScreenHeader } from '@/components/screen-header'

export const metadata: Metadata = { title: 'Equipo hoy' }

// Hito 2: Equipo hoy en su estado vacío (sin consultas de datos). Los datos llegan en el Hito 4.
export default async function EquipoHoyPage() {
  await requireProfile()
  return (
    <>
      <ScreenHeader title="Equipo hoy" />
      <ScreenBody>
        <div data-screen-label="Equipo hoy" className="flex flex-col gap-3 rounded-[8px] border border-border bg-surface p-5">
          <span>Aún no hay vendedores.</span>
          <Button asChild>
            <Link href="/usuarios/nuevo" className="text-primary-foreground hover:text-primary-foreground hover:no-underline">
              Añadir usuario
            </Link>
          </Button>
        </div>
      </ScreenBody>
    </>
  )
}
