import { Skeleton } from '@/components/ui/skeleton'

// Esqueletos de tarjetas (no un spinner a pantalla completa).
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Cargando" className="flex flex-col gap-3 px-4 pt-4 pb-6">
      <Skeleton className="mb-2 h-6 w-40" />
      <div className="grid h-[196px] grid-cols-2 gap-4 rounded-[8px] border border-border bg-surface p-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col gap-2.5">
            <Skeleton className="h-3 w-3/5" />
            <Skeleton className="h-7 w-1/2" />
          </div>
        ))}
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex h-[84px] flex-col gap-3 rounded-[8px] border border-border bg-surface p-4">
          <Skeleton className="h-3.5 w-2/5" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      ))}
    </div>
  )
}
