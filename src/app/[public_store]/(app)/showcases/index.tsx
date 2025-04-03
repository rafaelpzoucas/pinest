import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

import { ProductCard } from '@/components/product-card'

import { ShowcaseType } from '@/models/showcase'
import { StoreType } from '@/models/store'
import { Benefits } from '../benefits'

export async function Showcases({
  showcases,
  store,
}: {
  showcases?: ShowcaseType[]
  store?: StoreType
}) {
  if (!showcases || showcases.length === 0) {
    return <Benefits />
  }

  const [firstShowcase, ...otherShowcases] = showcases

  return (
    <>
      <section key={firstShowcase.id} className="space-y-4">
        <h1 className="text-xl font-bold uppercase">{firstShowcase.name}</h1>

        <Carousel
          opts={{
            dragFree: true,
          }}
        >
          <CarouselContent>
            {firstShowcase.products &&
              firstShowcase.products.map((product) => (
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

      <Benefits />

      {otherShowcases.map((showcase) => (
        <section
          key={showcase.id}
          className="space-y-4 p-4 px-5 bg-secondary/50 rounded-xl"
        >
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
