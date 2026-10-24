'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import type { ActionResult } from '@/lib/actions/result'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { FormError } from '@/components/ui/field'

// Confirmación simple: Archivar, Restaurar oportunidad, Cancelar tarea.
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  text,
  confirmLabel,
  pendingLabel,
  cancelLabel = 'Cancelar',
  danger = false,
  action,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  subtitle?: string
  text: string
  confirmLabel: string
  pendingLabel: string
  cancelLabel?: string
  danger?: boolean
  action: () => Promise<ActionResult>
}) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string>()

  const confirm = () =>
    start(async () => {
      const result = await action()
      if (result?.ok) {
        onOpenChange(false)
        toast.success(result.message)
      } else {
        setError(result?.error)
      }
    })

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) {
          setError(undefined)
          onOpenChange(next)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader title={title} description={subtitle} />
        {error && (
          <div className="px-5 pt-3.5">
            <FormError message={error} />
          </div>
        )}
        <AlertDialogDescription>{text}</AlertDialogDescription>
        <div className="flex justify-end gap-2 px-5 pt-3 pb-[18px]">
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={pending}>
              {cancelLabel}
            </Button>
          </AlertDialogCancel>
          <Button variant={danger ? 'destructive-soft' : 'default'} className="px-4" disabled={pending} onClick={confirm}>
            {pending ? pendingLabel : confirmLabel}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
