import { Header } from '@/components/store-header'
import { readStoreCached } from '../../actions'
import { readCustomerCached } from '../actions'
import { CustomerRegisterForm } from './form'

export default async function AccountRegisterPage() {
  const [[storeData], [customerData]] = await Promise.all([
    readStoreCached(),
    readCustomerCached({}),
  ])

  const store = storeData?.store
  const customer = customerData?.customer
  const subdomain = store?.store_subdomain

  return (
    <div className="space-y-4">
      <Header title="Minha conta" store={store} storeSubdomain={subdomain} />

      <CustomerRegisterForm customer={customer} storeSubdomain={subdomain} />
    </div>
  )
}
