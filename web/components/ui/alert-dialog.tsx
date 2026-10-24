'use client'

import * as React from 'react'
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

// Confirmaciones (Archivar, Restaurar oportunidad, Cancelar tarea): mismo aspecto que el diálogo centrado.
const AlertDialog = AlertDialogPrimitive.Root
const AlertDialogTrigger = AlertDialogPrimitive.Trigger
const AlertDialogCancel = AlertDialogPrimitive.Cancel

function AlertDialogContent({ className, children, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="fixed inset-0 z-40 bg-[rgba(28,36,32,.32)]" />
      <AlertDialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100vh-48px)] w-[480px] max-w-[calc(100vw-48px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-auto rounded-[8px] border border-border bg-surface shadow-dialog focus:outline-none',
          className,
        )}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  )
}

function AlertDialogHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col gap-1 px-5 pt-[18px] pb-1">
      <AlertDialogPrimitive.Title className="m-0 text-base font-semibold">{title}</AlertDialogPrimitive.Title>
      {description && <span className="text-[13px] text-text-muted">{description}</span>}
    </div>
  )
}

function AlertDialogDescription({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return <AlertDialogPrimitive.Description className={cn('m-0 px-5 py-3.5 text-sm text-text', className)} {...props} />
}

export {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTrigger,
}
