import { readProductBySlug } from '@/features/store/products/read'
import { readStoreIdBySlug } from '@/features/store/store/read'
import { ExtrasSection } from './extras'
import { ProductImages } from './images'
import { ProductInfo } from './info'
import { ScrollToTop } from './scroll-to-top'

export default async function ProductPage({
  params,
}: {
  params: { store_slug: string; product_slug: string }
}) {
  const [storeData] = await readStoreIdBySlug({ storeSlug: params.store_slug })
  const [productData] = await readProductBySlug({
    productSlug: params.product_slug,
    storeId: storeData?.storeId,
  })

  const product = productData?.product

  if (!product) return null

  const productImages = product?.product_images || []

  return (
    <div>
      <ProductImages images={productImages} />

      <main className="mt-[45dvh] bg-background relative z-10 pb-24">
        <ProductInfo product={product} />
        <ExtrasSection storeId={storeData?.storeId} productId={product.id} />
      </main>

      <ScrollToTop />
    </div>
  )
}
