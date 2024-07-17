import Image from 'next/image'

import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { ShoppingBag } from 'lucide-react'

import { Header } from '@/components/header'
import { cn, formatCurrencyBRL } from '@/lib/utils'
import defaultThumbUrl from '../../../../../public/default_thumb_url.png'

import { CartProductType } from '@/models/cart'
import Link from 'next/link'
import { getCart } from '../../cart/actions'
import { readProductById } from './actions'
import { AddToCard } from './add-to-cart'

export default async function ProductPage({
  params,
}: {
  params: { id: string; public_store: string }
}) {
  const products: CartProductType[] = await getCart(params.public_store)
  const { product, productError } = await readProductById(params.id)

  if (productError) {
    console.error(productError)
  }

  const productImages = product.product_images

  return (
    <main className="flex flex-col p-4 items-center justify-center">
      <div className="w-full max-w-6xl">
        <header className="flex flex-row justify-between">
          <Header />

          <Link
            href={`/${params.public_store}/cart`}
            className={cn(buttonVariants({ variant: 'secondary' }), 'px-3')}
          >
            {products.length > 0 && (
              <span className="text-xs text-muted-foreground mr-2">
                {products.length}
              </span>
            )}
            <ShoppingBag className="w-4 h-4" />
          </Link>
        </header>

        <div className="flex flex-col xl:flex-row xl:gap-6">
          <div className="w-full max-w-xl">
            {productImages.length < 2 && (
              <Card className="relative w-full aspect-square overflow-hidden border-none">
                <Image
                  src={productImages[0]?.image_url ?? defaultThumbUrl}
                  alt=""
                  fill
                  className="object-cover"
                />
              </Card>
            )}

            {productImages.length > 2 && (
              <Carousel>
                <CarouselContent>
                  {productImages.map((image) => (
                    <CarouselItem key={image.id} className="flex-[0_0_85%]">
                      <Card className="relative w-full aspect-square overflow-hidden border-none">
                        <Image
                          src={image.image_url}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            )}
          </div>

          <section className="mt-6 space-y-6">
            <div>
              <strong className="text-primary">
                {formatCurrencyBRL(product.price)}
              </strong>
              <h1 className="text-lg capitalize font-bold">{product.name}</h1>
            </div>
            <AddToCard publicStore={params.public_store} product={product} />
            <p className="text-sm text-muted-foreground">
              {product.description}
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
