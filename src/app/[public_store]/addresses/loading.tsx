import { Header } from '@/components/store-header'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronRight } from 'lucide-react'

export default async function AddressesPageLoading() {
  return (
    <div className="p-4 space-y-4">
      <Header title="Meus endereços" />

      <div className="flex flex-col gap-2">
        <Card className="relative flex flex-col gap-1 items-start p-4 text-sm">
          <Skeleton className="w-3/4 h-4" />
          <Skeleton className="w-28 h-[0.875rem]" />

          <ChevronRight className="absolute top-4 right-3 w-4 h-4" />
        </Card>
      </div>
    </div>
  )
}
