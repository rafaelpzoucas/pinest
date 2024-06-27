import { cn } from '@/lib/utils'
import { Pyramid } from 'lucide-react'

export function DefaultLogo({ storeName }: { storeName?: string }) {
  return (
    <div
      className={cn(
        'flex flex-row items-center gap-2 drop-shadow-lg text-white',
      )}
    >
      <Pyramid />
      <strong className="capitalize tracking-tight text-xl">{storeName}</strong>
    </div>
  )
}
