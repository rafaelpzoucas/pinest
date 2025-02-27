import { AdminHeader } from '@/app/admin-header'
import { readStoreByUserId, readUser } from './actions'
import { Address } from './address'
import { AppearenceForm } from './appearence'
import { Hours } from './hours'
import { Profile } from './profile'
import { Socials } from './socials'
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
      <AdminHeader title="Minha conta" />

      <Profile user={user && user} />
      <Store store={store} />
      <AppearenceForm store={store} />
      <Socials store={store} />
      <Hours store={store} />
      <Address address={store && store?.addresses[0]} />
    </main>
  )
}
