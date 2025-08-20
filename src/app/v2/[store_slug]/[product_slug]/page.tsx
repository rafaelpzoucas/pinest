import { StoreEdgeConfig } from '@/features/store/initial-data/schemas'
import { readProductBySlug } from '@/features/store/products/read'
import { readStoreIdBySlug } from '@/features/store/store/read'
import { extractSubdomainOrDomain } from '@/lib/helpers'
import { formatSlug } from '@/utils/format-slug'
import { get } from '@vercel/edge-config'
import { Metadata } from 'next'
import { ExtrasSection } from './extras'
import { ProductImages } from './images'
import { ProductInfo } from './info'
import { ScrollToTop } from './scroll-to-top'

export async function generateMetadata({
  params,
}: {
  params: { store_slug: string; product_slug: string }
}): Promise<Metadata> {
  const sub =
    params.store_slug !== 'undefined'
      ? params.store_slug
      : (extractSubdomainOrDomain() as string)

  const store = (await get(`store_${sub}`)) as StoreEdgeConfig

  if (!store) {
    return { title: 'Pinest' }
  }

  const formattedTitle = store?.name
    ?.toLowerCase()
    .replace(/\b\w/g, (char: string) => char.toUpperCase())

  return {
    title: `${formatSlug(params.product_slug)} | ${formattedTitle}`,
    description: store?.description,
    icons: { icon: store.logo_url },
  }
}

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

      <main className="mt-[45vh] bg-background relative z-10 pb-24">
        <ProductInfo product={product} />
        <ExtrasSection storeId={storeData?.storeId} productId={product.id} />
      </main>

      <ScrollToTop />
    </div>
  )
}
