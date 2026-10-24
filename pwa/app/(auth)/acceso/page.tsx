import type { Metadata } from 'next'
import { LoginForm } from '@/components/login-form'
import { MobileFrame } from '@/components/mobile-frame'

export const metadata: Metadata = { title: 'Acceso' }

export default async function AccesoPage({ searchParams }: PageProps<'/acceso'>) {
  const { motivo } = await searchParams
  const initialError = motivo === 'desactivado' ? 'Tu acceso está desactivado. Contacta con tu supervisor' : undefined

  return (
    <MobileFrame data-screen-label="Acceso PWA">
      <LoginForm initialError={initialError} />
    </MobileFrame>
  )
}
