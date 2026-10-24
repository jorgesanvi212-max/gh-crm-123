'use client'

import { Button } from '@/components/ui/button'

// Banner rojo a ancho completo con "Reintentar" (DESIGN_BRIEF.md §3).
export default function AppError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="px-4 pt-4 pb-6">
      <div role="alert" className="flex flex-col gap-2.5 rounded-[8px] bg-danger-soft px-3.5 py-3 text-danger">
        <span className="font-semibold">No se han podido cargar los datos.</span>
        <Button variant="destructive-outline" size="sm" onClick={() => retry()}>
          Reintentar
        </Button>
      </div>
    </div>
  )
}
