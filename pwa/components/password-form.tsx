'use client'

import { useActionState, useState } from 'react'
import { toast } from 'sonner'
import { changePassword, type FormState } from '@/lib/auth/actions'
import { PASSWORD_MIN } from '@/lib/validation/auth'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// Cambio de contraseña: primer acceso (pantalla propia) y Mi cuenta (bloque).
export function PasswordForm({ className }: { className?: string }) {
  const [next, setNext] = useState('')
  const [repeat, setRepeat] = useState('')
  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, formData) => {
    const result = await changePassword(prev, formData)
    // React vacía el formulario al terminar la acción: las ayudas en vivo vuelven a su estado inicial.
    setNext('')
    setRepeat('')
    if (result?.ok) toast.success('Contraseña actualizada')
    return result
  }, null)

  const lengthOk = next.length >= PASSWORD_MIN
  const matchOk = next.length > 0 && next === repeat

  return (
    <form action={action} className={cn('flex flex-col gap-4', className)}>
      {state?.error && <Alert variant="destructive-inline">{state.error}</Alert>}

      <fieldset disabled={pending} className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="current">Contraseña actual</Label>
          <Input id="current" name="current" type="password" autoComplete="current-password" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="next">Nueva contraseña</Label>
          <Input
            id="next"
            name="next"
            type="password"
            autoComplete="new-password"
            required
            onChange={(e) => setNext(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="repeat">Repetir nueva contraseña</Label>
          <Input
            id="repeat"
            name="repeat"
            type="password"
            autoComplete="new-password"
            required
            onChange={(e) => setRepeat(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1 text-sm" aria-live="polite">
          <Hint ok={lengthOk}>Mínimo 10 caracteres</Hint>
          <Hint ok={matchOk}>Las contraseñas coinciden</Hint>
        </div>
      </fieldset>

      <Button type="submit" disabled={pending}>
        {pending ? 'Guardando…' : 'Guardar contraseña'}
      </Button>
    </form>
  )
}

function Hint({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span className={cn('flex items-center gap-1.5', ok ? 'text-primary' : 'text-text-muted')}>
      <span aria-hidden="true">{ok ? '✓' : '○'}</span>
      {children}
    </span>
  )
}
