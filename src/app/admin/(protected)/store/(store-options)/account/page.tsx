import { Header } from '@/components/header'
import { readStoreByUserId, readUser } from './actions'
import { Address } from './address'
import { Profile } from './profile'
import { Store } from './store'

export default async function AccountPage() {
  const { data: user, error: userError } = await readUser()
  const { store, storeError } = await readStoreByUserId()

  if (userError) {
    console.error(userError)
  }

  if (storeError) {
    console.error(storeError)
  }

  return (
    <main className="flex flex-col gap-4">
      <Header title="Minha conta" />
      <Profile user={user && user} />
      <Store store={store} />
      <Address address={store && store?.addresses[0]} />
    </main>
  )
}
