import { Header } from '@/components/header'
import { readUser } from './actions'
import { Address } from './address'
import { Profile } from './profile'
import { Store } from './store'

export default async function AccountPage() {
  const { data: user, error } = await readUser()

  return (
    <main className="flex flex-col gap-4">
      <Header title="Minha conta" />
      <Profile user={user && user} />
      <Store store={user && user.stores[0]} />
      <Address address={user && user.addresses[0]} />
    </main>
  )
}
