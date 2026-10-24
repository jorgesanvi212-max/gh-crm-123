'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Selector "Vendedor: Todos / [nombre]" del supervisor. Se guarda en la URL (?vendedor=…).
export function SellerFilter({ sellers }: { sellers: { id: string; full_name: string }[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const current = params.get('vendedor')
  const value = sellers.some((s) => s.id === current) ? (current as string) : 'todos'

  function onChange(next: string) {
    const query = new URLSearchParams(params)
    if (next === 'todos') query.delete('vendedor')
    else query.set('vendedor', next)
    const qs = query.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  return (
    <div className="flex items-center gap-2 text-[13px] text-text-muted">
      <span id="seller-filter-label">Vendedor:</span>
      <Select value={value} onValueChange={onChange}>
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
