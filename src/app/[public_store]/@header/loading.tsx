import { Skeleton } from '@/components/ui/skeleton'
import { Menu } from './menu'

export default function HeaderLoading() {
  return (
    <div className="p-2">
      <header className="relative p-4 py-4 bg-secondary/80 rounded-2xl">
        <div className="flex flex-row items-center justify-between">
          <div className="relative w-full h-8 max-w-40">
            <Skeleton className="w-full h-8" />
          </div>

          <div className="flex flex-row gap-2">
            <Menu />
          </div>
        </div>
      </header>
    </div>
  )
}
