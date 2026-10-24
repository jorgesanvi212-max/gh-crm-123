import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

// Esqueletos con la forma de la cabecera y de una lista (no un spinner a pantalla completa).
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Cargando">
      <div className="flex flex-col gap-2 px-7 pt-[22px] pb-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="w-32" />
      </div>
      <div className="px-7 pb-8">
        <Card className="overflow-hidden">
          <div className="px-4 py-4">
            <Skeleton className="h-3 w-40" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex h-[38px] items-center gap-3 border-t border-border px-4">
              <Skeleton className="size-4" />
              <Skeleton className="w-[60px]" />
              <Skeleton className="flex-1" />
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
