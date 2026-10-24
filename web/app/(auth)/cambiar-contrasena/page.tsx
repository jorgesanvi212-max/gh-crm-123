import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireProfile } from '@/lib/auth/require-profile'
import { LogoutButton } from '@/components/logout-button'
import { PasswordForm } from '@/components/password-form'

export const metadata: Metadata = { title: 'Crea tu contraseña personal' }

export default async function CambiarContrasenaPage() {
  const { profile } = await requireProfile({ allowPasswordChange: true })
  if (!profile.must_change_password) redirect('/')

  return (
    <div data-screen-label="Cambiar contraseña (primer acceso)" className="flex min-h-screen items-center justify-center p-6">
      <div className="flex w-[420px] max-w-full flex-col gap-[18px] rounded-[8px] border border-border bg-surface p-8">
        <div className="flex items-center justify-between">
          <div className="text-[22px] font-semibold text-primary">CRM-123</div>
          <LogoutButton className="flex h-8 items-center gap-1.5 rounded-[6px] border border-border bg-surface px-3 text-sm hover:bg-hover-neutral" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-xl font-semibold">Crea tu contraseña personal</h1>
          <p className="m-0 text-text-muted">Has entrado con una contraseña temporal. Sustitúyela por una que solo conozcas tú.</p>
        </div>
        <PasswordForm variant="first" />
      </div>
    </div>
  )
}
