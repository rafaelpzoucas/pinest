import Image from 'next/image'

import { Card } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'

import { formatCurrencyBRL } from '@/lib/utils'
import defaultThumbUrl from '../../../../../public/default_thumb_url.png'

import { Header } from '@/components/header'
import { createClient } from '@/lib/supabase/server'
import { CartProductType } from '@/models/cart'
import { getStoreByStoreURL } from '../../actions'
import {
  getCart,
  readStripeConnectedAccountByStoreUrl,
} from '../../cart/actions'
import { readProductById } from './actions'
import { AddToCard } from './add-to-cart'

export default async function ProductPage({
  params,
}: {
  params: { id: string; public_store: string }
}) {
  const supabase = createClient()

  const { store, storeError } = await getStoreByStoreURL(params.public_store)

  const bagItems: CartProductType[] = await getCart(params.public_store)

  if (storeError) {
    console.error(storeError)
  }

  const { data: userData, error: userError } = await supabase.auth.getUser()

  const { user } = await readStripeConnectedAccountByStoreUrl(
    params.public_store,
  )

  const connectedAccount = user?.stripe_connected_account

  const { product, productError } = await readProductById(params.id)

  if (productError) {
    console.error(productError)
  }

  const productImages = product.product_images

  return (
    <main className="flex flex-col items-center justify-center gap-6">
      <Header
        bagItems={bagItems}
        connectedAccount={connectedAccount}
        store={store}
        userData={userData}
      />

      <div className="w-full max-w-7xl">
        <div className="flex flex-col xl:flex-row xl:gap-12">
          <div className="lg:sticky top-0 w-full max-w-md">
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

          <section className="mt-6 lg:mt-0 space-y-6 lg:space-y-12">
            <div className="lg:flex flex-col-reverse gap-4">
              <strong className="text-primary text-xl lg:text-3xl">
                {formatCurrencyBRL(product.price)}
              </strong>
              <h1 className="text-lg lg:text-xl capitalize font-bold">
                {product.name}
              </h1>
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
