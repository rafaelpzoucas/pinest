import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard } from '../components/product-card'

export default function StoreLoading() {
  return (
    <section className="space-y-4 p-4">
      <Skeleton className="w-1/2 h-[1.25rem]" />

      <Carousel
        opts={{
          dragFree: true,
        }}
      >
        <CarouselContent>
          <CarouselItem className="flex-[0_0_40%]">
            <ProductCard variant={'featured'} />
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </section>
  )
}
