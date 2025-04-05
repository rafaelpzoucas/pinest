import { Header } from '@/components/store-header'
import { readStore } from '../../actions'
import { readCustomer } from '../actions'
import { CustomerRegisterForm } from './form'

export default async function AccountRegisterPage() {
  const [[storeData], [customerData]] = await Promise.all([
    readStore(),
    readCustomer({}),
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
