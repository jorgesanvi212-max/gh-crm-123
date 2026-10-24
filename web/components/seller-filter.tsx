'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUrlParams } from '@/components/crm/use-url-params'

// Selector "Vendedor: Todos / [nombre]" del supervisor. Se guarda en la URL (?vendedor=…) y filtra todas las pantallas.
export function SellerFilter({ sellers }: { sellers: { id: string; full_name: string }[] }) {
  const { params, update } = useUrlParams()
  const current = params.get('vendedor')
  const value = sellers.some((s) => s.id === current) ? (current as string) : 'todos'

  return (
    <div className="flex items-center gap-2 text-[13px] text-text-muted">
      <span id="seller-filter-label">Vendedor:</span>
      <Select value={value} onValueChange={(next) => update({ vendedor: next === 'todos' ? null : next })}>
        <SelectTrigger aria-labelledby="seller-filter-label" className="min-w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          {sellers.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
