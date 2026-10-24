import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-9 w-full min-w-0 rounded-[6px] border border-border-input bg-surface px-2.5 text-sm font-normal text-text placeholder:text-text-muted disabled:cursor-not-allowed disabled:bg-neutral-soft aria-invalid:border-danger',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
