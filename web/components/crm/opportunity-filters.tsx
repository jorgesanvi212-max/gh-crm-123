'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useUrlParams } from './use-url-params'

const STAGE_FILTERS = [
  ['abiertas', 'Abiertas'],
  ['nueva', 'Nueva'],
  ['oferta_enviada', 'Oferta enviada'],
  ['negociacion', 'Negociación'],
  ['ganada', 'Ganadas'],
  ['perdida', 'Perdidas'],
  ['todas', 'Todas'],
] as const

const DATE_FILTERS = [
  ['todas', 'Cualquier fecha'],
  ['semana', 'Esta semana'],
  ['mes', 'Este mes'],
  ['rango', 'Rango'],
] as const

// Filtros de Oportunidades: etapa (por defecto "Abiertas") y fecha prevista (?etapa=, ?fecha=, ?desde=, ?hasta=).
export function OpportunityFilters() {
  const { params, update } = useUrlParams()
  const stage = params.get('etapa') || 'abiertas'
  const date = params.get('fecha') || 'todas'

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="flex items-center gap-1.5 text-[13px] text-text-muted">
        <span id="stage-filter">Etapa</span>
        <Select value={stage} onValueChange={(v) => update({ etapa: v === 'abiertas' ? null : v })}>
          <SelectTrigger aria-labelledby="stage-filter" className="min-w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STAGE_FILTERS.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ToggleGroup
        type="single"
        aria-label="Fecha prevista"
        value={date}
        onValueChange={(v) => v && update({ fecha: v === 'todas' ? null : v, ...(v !== 'rango' ? { desde: null, hasta: null } : {}) })}
      >
        {DATE_FILTERS.map(([value, label]) => (
          <ToggleGroupItem key={value} value={value}>
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {date === 'rango' && (
        <div className="flex items-center gap-1.5 text-[13px] text-text-muted">
          <Input
            type="date"
            aria-label="Desde"
            defaultValue={params.get('desde') ?? ''}
            onChange={(e) => update({ desde: e.target.value || null })}
            className="h-[34px] w-auto px-2"
          />
          –
          <Input
            type="date"
            aria-label="Hasta"
            defaultValue={params.get('hasta') ?? ''}
            onChange={(e) => update({ hasta: e.target.value || null })}
            className="h-[34px] w-auto px-2"
          />
        </div>
      )}
    </div>
  )
}
