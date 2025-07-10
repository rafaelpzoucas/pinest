import { Header } from '@/components/store-header'
import { readStoreCached } from '../actions'
import { readCustomerCached } from './actions'
import { ReadCustomerForm } from './form'
import { CustomerRegisterForm } from './register/form'

export default async function AccountPage() {
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
        storeSubdomain={store?.store_subdomain}
      />

      {customer ? (
        <CustomerRegisterForm
          customer={customer}
          storeSubdomain={store?.store_subdomain}
        />
      ) : (
        <ReadCustomerForm />
      )}
    </div>
  )
}
