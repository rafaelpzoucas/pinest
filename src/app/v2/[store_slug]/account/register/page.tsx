import { readStoreCustomer } from '@/features/store/customers/read'
import { CustomerRegisterForm } from './form'

export default async function AccountRegisterPage({
  params,
}: {
  params: { store_slug: string }
}) {
  const [customerData] = await readStoreCustomer({
    subdomain: params.store_slug,
  })

  const customer = customerData?.customer

  return (
    <div className="space-y-4">
      <CustomerRegisterForm
        customer={customer}
        storeSlug={params?.store_slug as string}
      />
    </div>
  )
}
