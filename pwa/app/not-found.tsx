import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MobileFrame } from '@/components/mobile-frame'

export default function NotFound() {
  return (
    <MobileFrame className="justify-center gap-4 px-6 py-8">
      <h1 className="m-0 text-[22px] font-semibold">Esta página no existe</h1>
      <Button asChild variant="outline">
        <Link href="/" className="text-text hover:text-text hover:no-underline">
          Volver al inicio
        </Link>
      </Button>
    </MobileFrame>
  )
}
