import { readStoreCustomer } from '@/features/store/customers/read'
import { ReadCustomerForm } from './form'
import { CustomerRegisterForm } from './register/form'

export default async function AccountPage({
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
      {customer ? (
        <CustomerRegisterForm
          customer={customer}
          storeSlug={params.store_slug}
        />
      ) : (
        <ReadCustomerForm />
      )}
    </div>
  )
}
