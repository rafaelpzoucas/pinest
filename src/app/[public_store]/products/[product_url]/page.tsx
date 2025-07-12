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
  console.time('ProductPage')
  const cartProductId = searchParams.cart_product_id

  console.time('fetchProductData')
  const [
    [productData],
    [extrasData],
    [cartData],
    [variationsData],
    [customerData],
    [storeData],
  ] = await Promise.all([
    readProductByURLCached({ productURL: params.product_url }),
    readExtrasCached(),
    readCartCached(),
    readProductVariationsCached({ productURL: params.product_url }),
    readCustomerCached({}),
    readStoreCached(),
  ])
  console.timeEnd('fetchProductData')

  console.time('processProductData')
  const store = storeData?.store
  const extras = extrasData?.extras
  const cart = cartData?.cart
  const storeAddress = store?.addresses[0]
  const product = productData?.product
  const variations = variationsData?.variations
  const customer = customerData?.customer

  const cartProduct = cart?.find((item) => item.id === cartProductId)

  const productImages = product?.product_images || []
  console.timeEnd('processProductData')

  console.timeEnd('ProductPage')
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
}
