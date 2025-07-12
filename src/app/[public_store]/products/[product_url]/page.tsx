import Image from 'next/image'

import { Card } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'

import defaultThumbUrl from '../../../../../public/default_thumb_url.png'

import { Header } from '@/components/store-header'
import { readCustomerCached } from '../../account/actions'
import { readStoreCached } from '../../actions'
import { readCartCached } from '../../cart/actions'
import { generateRequestId, logCpu } from '../../utils'
import {
  readExtrasCached,
  readProductByURLCached,
  readProductVariationsCached,
} from './actions'
import { ProductInfo } from './info'

export default async function ProductPage({
  params,
  searchParams,
}: {
  searchParams: { cart_product_id: string }
  params: { product_url: string }
}) {
  const requestId = generateRequestId()

  return await logCpu(`${requestId}::ProductPage`, async () => {
    const cartProductId = searchParams.cart_product_id

    const [
      [productData],
      [extrasData],
      [cartData],
      [variationsData],
      [customerData],
      [storeData],
    ] = await logCpu(`${requestId}::fetchProductData`, async () => {
      return await Promise.all([
        readProductByURLCached({ productURL: params.product_url }),
        readExtrasCached(),
        readCartCached(),
        readProductVariationsCached({ productURL: params.product_url }),
        readCustomerCached({}),
        readStoreCached(),
      ])
    })

    const {
      store,
      extras,
      cart,
      storeAddress,
      product,
      variations,
      customer,
      cartProduct,
      productImages,
    } = {
      store: storeData?.store,
      extras: extrasData?.extras,
      cart: cartData?.cart,
      storeAddress: storeData?.store?.addresses[0],
      product: productData?.product,
      variations: variationsData?.variations,
      customer: customerData?.customer,
      cartProduct: cartData?.cart?.find((item) => item.id === cartProductId),
      productImages: productData?.product?.product_images || [],
    }

    return (
      <main className="flex flex-col items-center justify-center gap-6">
        <Header
          cartProducts={cart}
          store={store}
          customer={customer}
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
                observations={cartProduct?.observations}
              />
            )}
          </div>
        </div>
      </main>
    )
  })
}
