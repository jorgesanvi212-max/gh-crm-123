'use client'

import { CircleAlert } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

// Banner rojo sobre el contenido con "Reintentar" (DESIGN_BRIEF.md §3).
export default function AppError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="px-7 pt-[18px] pb-8">
      <Alert variant="destructive">
        <CircleAlert />
        <span className="flex-1 font-medium">No se han podido cargar los datos.</span>
        <Button variant="destructive-outline" size="sm" className="h-[30px]" onClick={() => retry()}>
          Reintentar
        </Button>
      </Alert>
    </div>
  )
}
