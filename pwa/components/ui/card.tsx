import * as React from 'react'
import { cn } from '@/lib/utils'

// Tarjetas sin sombra: se separan por un borde de 1 px.
function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn('rounded-[8px] border border-border bg-surface', className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn('flex items-center justify-between gap-3 px-4 py-3.5', className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  return <h2 data-slot="card-title" className={cn('m-0 text-base font-semibold', className)} {...props} />
}

export { Card, CardHeader, CardTitle }
