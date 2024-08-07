import { Card } from '@/components/ui/card'

import { ProductCard } from '@/components/product-card'
import { Skeleton } from '@/components/ui/skeleton'

export default async function SummaryLoading() {
  return (
    <div className="flex flex-col w-full">
      <Card className="flex flex-col p-4 w-full space-y-2">
        <div className="flex flex-row justify-between text-xs text-muted-foreground">
          <p className="flex flex-row items-start gap-1">
            <Skeleton className="w-20 h-4" /> <Skeleton className="w-4 h-4" />
          </p>
          <Skeleton className="w-24 h-3" />
        </div>

        <div className="flex flex-row justify-between text-xs text-muted-foreground">
          <Skeleton className="w-9 h-3" />
          <Skeleton className="w-24 h-4" />
        </div>

        <div className="flex flex-row justify-between text-xs text-muted-foreground">
          <Skeleton className="w-full h-4" />
        </div>

        <div className="flex flex-row justify-between gap-2 text-sm pb-2">
          <Skeleton className="w-12 h-4" />
          <Skeleton className="w-20 h-4" />
        </div>

        <Skeleton className="w-full h-9" />
      </Card>

      <section className="flex flex-col items-center gap-2 text-center border-b py-6">
        <Skeleton className="w-5 h-5" />

        <Skeleton className="w-full h-4" />

        <Skeleton className="w-full h-3" />
        <Skeleton className="w-36 h-3" />

        <div className="py-3">
          <Skeleton className="w-52 h-4" />
        </div>
      </section>

      <section className="flex flex-col items-center gap-2 text-center border-b py-6">
        <Skeleton className="w-5 h-5" />

        <Skeleton className="w-full h-4" />

        <Skeleton className="w-full h-3" />
        <Skeleton className="w-36 h-3" />

        <div className="py-3">
          <Skeleton className="w-52 h-4" />
        </div>
      </section>

      <section className="flex flex-col items-start gap-2 py-6">
        <ProductCard variant={'bag_items'} className="w-full" />
        <ProductCard variant={'bag_items'} className="w-full" />
        <ProductCard variant={'bag_items'} className="w-full" />
      </section>
    </div>
  )
}
