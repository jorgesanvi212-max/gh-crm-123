import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex h-[22px] shrink-0 items-center gap-1 whitespace-nowrap rounded-[11px] px-2 text-xs font-semibold [&_svg]:size-3',
  {
    variants: {
      variant: {
        vendedor: 'bg-primary-soft text-primary-hover',
        supervisor: 'bg-info-soft text-info',
        neutral: 'bg-neutral-soft text-neutral-strong',
        danger: 'bg-danger-soft text-danger',
        warning: 'bg-warning-soft text-warning-text',
        info: 'bg-info-soft text-info',
        success: 'bg-primary-soft text-primary',
        lost: 'bg-lost-soft text-lost-text',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
)

function Badge({ className, variant, ...props }: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
