import * as React from 'react'
import { Slot } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-[8px] text-base font-semibold transition-colors disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        outline: 'border border-border bg-surface text-text hover:bg-hover-neutral',
        ghost: 'text-primary hover:bg-primary-soft',
        'ghost-neutral': 'text-text hover:bg-hover-neutral',
        link: 'h-auto px-0 text-primary underline-offset-4 hover:text-primary-hover hover:underline',
        'destructive-soft': 'border border-danger-border bg-danger-soft text-danger hover:bg-[#FBDCDC]',
        'destructive-outline': 'border border-danger bg-surface text-danger hover:bg-danger-soft',
      },
      size: {
        default: 'h-12 px-4',
        sm: 'h-11 px-3.5',
        icon: 'size-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button'
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
