'use client'

import Image from 'next/image'

import { Island } from '@/components/island'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { formatCurrencyBRL } from '@/lib/utils'
import burgerImg from '../../../../../../public/teste/burger.jpg'
import { AddToCardDrawer } from './add-to-cart-drawer'

const product = {
  thumb_url: burgerImg,
  title: 'Hambúrguer Artesanal',
  description:
    'Delicioso hambúrguer artesanal feito com carne angus, queijo cheddar derretido, alface crocante, tomate fresco e molho especial, tudo servido em um pão brioche levemente tostado.',
  price: 50.0,
  promotional_price: 0,
}

export default function ProductPage() {
  const router = useRouter()

  return (
    <main className="flex flex-col gap-6 p-4">
      <header className="flex flex-row justify-between">
        <div onClick={() => router.back()}>
          <Button variant={'secondary'}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Voltar</span>
          </Button>
        </div>

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
        <h1 className="text-lg capitalize font-bold">{product.title}</h1>
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
