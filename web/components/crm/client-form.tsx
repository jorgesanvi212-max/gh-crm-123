'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { CircleAlert, TriangleAlert } from 'lucide-react'
import { checkPhone, saveClient } from '@/lib/actions/clients'
import type { ActionResult, PhoneCheck } from '@/lib/actions/result'
import type { Enums } from '@/lib/database.types'
import { BUSINESS_TYPE } from '@/lib/labels'
import { DEFAULT_PREFIX, PHONE_PREFIXES, type PrefixCountry } from '@/lib/phone-prefixes'
import { PHONE_MESSAGES } from '@/lib/phone-messages'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useFormAction } from './use-form-action'

export type ClientFormData = {
  id: string
  trade_name: string
  business_type: Enums<'business_type'>
  contact_name: string
  prefix: PrefixCountry
  national: string
  email: string | null
  delivery_address: string | null
  city: string | null
  province: string | null
  notes: string | null
  owner_id: string
}

const GRID = 'grid gap-x-5 gap-y-3.5 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]'

export function ClientForm({
  client,
  isSupervisor,
  sellers,
  defaultOwnerId,
}: {
  client?: ClientFormData
  isSupervisor: boolean
  sellers: { id: string; full_name: string }[]
  defaultOwnerId?: string
}) {
  const [state, onSubmit, pending] = useFormAction((prev: ActionResult, formData: FormData) =>
    saveClient(client?.id ?? null, prev, formData),
  )
  const errors = state?.fieldErrors ?? {}

  const [prefix, setPrefix] = useState<PrefixCountry>(client?.prefix ?? DEFAULT_PREFIX)
  const [phone, setPhone] = useState<PhoneCheck>({ status: null })
  const [checking, startCheck] = useTransition()

  const onPhoneBlur = (national: string) =>
    startCheck(async () => setPhone(await checkPhone(prefix, national, client?.id)))

  const status = phone.status
  // "Otro vendedor", "archivado" y "formato inválido" bloquean Guardar; "ya en tu cartera", solo al dar de alta.
  const blocked =
    status === 'otro_vendedor' || status === 'archivado' || status === 'formato_invalido' || (status === 'propio' && !client)
  const phoneBorder =
    status === 'otro_vendedor' || status === 'archivado'
      ? 'border-warning'
      : status === 'formato_invalido' || errors.phone
        ? 'border-danger'
        : status === 'libre'
          ? 'border-primary'
          : undefined

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      data-screen-label="Cliente nuevo / Editar cliente"
      className="flex max-w-[880px] flex-col gap-[22px] rounded-[8px] border border-border bg-surface p-6"
    >
      {state?.error && (
        <div role="alert" className="flex items-center gap-2 rounded-[6px] bg-danger-soft px-3 py-2.5 text-[13px] font-medium text-danger">
          <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
          {state.error}
        </div>
      )}

      <fieldset disabled={pending} className="flex flex-col gap-[22px]">
        <section className="flex flex-col gap-3">
          <h2 className="m-0 text-base font-semibold">Empresa</h2>
          <div className={GRID}>
            <Field label="Nombre comercial *" htmlFor="trade_name" error={errors.trade_name}>
              <Input id="trade_name" name="trade_name" maxLength={150} defaultValue={client?.trade_name} aria-invalid={!!errors.trade_name} />
            </Field>
            <Field label="Tipo de negocio *" htmlFor="business_type" error={errors.business_type}>
              <Select name="business_type" defaultValue={client?.business_type}>
                <SelectTrigger id="business_type" className="h-9" aria-invalid={!!errors.business_type}>
                  <SelectValue placeholder="Selecciona…" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BUSINESS_TYPE).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="m-0 text-base font-semibold">Contacto</h2>
          <div className={GRID}>
            <Field label="Persona de contacto *" htmlFor="contact_name" error={errors.contact_name}>
              <Input id="contact_name" name="contact_name" maxLength={120} defaultValue={client?.contact_name} aria-invalid={!!errors.contact_name} />
            </Field>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Teléfono *</Label>
              <div className="flex gap-1.5">
                <Select
                  name="prefix"
                  value={prefix}
                  onValueChange={(v) => {
                    setPrefix(v as PrefixCountry)
                    setPhone({ status: null })
                  }}
                >
                  <SelectTrigger aria-label="Prefijo" className="h-9 w-[104px] shrink-0 px-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PHONE_PREFIXES.map((p) => (
                      <SelectItem key={p.country} value={p.country}>
                        {p.flag} {p.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  name="phone"
                  inputMode="tel"
                  placeholder="600 123 456"
                  maxLength={30}
                  defaultValue={client?.national}
                  onBlur={(e) => onPhoneBlur(e.currentTarget.value)}
                  onChange={() => status && setPhone({ status: null })}
                  aria-invalid={!!errors.phone}
                  className={cn('min-w-0 flex-1 tabular-nums', phoneBorder)}
                />
              </div>
              <PhoneMessage checking={checking} check={phone} creating={!client} />
              {errors.phone && !status && <span className="text-xs text-danger">{errors.phone}</span>}
            </div>

            <Field label="Email" htmlFor="email" error={errors.email}>
              <Input id="email" name="email" type="email" maxLength={254} defaultValue={client?.email ?? ''} aria-invalid={!!errors.email} />
            </Field>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="m-0 text-base font-semibold">Entrega</h2>
          <div className={GRID}>
            <Field label="Dirección de entrega" htmlFor="delivery_address" error={errors.delivery_address} className="col-span-full">
              <Input id="delivery_address" name="delivery_address" maxLength={250} defaultValue={client?.delivery_address ?? ''} />
            </Field>
            <Field label="Población" htmlFor="city" error={errors.city}>
              <Input id="city" name="city" maxLength={100} defaultValue={client?.city ?? ''} />
            </Field>
            <Field label="Provincia" htmlFor="province" error={errors.province}>
              <Input id="province" name="province" maxLength={100} defaultValue={client?.province ?? ''} />
            </Field>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="m-0 text-base font-semibold">Notas</h2>
          <Textarea name="notes" aria-label="Notas" maxLength={2000} rows={3} defaultValue={client?.notes ?? ''} />
          {errors.notes && <span className="text-xs text-danger">{errors.notes}</span>}
        </section>

        {isSupervisor && (
          <Field label="Vendedor asignado *" htmlFor="owner_id" error={errors.owner_id} className="max-w-[420px]">
            <Select name="owner_id" defaultValue={client?.owner_id ?? defaultOwnerId}>
              <SelectTrigger id="owner_id" className="h-9" aria-invalid={!!errors.owner_id}>
                <SelectValue placeholder="Selecciona…" />
              </SelectTrigger>
              <SelectContent>
                {sellers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      </fieldset>

      <div className="flex gap-2">
        <Button type="submit" className={cn('px-4', blocked && 'opacity-45')} disabled={pending || blocked || checking}>
          {pending ? 'Guardando…' : 'Guardar cliente'}
        </Button>
        <Button asChild variant="outline" className="px-4">
          <Link href={client ? `/clientes/${client.id}` : '/clientes'} className="text-text hover:text-text hover:no-underline">
            Cancelar
          </Link>
        </Button>
      </div>
    </form>
  )
}

function PhoneMessage({ checking, check, creating }: { checking: boolean; check: PhoneCheck; creating: boolean }) {
  if (checking) return <span className="text-xs text-text-muted">Comprobando…</span>
  switch (check.status) {
    case 'libre':
      return <span className="text-xs font-medium text-primary">✓ Teléfono disponible</span>
    case 'propio':
      if (!creating) return null
      return (
        <span className="text-xs text-info">
          {PHONE_MESSAGES.propio}
          {check.clientId && (
            <>
              {' · '}
              <Link href={`/clientes/${check.clientId}`} className="font-medium">
                Ver cliente
              </Link>
            </>
          )}
        </span>
      )
    case 'otro_vendedor':
      return (
        <span role="alert" className="flex items-start gap-1.5 rounded-[6px] bg-warning-soft px-2.5 py-2 text-xs font-medium text-warning-text">
          <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          {PHONE_MESSAGES.otro_vendedor}
        </span>
      )
    case 'archivado':
      return <span className="text-xs font-medium text-warning-text">{PHONE_MESSAGES.archivado}</span>
    case 'formato_invalido':
      return <span className="text-xs text-danger">{PHONE_MESSAGES.formato_invalido}</span>
    default:
      return null
  }
}
