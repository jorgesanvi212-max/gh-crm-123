'use client'

import * as React from 'react'
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

// Botones segmentados: "soft" (filtro de fecha, activo en verde suave) o "solid" (tipo de actividad).
const ToggleContext = React.createContext<'soft' | 'solid'>('soft')

function ToggleGroup({
  className,
  variant = 'soft',
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> & { variant?: 'soft' | 'solid' }) {
  return (
    <ToggleContext value={variant}>
      <ToggleGroupPrimitive.Root
        className={cn('flex gap-px overflow-hidden rounded-[6px] border border-border-input bg-border', className)}
        {...props}
      />
    </ToggleContext>
  )
}

function ToggleGroupItem({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  const variant = React.use(ToggleContext)
  return (
    <ToggleGroupPrimitive.Item
      className={cn(
        'cursor-pointer bg-surface px-3 text-[13px] font-medium text-text',
        variant === 'soft'
          ? 'h-8 data-[state=on]:bg-primary-soft data-[state=on]:text-primary-hover'
          : 'h-[34px] data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
        className,
      )}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }
