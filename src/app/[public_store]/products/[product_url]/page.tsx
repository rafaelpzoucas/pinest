import Image from 'next/image'

import { Card } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'

import defaultThumbUrl from '../../../../../public/default_thumb_url.png'

import { Header } from '@/components/store-header'
import { createClient } from '@/lib/supabase/server'
import { getStoreByStoreURL } from '../../actions'
import {
  getCart,
  readStripeConnectedAccountByStoreUrl,
} from '../../cart/actions'
import { readCustomerAddress, readStoreAddress } from '../../checkout/actions'
import { readProductByURL, readProductVariations } from './actions'
import { ProductInfo } from './info'

export default async function ProductPage({
  params,
}: {
  params: { product_url: string; public_store: string }
}) {
  const supabase = createClient()

  const { store, storeError } = await getStoreByStoreURL(params.public_store)
  const { storeAddress } = await readStoreAddress(params.public_store)
  const { customerAddress } = await readCustomerAddress()

  const { cart } = await getCart(params.public_store)

  if (storeError) {
    console.error(storeError)
  }

  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError) {
    console.error({ userError })
  }

  const { user } = await readStripeConnectedAccountByStoreUrl(
    params.public_store,
  )

  const connectedAccount = user?.stripe_connected_account

  const { product, productError } = await readProductByURL(
    params.public_store,
    params.product_url,
  )

  if (productError) {
    console.error({ productError })
  }

  const { variations, variationsError } = await readProductVariations(
    params.public_store,
    params.product_url,
  )

  if (productError) {
    console.error(productError)
  }

  if (variationsError) {
    console.error(variationsError)
  }

  const productImages = product.product_images

  return (
    <main className="flex flex-col items-center justify-center gap-6">
      <Header
        cartProducts={cart}
        connectedAccount={connectedAccount}
        store={store}
        userData={userData}
      />

      <div className="w-full max-w-7xl">
        <div className="flex flex-col md:flex-row md:gap-12">
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

          {storeAddress && (
            <ProductInfo
              product={product}
              publicStore={params.public_store}
              variations={variations}
              storeAddress={storeAddress}
            />
          )}
        </div>
      </div>
    </main>
  )
}
