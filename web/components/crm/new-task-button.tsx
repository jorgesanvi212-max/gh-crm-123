'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskDialog, type OppOption } from './task-dialog'

// "Nueva tarea" de la pantalla Tareas: el cliente se elige en el diálogo.
export function NewTaskButton({ clients, opportunities }: { clients: { id: string; trade_name: string }[]; opportunities: OppOption[] }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus aria-hidden="true" />
        Nueva tarea
      </Button>
      <TaskDialog open={open} onOpenChange={setOpen} client={null} clients={clients} opportunities={opportunities} />
    </>
  )
}
