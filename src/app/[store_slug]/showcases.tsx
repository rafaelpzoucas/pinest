import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

import { Store } from '@/features/store/initial-data/schemas'
import { readStoreShowcases } from '@/features/store/showcases/read'
import { ProductCard } from './product-card'

export async function Showcases({ store }: { store: Store }) {
  const [showcasesData] = await readStoreShowcases({ storeId: store.id })

  const showcases = showcasesData?.showcasesWithProducts

  if (!showcases) return null

  return (
    <>
      {showcases.map((showcase) => (
        <section key={showcase.id} className="space-y-4 p-4">
          <h1 className="text-xl font-bold uppercase">{showcase.name}</h1>

          <Carousel
            opts={{
              dragFree: true,
            }}
          >
            <CarouselContent>
              {showcase.products &&
                showcase.products.map((product) => (
                  <CarouselItem
                    className="flex-[0_0_40%] lg:flex-[0_0_22.5%]"
                    key={product.id}
                  >
                    <ProductCard
                      variant={'featured'}
                      data={product}
                      storeSubdomain={store?.store_subdomain}
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
      ))}
    </>
  )
}
