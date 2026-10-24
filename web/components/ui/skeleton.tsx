import * as React from 'react'
import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="skeleton" aria-hidden="true" className={cn('h-2.5 rounded-[4px] bg-skeleton', className)} {...props} />
}

export { Skeleton }
