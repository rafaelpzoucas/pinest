import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

import { ProductCard } from '@/components/product-card'
import Benefits from '../benefits/page'
import { readShowcases } from './actions'

export default async function Showcases({
  params,
}: {
  params: { public_store: string }
}) {
  const showcases = await readShowcases(params.public_store)

  if (!showcases || showcases.length === 0) {
    return <Benefits params={{ public_store: params.public_store }} />
  }

  const [firstShowcase, ...otherShowcases] = showcases

  return (
    <>
      <section
        key={firstShowcase.id}
        className="space-y-4 p-4 px-5 bg-secondary/50 rounded-xl"
      >
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

      <Benefits params={{ public_store: params.public_store }} />

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
      ))}
    </>
  )
}
