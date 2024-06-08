import { Card } from '@/components/ui/card'

import { Header } from '@/components/header'

import { Skeleton } from '@/components/ui/skeleton'

export default async function ProductPageLoading() {
  return (
    <main className="flex flex-col gap-6 p-4">
      <div className="flex flex-row justify-between">
        <Header />
        <Skeleton className="w-8 h-8" />
      </div>

      <Card className="relative w-full aspect-square overflow-hidden border-none">
        <Skeleton className="w-full h-full" />
      </Card>

      <section className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-32" />

        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
      </section>
    </main>
  )
}
