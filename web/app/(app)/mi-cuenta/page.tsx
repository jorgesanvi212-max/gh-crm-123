import type { Metadata } from 'next'
import { requireProfile } from '@/lib/auth/require-profile'
import { USER_ROLE } from '@/lib/labels'
import { Badge } from '@/components/ui/badge'
import { Card, CardTitle } from '@/components/ui/card'
import { PageBody } from '@/components/page-body'
import { PageHeader } from '@/components/page-header'
import { PasswordForm } from '@/components/password-form'

export const metadata: Metadata = { title: 'Mi cuenta' }

export default async function MiCuentaPage() {
  const { profile } = await requireProfile()

  return (
    <>
      <PageHeader title="Mi cuenta" />
      <PageBody>
        <div data-screen-label="Mi cuenta" className="flex max-w-[560px] flex-col gap-4">
          <Card className="grid grid-cols-[120px_minmax(0,1fr)] gap-x-4 gap-y-3 p-5">
            <span className="text-text-muted">Nombre</span>
            <span className="font-medium">{profile.full_name}</span>
            <span className="text-text-muted">Email</span>
            <span className="font-medium break-all">{profile.email}</span>
            <span className="text-text-muted">Rol</span>
            <span>
              <Badge variant={profile.role}>{USER_ROLE[profile.role]}</Badge>
            </span>
          </Card>
          <Card className="flex flex-col gap-3.5 p-5">
            <CardTitle>Cambiar contraseña</CardTitle>
            <PasswordForm variant="account" />
          </Card>
        </div>
      </PageBody>
    </>
  )
}
