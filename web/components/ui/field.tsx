import * as React from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// Campo de formulario: etiqueta, control y mensaje de error debajo (12 px, rojo).
export function Field({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
}: {
  label: React.ReactNode
  htmlFor?: string
  error?: string
  hint?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {hint && <span className="ml-1.5 text-xs font-normal text-text-muted">{hint}</span>}
      </Label>
      {children}
      {error && error.trim() && <span className="text-xs text-danger">{error}</span>}
    </div>
  )
}

/** Resumen de errores arriba del formulario ("Revisa los campos marcados."). */
export function FormError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <div role="alert" className="rounded-[6px] bg-danger-soft px-3 py-2.5 text-[13px] font-medium text-danger">
      {message}
    </div>
  )
}
