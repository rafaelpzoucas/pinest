import { ProductCard } from '@/components/product-card'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProductsListLoading() {
  return (
    <section className="flex flex-col gap-8 pt-4 pb-16">
      <div className="flex flex-col">
        <div className="py-4 bg-background">
          <Skeleton className="w-1/2 h-[1.25rem]" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ProductCard variant={'featured'} storeSubdomain="" />
          <ProductCard variant={'featured'} storeSubdomain="" />
          <ProductCard variant={'featured'} storeSubdomain="" />
        </div>
      </div>
      <div className="flex flex-col">
        <div className="py-4 bg-background">
          <Skeleton className="w-1/2 h-[1.25rem]" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ProductCard variant={'featured'} storeSubdomain="" />
          <ProductCard variant={'featured'} storeSubdomain="" />
          <ProductCard variant={'featured'} storeSubdomain="" />
        </div>
      </div>
      <div className="flex flex-col">
        <div className="py-4 bg-background">
          <Skeleton className="w-1/2 h-[1.25rem]" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ProductCard variant={'featured'} storeSubdomain="" />
          <ProductCard variant={'featured'} storeSubdomain="" />
          <ProductCard variant={'featured'} storeSubdomain="" />
        </div>
      </div>
    </section>
  )
}
