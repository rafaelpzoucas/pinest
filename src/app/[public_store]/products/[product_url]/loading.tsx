import { Header } from '@/components/store-header'

import { Skeleton } from '@/components/ui/skeleton'

export default async function ProductPageLoading() {
  return (
    <main className="flex flex-col items-center justify-center gap-6">
      <Header cartProducts={[]} store={null} customer={null} />

      <div className="w-full max-w-7xl">
        <div className="flex flex-col xl:flex-row xl:gap-12">
          <div className="lg:sticky top-0 w-full max-w-md">
            <Skeleton className="relative w-full aspect-square overflow-hidden border-none" />
          </div>

          <section className="mt-6 lg:mt-0 space-y-6 lg:space-y-12 w-full">
            <div className="lg:flex flex-col-reverse gap-4">
              <Skeleton className="w-32 h-5 lg:h-[30px]" />
              <Skeleton className="w-96 h-[18px] lg:h-5" />
            </div>

            <div className="flex flex-row gap-4 w-full">
              <div className="flex flex-row items-center gap-3">
                <Skeleton className="w-9 h-9" />
                <Skeleton className="w-4 h-4" />
                <Skeleton className="w-9 h-9" />
              </div>

              <Skeleton className="w-full max-w-md h-9" />
            </div>

            <div className="space-y-1 w-full">
              <Skeleton className="w-full h-[14px]" />
              <Skeleton className="w-11/12 h-[14px]" />
              <Skeleton className="w-1/3 h-[14px]" />
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
