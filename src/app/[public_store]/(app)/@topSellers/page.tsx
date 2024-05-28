import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'

import { ProductCard } from '../components/product-card'
import { getTopSellers } from './actions'

export default async function TopSellersPage() {
  const { topSellers, topSellersError } = await getTopSellers()

  if (topSellersError) {
    console.log(topSellersError)
  }

  return (
    <section className="space-y-4 p-4">
      <h1 className="text-lg font-bold uppercase">Mais vendidos</h1>

      <Carousel
        opts={{
          dragFree: true,
        }}
      >
        <CarouselContent>
          {topSellers &&
            topSellers.map((product) => (
              <CarouselItem className="flex-[0_0_40%]" key={product.title}>
                <ProductCard variant={'featured'} data={product} />
              </CarouselItem>
            ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}
