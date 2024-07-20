import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

import { ProductCard } from '@/components/product-card'
import { getTopSellers } from './actions'

export default async function TopSellersPage({
  params,
}: {
  params: { public_store: string }
}) {
  const { topSellers, topSellersError } = await getTopSellers(
    params.public_store,
  )

  if (topSellersError) {
    console.log(topSellersError)
    return null
  }

  if (topSellers?.length === 0) {
    return null
  }

  return (
    <section className="space-y-4 p-4 px-5 bg-secondary/50 rounded-xl">
      <h1 className="text-xl font-bold uppercase">Mais vendidos</h1>

      <Carousel
        opts={{
          dragFree: true,
        }}
      >
        <CarouselContent>
          {topSellers &&
            topSellers.map((product) => (
              <CarouselItem
                className="flex-[0_0_40%] lg:flex-[0_0_22.5%]"
                key={product.id}
              >
                <ProductCard
                  variant={'featured'}
                  data={product}
                  publicStore={params.public_store}
                />
              </CarouselItem>
            ))}
        </CarouselContent>

        <div className="hidden lg:block">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </section>
  )
}
