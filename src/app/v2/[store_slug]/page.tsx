import { getStoreInitialData } from '@/features/store/initial-data/read'
import { StoreEdgeConfig } from '@/features/store/initial-data/schemas'
import { extractSubdomainOrDomain } from '@/lib/helpers'
import { calculateStoreStatus } from '@/utils/store-status'
import { get } from '@vercel/edge-config'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Categories } from './categories'
import { StoreHeader } from './header'
import { ProductsList } from './products-list'
import { Showcases } from './showcases'

export async function generateMetadata({
  params,
}: {
  params: { store_slug: string }
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
    title: `${formattedTitle} | Home`,
    description: store?.description,
    icons: { icon: store.logo_url },
  }
}

interface StorePageProps {
  params: {
    store_slug: string
  }
}

export default async function StorePage({ params }: StorePageProps) {
  const [storeData] = await getStoreInitialData({
    subdomain: params.store_slug,
  })

  if (!storeData) {
    notFound()
  }

  const store = storeData.store
  const categories = storeData.categories

  // CALCULA O STATUS NO SERVIDOR 🔥
  const initialStatus = calculateStoreStatus(store)

  return (
    <div>
      {/* Passa o status inicial calculado no servidor */}
      <StoreHeader store={store} initialStatus={initialStatus} />

      <main className="mt-[45vh] bg-background relative z-10 drop-shadow-lg pt-4">
        <Categories categories={categories} />
        <Showcases store={store} />
        <ProductsList categories={categories} />
      </main>
    </div>
  )
}
