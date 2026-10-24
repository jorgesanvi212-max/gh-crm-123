'use client'

import { useState } from 'react'
import { ChevronDown, Ellipsis } from 'lucide-react'
import { setOpportunityArchived } from '@/lib/actions/opportunities'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { STAGE_VARIANT } from './badges'
import { badgeVariants } from '@/components/ui/badge'
import { OPPORTUNITY_STAGE } from '@/lib/labels'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from './confirm-dialog'
import { OpportunitySheet, StageDialog, type OppData } from './opportunity-dialogs'

type Dialog = 'edit' | 'stage' | 'archive' | null

const isOpen = (stage: OppData['stage']) => stage === 'nueva' || stage === 'oferta_enviada' || stage === 'negociacion'

// Menú "⋯" de cada oportunidad en la ficha: Editar (o Ver), Cambiar etapa y, para el supervisor, Archivar / Restaurar.
export function OpportunityMenu({
  opp,
  isSupervisor,
  archived,
  clientArchived,
}: {
  opp: OppData
  isSupervisor: boolean
  archived: boolean
  clientArchived: boolean
}) {
  const [dialog, setDialog] = useState<Dialog>(null)
  const readOnly = (!isOpen(opp.stage) && !isSupervisor) || clientArchived || archived
  const close = (open: boolean) => !open && setDialog(null)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="size-[30px]" aria-label="Acciones" title="Acciones">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => setDialog('edit')}>{readOnly ? 'Ver' : 'Editar'}</DropdownMenuItem>
          {!readOnly && <DropdownMenuItem onSelect={() => setDialog('stage')}>Cambiar etapa</DropdownMenuItem>}
          {isSupervisor && !clientArchived && (
            <DropdownMenuItem onSelect={() => setDialog('archive')}>{archived ? 'Restaurar' : 'Archivar'}</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <OpportunitySheet open={dialog === 'edit'} onOpenChange={close} clientId={opp.client_id} opp={opp} readOnly={readOnly} />
      <StageDialog open={dialog === 'stage'} onOpenChange={close} opp={opp} />
      <ConfirmDialog
        open={dialog === 'archive'}
        onOpenChange={close}
        title={archived ? 'Restaurar oportunidad' : 'Archivar oportunidad'}
        subtitle={opp.title}
        text={
          archived
            ? 'La oportunidad volverá a verse en las listas del vendedor.'
            : 'La oportunidad dejará de verse en las listas del vendedor. Podrás restaurarla cuando quieras.'
        }
        confirmLabel={archived ? 'Restaurar' : 'Archivar'}
        pendingLabel={archived ? 'Restaurando…' : 'Archivando…'}
        action={() => setOpportunityArchived(opp.id, !archived)}
      />
    </>
  )
}

// Etiqueta de etapa en la lista de Oportunidades: al pulsarla abre "Cambiar etapa".
export function StageButton({ opp, locked }: { opp: OppData; locked: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        disabled={locked}
        onClick={() => setOpen(true)}
        title={locked ? undefined : 'Cambiar etapa'}
        className={cn(badgeVariants({ variant: STAGE_VARIANT[opp.stage] }), !locked && 'cursor-pointer pr-1.5')}
      >
        {OPPORTUNITY_STAGE[opp.stage]}
        {!locked && <ChevronDown strokeWidth={2.5} aria-hidden="true" />}
      </button>
      <StageDialog open={open} onOpenChange={setOpen} opp={opp} />
    </>
  )
}
