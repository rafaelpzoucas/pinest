import { Header } from '@/components/store-header'
import { createClient } from '@/lib/supabase/server'
import { readStoreCached } from '../../actions'
import { readAddressById } from '../../checkout/@summary/actions'
import { AddressForm } from './form'

export default async function CustomerAddressRegister({
  searchParams,
}: {
  searchParams: { id: string }
}) {
  const supabase = createClient()

  const [storeData] = await readStoreCached()

  const store = storeData?.store

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { address } = await readAddressById(searchParams.id)

  return (
    <section className="space-y-6">
      <Header />

      <AddressForm
        address={address}
        user={user}
        storeSubdomain={store?.store_subdomain}
      />
    </section>
  )
}
