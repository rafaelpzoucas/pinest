import { readCustomer } from '@/features/store/customers/read'
import { CustomerRegisterForm } from './form'

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
    <div className="space-y-4 p-4 mt-[68px]">
      <CustomerRegisterForm
        customer={customer}
        storeSlug={params?.store_slug as string}
      />
    </div>
  )
}
