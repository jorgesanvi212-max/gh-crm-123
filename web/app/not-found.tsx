import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="flex max-w-[420px] flex-col items-start gap-3">
        <div className="text-xl font-semibold text-primary">CRM-123</div>
        <h1 className="m-0 text-xl font-semibold">Esta página no existe</h1>
        <Button asChild variant="outline">
          <Link href="/" className="text-text hover:text-text hover:no-underline">
            Volver al inicio
          </Link>
        </Button>
      </div>
    </div>
  )
}
