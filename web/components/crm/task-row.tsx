'use client'

import { createContext, use, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { cancelTask, completeTask } from '@/lib/actions/tasks'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from './confirm-dialog'

const RowContext = createContext<{ saving: boolean; complete: () => void }>({ saving: false, complete: () => {} })

/**
 * Fila de tarea pendiente. Al marcarla como hecha se atenúa ("Guardando…") y desaparece
 * cuando la página se actualiza, con el aviso de éxito.
 */
export function TaskRow({ taskId, className, children }: { taskId: string; className?: string; children: React.ReactNode }) {
  const [pending, start] = useTransition()
  const [done, setDone] = useState(false)
  const saving = pending || done

  const complete = () =>
    start(async () => {
      const result = await completeTask(taskId)
      if (result?.ok) {
        setDone(true)
        toast.success(result.message)
      } else {
        toast.error(result?.error)
      }
    })

  return (
    <RowContext value={{ saving, complete }}>
      <div className={cn(className, saving && 'opacity-50')}>{children}</div>
    </RowContext>
  )
}

export function TaskDoneCheckbox({ disabled }: { disabled?: boolean }) {
  const { saving, complete } = use(RowContext)
  return (
    <Checkbox
      aria-label="Marcar como hecha"
      title="Marcar como hecha"
      checked={saving}
      disabled={saving || disabled}
      onCheckedChange={(checked) => checked === true && complete()}
    />
  )
}

/** Muestra "Guardando…" mientras se guarda; si no, su contenido (etiqueta Vencida, botón Cancelar…). */
export function TaskRowStatus({ children }: { children?: React.ReactNode }) {
  const { saving } = use(RowContext)
  return saving ? <span className="text-xs text-text-muted">Guardando…</span> : <>{children}</>
}

export function CancelTaskButton({ taskId, title }: { taskId: string; title: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        variant="ghost-neutral"
        size="xs"
        className="px-2 font-medium text-text-muted hover:text-text-muted"
        onClick={() => setOpen(true)}
      >
        Cancelar
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Cancelar tarea"
        text={`Se cancelará la tarea «${title}». Seguirá visible en «Ver cerradas».`}
        confirmLabel="Cancelar tarea"
        pendingLabel="Cancelando…"
        cancelLabel="Volver"
        danger
        action={() => cancelTask(taskId)}
      />
    </>
  )
}
