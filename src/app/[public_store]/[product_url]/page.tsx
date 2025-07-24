'use client'

import Image from 'next/image'

import { Card } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'

import defaultThumbUrl from '../../../../public/default_thumb_url.png'

import {
  readExtras,
  readProductByURL,
  readProductVariations,
} from '@/actions/client/app/public_store/products/product_url'
import { Header } from '@/components/store-header'
import { useCartStore } from '@/stores/cartStore'
import { usePublicStore } from '@/stores/public-store'
import { useQuery } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'next/navigation'
import { ProductInfo } from './info'
import ProductPageLoading from './loading'

export default function ProductPage() {
  const { cart } = useCartStore()

  const searchParams = useSearchParams()
  const params = useParams()

  const cartProductId = searchParams.get('cart_product_id')

  const productURL = params.product_url as string

  const { store } = usePublicStore()

  const { data: productData, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', productURL],
    queryFn: () => readProductByURL({ productURL, storeId: store?.id }),
    enabled: !!store,
  })

  const { data: variationsData } = useQuery({
    queryKey: ['variations', productURL],
    queryFn: () =>
      readProductVariations({ productId: productData?.product.id }),
    enabled: !!store,
  })

  const { data: extrasData } = useQuery({
    queryKey: ['extras', productURL],
    queryFn: () => readExtras({ storeId: store?.id }),
    enabled: !!store,
  })

  const extras = extrasData?.extras
  const storeAddress = store?.addresses[0]
  const product = productData?.product
  const variations = variationsData?.variations

  const cartProduct = cart?.find((item) => item.id === cartProductId)

  const productImages = product?.product_images || []

  if (!store || isLoadingProduct) {
    return <ProductPageLoading />
  }

  return (
    <>
      <main className="flex flex-col items-center justify-center gap-6">
        <Header
          cartProducts={cart}
          store={store}
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
    </>
  )
}
