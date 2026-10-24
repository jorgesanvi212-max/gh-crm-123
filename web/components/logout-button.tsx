import { LogOut } from 'lucide-react'
import { signOut } from '@/lib/auth/actions'
import { cn } from '@/lib/utils'

export function LogoutButton({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <form action={signOut}>
      <button type="submit" className={cn('cursor-pointer', className)}>
        <LogOut className="size-4" aria-hidden="true" />
        {children ?? 'Salir'}
      </button>
    </form>
  )
}
