import { Header } from '@/components/store-header'
import { getStoreByStoreURL } from '../actions'
import { selectCustomerUser } from './actions'
import { AccountForm } from './form'

export default async function AccountPage({
  params,
}: {
  params: { public_store: string }
}) {
  const { store } = await getStoreByStoreURL(params.public_store)

  const { customerUser } = await selectCustomerUser()

  return (
    <div className="space-y-4">
      <Header title="Minha conta" store={store} />

      <AccountForm user={customerUser} />
    </div>
  )
}
