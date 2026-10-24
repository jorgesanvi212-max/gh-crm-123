'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// Campo de contraseña con el botón Mostrar / Ocultar dentro.
export function PasswordInput({ className, ...props }: Omit<React.ComponentProps<'input'>, 'type'>) {
  const [visible, setVisible] = React.useState(false)
  return (
    <div className="relative flex">
      <Input type={visible ? 'text' : 'password'} className={cn('pr-[84px]', className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
        className="absolute right-1 top-1 h-[30px] cursor-pointer rounded-[4px] px-2.5 text-[13px] font-medium text-primary hover:bg-primary-soft"
      >
        {visible ? 'Ocultar' : 'Mostrar'}
      </button>
    </div>
  )
}
