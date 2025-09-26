import { readCustomer } from '@/features/store/customers/read'
import { StoreEdgeConfig } from '@/features/store/initial-data/schemas'
import { extractSubdomainOrDomain } from '@/lib/helpers'
import { get } from '@vercel/edge-config'
import { Metadata } from 'next'
import { CustomerRegisterForm } from './form'

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
    title: `${formattedTitle} | Minha conta`,
    description: store?.description,
    icons: { icon: store.logo_url },
  }
}

export default async function AccountRegisterPage({
  params,
}: {
  params: { store_slug: string }
}) {
  const [customerData] = await readCustomer({
    subdomain: params.store_slug,
  })

  const customer = customerData?.customer

  return (
    <div className="space-y-4 p-4 mt-[68px] pb-32">
      <CustomerRegisterForm
        customer={customer}
        storeSlug={params?.store_slug as string}
      />
    </div>
  )
}
