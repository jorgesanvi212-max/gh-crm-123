'use client'

import { useActionState } from 'react'
import { CircleAlert } from 'lucide-react'
import { signIn, type FormState } from '@/lib/auth/actions'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/password-input'

export function LoginForm({ initialError }: { initialError?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    signIn,
    initialError ? { error: initialError } : null,
  )

  return (
    <form
      action={action}
      className="flex w-[380px] max-w-full flex-col gap-[18px] rounded-[8px] border border-border bg-surface p-8"
    >
      <div className="text-[22px] font-semibold tracking-[-0.01em] text-primary">CRM-123</div>
      <h1 className="m-0 text-xl font-semibold">Entrar</h1>

      {state?.error && (
        <Alert variant="destructive-inline">
          <CircleAlert />
          <span>{state.error}</span>
        </Alert>
      )}

      <fieldset disabled={pending} className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="nombre@empresa.es"
            required
            defaultValue={state?.email}
            key={state?.email}
            className="h-[38px] px-3"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <PasswordInput id="password" name="password" autoComplete="current-password" required className="h-[38px] pl-3" />
        </div>
      </fieldset>

      <Button type="submit" size="lg" disabled={pending} className="font-semibold">
        {pending ? 'Entrando…' : 'Entrar'}
      </Button>

      <p className="m-0 text-[13px] text-text-muted">¿Problemas para entrar? Pide a tu supervisor una contraseña temporal.</p>
      <p className="m-0 border-t border-border pt-3.5 text-xs text-text-muted">
        Uso interno de CRM-123. Acceso solo para personal autorizado.
      </p>
    </form>
  )
}
