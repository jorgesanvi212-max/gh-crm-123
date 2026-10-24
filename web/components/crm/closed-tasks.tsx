'use client'

import { useState } from 'react'

// Tareas hechas y canceladas de la ficha, plegadas en "Ver cerradas (n)".
export function ClosedTasks({ count, children }: { count: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  if (count === 0) return null
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-full cursor-pointer items-center border-t border-border bg-row-hover px-4 text-left text-[13px] font-medium text-text-muted hover:bg-hover-neutral"
      >
        {open ? 'Ocultar cerradas' : 'Ver cerradas'} ({count})
      </button>
      {open && children}
    </>
  )
}
