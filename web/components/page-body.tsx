import { cn } from '@/lib/utils'

export function PageBody({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-1 flex-col gap-4 px-7 pb-8', className)} {...props} />
}
