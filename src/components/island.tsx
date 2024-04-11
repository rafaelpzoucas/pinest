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
        'fixed right-0 left-0 lg:static flex items-center justify-center p-2 w-full lg:w-auto lg:items-start',
        side === 'top' && 'top-0',
        side === 'bottom' && 'bottom-0',
        className,
      )}
    >
      {children}
    </div>
  )
}
