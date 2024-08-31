import { ProductCard } from '@/components/product-card'
import { Header } from '@/components/store-header'
import { Skeleton } from '@/components/ui/skeleton'

export default async function SearchPageLoading() {
  return (
    <div className="space-y-6 lg:space-y-8">
      <Header
        store={null}
        cartProducts={[]}
        userData={null}
        connectedAccount={null}
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full space-y-2">
          <Skeleton className="w-48 h-6" />

          <Skeleton className="w-52 h-3" />

          <section className="flex flex-col gap-8 pt-4 pb-16 w-full">
            <div className="flex flex-col">
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6">
                <ProductCard variant={'featured'} />
                <ProductCard variant={'featured'} />
                <ProductCard variant={'featured'} />
                <ProductCard variant={'featured'} />
                <ProductCard variant={'featured'} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
