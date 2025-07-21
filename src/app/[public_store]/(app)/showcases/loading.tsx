import { ProductCard } from '@/components/product-card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Skeleton } from '@/components/ui/skeleton'

export default function ShowcasesLoading() {
  return (
    <section className="space-y-4">
      <Skeleton className="w-2/3 h-5" />

      <Carousel
        opts={{
          dragFree: true,
        }}
      >
        <CarouselContent>
          <CarouselItem className="flex-[0_0_40%] lg:flex-[0_0_22.5%]">
            <ProductCard variant={'featured'} />
          </CarouselItem>
          <CarouselItem className="flex-[0_0_40%] lg:flex-[0_0_22.5%]">
            <ProductCard variant={'featured'} />
          </CarouselItem>
          <CarouselItem className="flex-[0_0_40%] lg:flex-[0_0_22.5%]">
            <ProductCard variant={'featured'} />
          </CarouselItem>
          <CarouselItem className="flex-[0_0_40%] lg:flex-[0_0_22.5%]">
            <ProductCard variant={'featured'} />
          </CarouselItem>
          <CarouselItem className="flex-[0_0_40%] lg:flex-[0_0_22.5%]">
            <ProductCard variant={'featured'} />
          </CarouselItem>
          <CarouselItem className="flex-[0_0_40%] lg:flex-[0_0_22.5%]">
            <ProductCard variant={'featured'} />
          </CarouselItem>
          <CarouselItem className="flex-[0_0_40%] lg:flex-[0_0_22.5%]">
            <ProductCard variant={'featured'} />
          </CarouselItem>
        </CarouselContent>

        <div className="hidden lg:block">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </section>
  )
}
