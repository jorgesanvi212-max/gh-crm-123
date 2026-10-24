import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const alertVariants = cva('flex items-center gap-2.5 rounded-[8px] border px-3.5 py-2.5 [&>svg]:size-[18px] [&>svg]:shrink-0', {
  variants: {
    variant: {
      destructive: 'border-danger-banner-border bg-danger-soft text-danger',
      // Mensajes de error dentro de formularios (sin borde, radio de control).
      'destructive-inline': 'rounded-[8px] border-transparent bg-danger-soft px-3.5 py-3 text-[15px] font-medium text-danger',
      warning: 'border-transparent bg-warning-soft text-warning-text',
      info: 'border-transparent bg-info-soft text-info',
      neutral: 'border-neutral-border bg-neutral-soft text-neutral-strong',
      success: 'border-primary-soft-border bg-primary-soft text-primary-hover',
    },
  },
  defaultVariants: { variant: 'neutral' },
})

function Alert({ className, variant, ...props }: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
}

export { Alert, alertVariants }
