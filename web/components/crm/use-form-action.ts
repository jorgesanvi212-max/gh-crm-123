'use client'

import { startTransition, useActionState, type FormEvent } from 'react'
import type { ActionResult } from '@/lib/actions/result'

/**
 * Envía el formulario a una Server Action sin que React lo vacíe al terminar:
 * si hay errores de validación, el usuario conserva lo que escribió.
 */
export function useFormAction(action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>) {
  const [state, dispatch, pending] = useActionState<ActionResult, FormData>(action, null)
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(() => dispatch(formData))
  }
  return [state, onSubmit, pending] as const
}
