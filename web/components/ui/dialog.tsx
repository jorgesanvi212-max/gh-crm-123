'use client'

import * as React from 'react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close

const overlayClass = 'fixed inset-0 z-40 bg-[rgba(28,36,32,.32)]'

// Diálogo centrado de 480 px (README.handoff §3.4).
function DialogContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={overlayClass} />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100vh-48px)] w-[480px] max-w-[calc(100vw-48px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-auto rounded-[8px] border border-border bg-surface shadow-dialog focus:outline-none',
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

// Panel lateral derecho de 440 px (Sheet) para la oportunidad.
function SheetContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={overlayClass} />
      <DialogPrimitive.Content
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex h-full w-[440px] max-w-full flex-col border-l border-border bg-surface focus:outline-none',
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

function SheetHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-[18px]">
      <DialogPrimitive.Title className="m-0 text-base font-semibold">{title}</DialogPrimitive.Title>
      <DialogPrimitive.Close
        aria-label="Cerrar"
        className="flex size-8 cursor-pointer items-center justify-center rounded-[6px] hover:bg-hover-neutral"
      >
        <X className="size-[18px]" />
      </DialogPrimitive.Close>
    </div>
  )
}

function DialogHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col gap-1 px-5 pt-[18px] pb-1">
      <DialogPrimitive.Title className="m-0 text-base font-semibold">{title}</DialogPrimitive.Title>
      {description ? (
        <DialogPrimitive.Description className="m-0 text-[13px] text-text-muted">{description}</DialogPrimitive.Description>
      ) : (
        <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
      )}
    </div>
  )
}

function DialogBody({ className, ...props }: React.ComponentProps<'fieldset'>) {
  return <fieldset className={cn('flex flex-col gap-3.5 px-5 py-3.5', className)} {...props} />
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex justify-end gap-2 px-5 pt-3 pb-[18px]', className)} {...props} />
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  SheetContent,
  SheetHeader,
}
