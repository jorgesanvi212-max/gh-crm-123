'use client'

import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { Check } from 'lucide-react'

// Avisos de éxito: verdes, abajo a la derecha, 3 s (README.handoff §3.4).
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="bottom-right"
      offset={24}
      duration={3000}
      icons={{ success: <Check className="size-4" strokeWidth={2.5} /> }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'flex items-center gap-2 rounded-[8px] bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-toast',
          icon: 'flex items-center',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
