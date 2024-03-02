import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

export function Island({
  children,
  side = 'bottom',
}: {
  children?: ReactNode
  side?: 'top' | 'bottom'
}) {
  return (
    <div
      className={cn(
        'fixed right-0 left-0 flex items-center justify-center p-2 w-full',
        side === 'top' && 'top-0',
        side === 'bottom' && 'bottom-0',
      )}
    >
      {children}
    </div>
  )
}
