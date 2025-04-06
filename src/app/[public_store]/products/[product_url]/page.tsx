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
import { readStore } from '../../actions'
import {
  readCart,
  readStripeConnectedAccountByStoreUrl,
} from '../../cart/actions'
import { readExtras, readProductByURL, readProductVariations } from './actions'
import { ProductInfo } from './info'

export default async function ProductPage({
  params,
  searchParams,
}: {
  searchParams: { cart_product_id: string }
  params: { product_url: string }
}) {
  const cartProductId = searchParams.cart_product_id

  const supabase = createClient()

  const [
    [storeData],
    [extrasData],
    [cartData],
    [productData],
    [productVariationsData],
  ] = await Promise.all([
    readStore(),
    readExtras(),
    readCart(),
    readProductByURL({ productURL: params.product_url }),
    readProductVariations({ productURL: params.product_url }),
  ])

  const store = storeData?.store
  const extras = extrasData?.extras
  const cart = cartData?.cart
  const storeAddress = store?.addresses[0]
  const product = productData?.product
  const variations = productVariationsData?.variations

  const cartProduct = cart?.find((item) => item.id === cartProductId)

  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError) {
    console.error({ userError })
  }

  const { user } = await readStripeConnectedAccountByStoreUrl(
    store?.store_subdomain,
  )

  const connectedAccount = user?.stripe_connected_account

  const productImages = product?.product_images || []

  return (
    <main className="flex flex-col items-center justify-center gap-6">
      <Header
        cartProducts={cart}
        connectedAccount={connectedAccount}
        store={store}
        userData={userData}
        storeSubdomain={store?.store_subdomain}
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

            {productImages.length >= 2 && (
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
              isOpen={store?.is_open}
              product={product}
              variations={variations}
              storeAddress={storeAddress}
              cartProduct={cartProduct}
              extras={extras}
            />
          )}
        </div>
      </div>
    </main>
  )
}
