import type { Metadata } from 'next'
import { LoginForm } from '@/components/login-form'

export const metadata: Metadata = { title: 'Acceso' }

export default async function AccesoPage({ searchParams }: PageProps<'/acceso'>) {
  const { motivo } = await searchParams
  const initialError = motivo === 'desactivado' ? 'Tu acceso está desactivado. Contacta con tu supervisor' : undefined

  return (
    <div data-screen-label="Acceso" className="flex min-h-screen items-center justify-center p-6">
      <LoginForm initialError={initialError} />
    </div>
  )
}
