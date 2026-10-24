import * as React from 'react'
import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'w-full min-w-0 resize-y rounded-[6px] border border-border-input bg-surface px-2.5 py-2 text-sm font-normal text-text placeholder:text-text-muted disabled:cursor-not-allowed disabled:bg-neutral-soft aria-invalid:border-danger',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
