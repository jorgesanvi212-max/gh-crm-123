import { cn } from '@/lib/utils'

// Columna única del móvil (lienzo de referencia de 390 px), centrada si la pantalla es más ancha.
export function MobileFrame({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-bg', className)} {...props} />
}
