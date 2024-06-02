import { readUser } from './actions'
import { Address } from './address'
import { Profile } from './profile'
import { Store } from './store'

export default async function AccountPage() {
  const { data: users, error } = await readUser()

  return (
    <main className="flex flex-col gap-4">
      <Profile user={users && users[0]} />
      <Store store={users && users[0].stores[0]} />
      <Address address={users && users[0].addresses[0]} />
    </main>
  )
}
