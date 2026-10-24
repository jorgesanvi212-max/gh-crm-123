'use client'

import { useActionState, useState } from 'react'
import { signIn, type FormState } from '@/lib/auth/actions'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AppTile } from '@/components/app-tile'

export function LoginForm({ initialError }: { initialError?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    signIn,
    initialError ? { error: initialError } : null,
  )
  const [visible, setVisible] = useState(false)

  return (
    <form action={action} className="flex flex-1 flex-col gap-[18px] px-6 pt-10 pb-6">
      <AppTile />
      <div className="flex flex-col gap-1">
        <h1 className="m-0 text-2xl font-semibold text-primary">CRM-123</h1>
        <span className="text-text-muted">Supervisión del equipo</span>
      </div>

      {state?.error && <Alert variant="destructive-inline">{state.error}</Alert>}

      <fieldset disabled={pending} className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            inputMode="email"
            required
            defaultValue={state?.email}
            key={state?.email}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative flex">
            <Input
              id="password"
              name="password"
              type={visible ? 'text' : 'password'}
              autoComplete="current-password"
              required
              className="pr-24"
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              aria-pressed={visible}
              className="absolute right-1 top-1 h-10 cursor-pointer rounded-[6px] px-3 font-semibold text-primary"
            >
              {visible ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>
      </fieldset>

      <Button type="submit" disabled={pending}>
        {pending ? 'Entrando…' : 'Entrar'}
      </Button>

      <p className="m-0 text-sm text-text-muted">¿Problemas para entrar? Pide a tu supervisor una contraseña temporal.</p>
      <p className="m-0 mt-auto text-[13px] text-text-muted">Uso interno de CRM-123. Acceso solo para personal autorizado.</p>
    </form>
  )
}
