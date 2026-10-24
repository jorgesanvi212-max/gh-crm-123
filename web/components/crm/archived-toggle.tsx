'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { useUrlParams } from './use-url-params'

// Casilla "Mostrar archivados" del supervisor (Clientes y Oportunidades).
export function ArchivedToggle() {
  const { params, update } = useUrlParams()
  const checked = params.get('archivados') === '1'
  return (
    <label className="flex cursor-pointer items-center gap-1.5 text-[13px]">
      <Checkbox checked={checked} onCheckedChange={(v) => update({ archivados: v === true ? '1' : null })} />
      Mostrar archivados
    </label>
  )
}
