import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatCurrencyBRL } from '@/lib/utils'
import { Pyramid } from 'lucide-react'
import { SearchSheet } from '../(search)/search-sheet'
import { getStoreByStoreURL } from '../../actions'
import {
  getCart,
  readStripeConnectedAccountByStoreUrl,
} from '../../cart/actions'
import { PublicStoreNavigation } from '../../navigation'
import { readOwnShipping } from './actions'

export default async function HeaderPage({
  params,
}: {
  params: { public_store: string }
}) {
  const supabase = createClient()

  const { store, storeError } = await getStoreByStoreURL(params.public_store)
  const { cart } = await getCart(params.public_store)
  const { shipping } = await readOwnShipping(params.public_store)

  if (storeError) {
    console.error(storeError)
  }

  const { data: userData, error: userError } = await supabase.auth.getUser()

  const { user } = await readStripeConnectedAccountByStoreUrl(
    params.public_store,
  )

  const connectedAccount = user?.stripe_connected_account

  return (
    <header className="flex items-center justify-center w-full">
      <Card className="flex flex-row items-center justify-between gap-2 w-full p-4 py-4 bg-secondary/50 border-0">
        <div className="flex flex-col items-center lg:flex-row gap-4 w-full max-w-sm">
          <Avatar className="w-24 h-24 lg:w-16 lg:h-16">
            <AvatarImage src={store?.logo_url} className="object-cover" />
            <AvatarFallback>
              <Pyramid />
            </AvatarFallback>
          </Avatar>

          <div className="text-center lg:text-left w-full max-w-72">
            <h1 className="text-xl capitalize font-bold">{store?.name}</h1>
            {store?.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {store?.description}
              </p>
            )}

            {shipping && shipping.status && (
              <p className="text-xs mt-2 text-muted-foreground">
                Entrega: {shipping.delivery_time}min &bull;{' '}
                {formatCurrencyBRL(shipping.price)}
              </p>
            )}
          </div>
        </div>

        <div className="hidden lg:block">
          <SearchSheet publicStore={params.public_store} />
        </div>

        <div className="hidden lg:block">
          <PublicStoreNavigation
            cartProducts={cart}
            connectedAccount={connectedAccount}
            userData={userData}
          />
        </div>
      </Card>
    </header>
  )
}
