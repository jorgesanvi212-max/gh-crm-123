'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { BUSINESS_TYPE } from '@/lib/labels'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUrlParams } from './use-url-params'

// Buscador "por nombre o teléfono" y filtro de tipo de negocio (en la URL: ?q= y ?tipo=).
export function ClientsToolbar() {
  const { params, update } = useUrlParams()
  const urlQuery = params.get('q') ?? ''
  const [query, setQuery] = useState(urlQuery)
  // "Limpiar búsqueda" vacía la URL: el campo también se vacía.
  const [lastUrlQuery, setLastUrlQuery] = useState(urlQuery)
  if (lastUrlQuery !== urlQuery) {
    setLastUrlQuery(urlQuery)
    if (!urlQuery) setQuery('')
  }

  // Se busca al dejar de escribir (300 ms).
  useEffect(() => {
    if (query.trim() === urlQuery) return
    const timer = setTimeout(() => update({ q: query.trim() || null }), 300)
    return () => clearTimeout(timer)
  }, [query, urlQuery, update])

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="relative min-w-[220px] max-w-[340px] flex-1">
        <Search className="absolute top-[9px] left-2.5 size-4 text-text-muted" aria-hidden="true" />
        <Input
          type="search"
          aria-label="Buscar por nombre o teléfono"
          placeholder="Buscar por nombre o teléfono"
          value={query}
          maxLength={100}
          onChange={(e) => setQuery(e.target.value)}
          className="h-[34px] pl-8"
        />
      </div>
      <Select value={params.get('tipo') || 'todos'} onValueChange={(v) => update({ tipo: v === 'todos' ? null : v })}>
        <SelectTrigger aria-label="Tipo de negocio" className="min-w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Tipo de negocio: todos</SelectItem>
          {Object.entries(BUSINESS_TYPE).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function ClearSearchButton() {
  const { update } = useUrlParams()
  return (
    <button
      type="button"
      onClick={() => update({ q: null, tipo: null })}
      className="h-8 cursor-pointer rounded-[6px] border border-border bg-surface px-3 font-medium hover:bg-hover-neutral"
    >
      Limpiar búsqueda
    </button>
  )
}
