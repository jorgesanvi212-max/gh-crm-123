import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireProfile } from '@/lib/auth/require-profile'
import { LogoutButton } from '@/components/logout-button'
import { MobileFrame } from '@/components/mobile-frame'
import { PasswordForm } from '@/components/password-form'

export const metadata: Metadata = { title: 'Crea tu contraseña personal' }

export default async function CambiarContrasenaPage() {
  const { profile } = await requireProfile({ allowPasswordChange: true })
  if (!profile.must_change_password) redirect('/')

  return (
    <MobileFrame data-screen-label="Cambiar contraseña PWA" className="gap-4 p-6">
      <div className="flex items-center justify-between">
        <span className="text-xl font-semibold text-primary">CRM-123</span>
        <LogoutButton className="flex h-11 items-center gap-1.5 rounded-[8px] border border-border-input bg-surface px-3.5 font-medium" />
      </div>
      <h1 className="m-0 text-[22px] font-semibold">Crea tu contraseña personal</h1>
      <p className="m-0 text-text-muted">Has entrado con una contraseña temporal. Sustitúyela por una que solo conozcas tú.</p>
      <PasswordForm />
    </MobileFrame>
  )
}
