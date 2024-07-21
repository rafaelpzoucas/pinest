import { createClient } from '@/lib/supabase/server'
import { CartProductType } from '@/models/cart'
import { getStoreByStoreURL } from '../actions'
import { getCart, getConnectedAccountByStoreUrl } from '../cart/actions'
import Header from './header'

export default async function HeaderPage({
  params,
}: {
  params: { public_store: string }
}) {
  const supabase = createClient()

  const { store, storeError } = await getStoreByStoreURL(params.public_store)
  const bagItems: CartProductType[] = await getCart(params.public_store)

  if (storeError) {
    console.error(storeError)
  }

  const { data: userData, error: userError } = await supabase.auth.getUser()
  const connectedAccount = await getConnectedAccountByStoreUrl(
    params.public_store,
  )
  return (
    <Header
      userData={userData}
      store={store}
      bagItems={bagItems}
      connectedAccount={connectedAccount?.data}
      storeUrl={params.public_store}
    />
  )
}
