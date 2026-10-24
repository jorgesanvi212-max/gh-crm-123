'use client'

import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { Check } from 'lucide-react'

// Avisos de éxito: verdes, a lo ancho y sobre la barra de pestañas, 3 s (README.handoff §3.5).
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="bottom-center"
      offset={{ bottom: 96, left: 16, right: 16 }}
      mobileOffset={{ bottom: 96, left: 16, right: 16 }}
      duration={3000}
      icons={{ success: <Check className="size-4" strokeWidth={2.5} /> }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'flex w-full items-center gap-2 rounded-[8px] bg-primary px-4 py-3.5 text-base font-medium text-primary-foreground shadow-toast',
          icon: 'flex items-center',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
