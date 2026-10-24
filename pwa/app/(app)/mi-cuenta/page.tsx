import type { Metadata } from 'next'
import { requireProfile } from '@/lib/auth/require-profile'
import { USER_ROLE } from '@/lib/labels'
import { PasswordForm } from '@/components/password-form'
import { ScreenBody, ScreenHeader } from '@/components/screen-header'

export const metadata: Metadata = { title: 'Mi cuenta' }

export default async function MiCuentaPage() {
  const { profile } = await requireProfile()
  const rows = [
    ['Nombre', profile.full_name],
    ['Email', profile.email],
    ['Rol', USER_ROLE[profile.role]],
  ]

  return (
    <>
      <ScreenHeader title="Mi cuenta" backHref="/mas" />
      <ScreenBody>
        <div data-screen-label="Mi cuenta PWA" className="flex flex-col gap-3">
          <section className="flex flex-col gap-2.5 rounded-[8px] border border-border bg-surface p-4">
            {rows.map(([label, value]) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="text-[13px] text-text-muted">{label}</span>
                <span className="font-medium break-all">{value}</span>
              </div>
            ))}
          </section>
          <section className="flex flex-col gap-3 rounded-[8px] border border-border bg-surface p-4">
            <h2 className="m-0 text-base font-semibold">Cambiar contraseña</h2>
            <PasswordForm />
          </section>
        </div>
      </ScreenBody>
    </>
  )
}
