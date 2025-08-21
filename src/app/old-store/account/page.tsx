import { Header } from '@/components/store-header'
import { readStoreCached } from '../actions'
import { readCustomerCached } from './actions'
import { ReadCustomerForm } from './form'
import { CustomerRegisterForm } from './register/form'

export default async function AccountPage({
  params,
}: {
  params: { public_store: string }
}) {
  const [[storeData], [customerData]] = await Promise.all([
    readStoreCached(),
    readCustomerCached({}),
  ])
  const store = storeData?.store
  const customer = customerData?.customer

  return (
    <div className="space-y-4">
      <Header
        title="Minha conta"
        store={store}
        storeSubdomain={params.public_store}
      />

      {customer ? (
        <CustomerRegisterForm
          customer={customer}
          storeSubdomain={params.public_store}
        />
      ) : (
        <ReadCustomerForm />
      )}
    </div>
  )
}
