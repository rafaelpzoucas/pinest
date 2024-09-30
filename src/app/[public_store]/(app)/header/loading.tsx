import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchSheet } from '../search/search-sheet'

export default function HeaderLoading() {
  return (
    <header className="flex items-center justify-center w-full">
      <Card className="flex flex-row items-center justify-between gap-2 w-full p-4 py-4 bg-secondary/50 border-0">
        <div className="flex flex-col items-center lg:flex-row gap-4 w-full max-w-sm">
          <Skeleton className="w-24 h-24 lg:w-16 lg:h-16 rounded-full" />

          <div className="flex flex-col items-center lg:items-start w-full max-w-72 gap-1">
            <Skeleton className="w-40 h-5" />
            <Skeleton className="w-60 h-3" />
          </div>
        </div>

        <div className="hidden lg:flex w-full max-w-xs">
          <SearchSheet />
        </div>

        <div className="hidden lg:flex flex-row gap-2">
          <Skeleton className="w-28 h-9" />
          <Skeleton className="w-28 h-9" />
          <Skeleton className="w-9 h-9" />
        </div>
      </Card>
    </header>
  )
}
