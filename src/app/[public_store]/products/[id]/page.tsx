import Image from 'next/image'

import { Island } from '@/components/island'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { ShoppingBag } from 'lucide-react'

import { Header } from '@/components/header'
import { formatCurrencyBRL } from '@/lib/utils'
import { readProductById } from './actions'
import { AddToCardDrawer } from './add-to-cart-drawer'

export default async function ProductPage({
  params,
}: {
  params: { id: string }
}) {
  const { product, error } = await readProductById(params.id)

  if (error) {
    console.log(error)
  }

  return (
    <main className="flex flex-col gap-6 p-4">
      <header className="flex flex-row justify-between">
        <Header />

        <Button variant={'secondary'} size={'icon'}>
          <ShoppingBag className="w-4 h-4" />
        </Button>
      </header>

      <Carousel>
        <CarouselContent>
          <CarouselItem className="flex-[0_0_85%]">
            <Card className="relative w-full aspect-square overflow-hidden border-none">
              <Image
                src={product.thumb_url}
                alt=""
                fill
                className="object-cover"
              />
            </Card>
          </CarouselItem>
          <CarouselItem className="flex-[0_0_85%]">
            <Card className="relative w-full aspect-square overflow-hidden border-none">
              <Image
                src={product.thumb_url}
                alt=""
                fill
                className="object-cover"
              />
            </Card>
          </CarouselItem>
          <CarouselItem className="flex-[0_0_85%]">
            <Card className="relative w-full aspect-square overflow-hidden border-none">
              <Image
                src={product.thumb_url}
                alt=""
                fill
                className="object-cover"
              />
            </Card>
          </CarouselItem>
        </CarouselContent>
      </Carousel>

      <section className="space-y-2">
        <h1 className="text-lg capitalize font-bold">{product.name}</h1>
        <strong className="text-primary">
          {formatCurrencyBRL(product.price)}
        </strong>
        <p className="text-sm text-muted-foreground">{product.description}</p>
      </section>

      <footer>
        <Island>
          <div className="flex w-full p-2">
            <AddToCardDrawer product={product} />
          </div>
        </Island>
      </footer>
    </main>
  )
}
