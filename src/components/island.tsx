import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

export function Island({
  children,
  side = 'bottom',
  className,
}: {
  children?: ReactNode
  side?: 'top' | 'bottom'
  className?: string
}) {
  return (
    <div
      className={cn(
        'fixed z-50 right-0 left-0 flex items-center justify-center p-2 w-full',
        side === 'top' && 'top-0',
        side === 'bottom' && 'bottom-0',
        className,
      )}
    >
      {children}
    </div>
  )
}
