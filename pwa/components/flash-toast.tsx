'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

const MESSAGES: Record<string, string> = {
  contrasena: 'Contraseña actualizada',
}

// Muestra el aviso de éxito que llega tras una redirección (?aviso=…) y limpia la URL.
export function FlashToast() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const aviso = params.get('aviso')

  useEffect(() => {
    if (!aviso || !MESSAGES[aviso]) return
    toast.success(MESSAGES[aviso])
    const rest = new URLSearchParams(params)
    rest.delete('aviso')
    const query = rest.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [aviso, params, pathname, router])

  return null
}
