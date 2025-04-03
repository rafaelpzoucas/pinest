import { Header } from '@/components/store-header'
import { readStore } from '../actions'
import { selectCustomerUser } from './actions'
import { AccountForm } from './form'

export default async function AccountPage() {
  const [storeData] = await readStore()
  const store = storeData?.store

  const { customerUser } = await selectCustomerUser()

  return (
    <div className="space-y-4">
      <Header
        title="Minha conta"
        store={store}
        storeSubdomain={store?.store_subdomain}
      />

      <AccountForm user={customerUser} />
    </div>
  )
}
