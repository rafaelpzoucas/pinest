import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatCurrencyBRL } from '@/lib/utils'
import { Pyramid } from 'lucide-react'
import { getStoreByStoreURL } from '../../actions'
import {
  getCart,
  readStripeConnectedAccountByStoreUrl,
} from '../../cart/actions'
import { PublicStoreNavigation } from '../../navigation'
import { SearchSheet } from '../search/search-sheet'
import { readOwnShipping } from './actions'

export async function Header({ storeURL }: { storeURL: string }) {
  const supabase = createClient()

  const { store, storeError } = await getStoreByStoreURL(storeURL)
  const { cart } = await getCart(storeURL)
  const { shipping } = await readOwnShipping(storeURL)

  if (storeError) {
    console.error(storeError)
  }

  const { data: userData, error: userError } = await supabase.auth.getUser()

  const { user } = await readStripeConnectedAccountByStoreUrl(storeURL)

  const connectedAccount = user?.stripe_connected_account

  const storeNiche = store && store?.market_niches[0]

  return (
    <header className="flex items-center justify-center w-full">
      <Card
        className="flex flex-row items-center justify-between gap-2 w-full p-4 py-4 bg-secondary/50
          border-0"
      >
        <div className="flex flex-col items-center lg:flex-row gap-4 w-full max-w-sm">
          <Avatar className="w-24 h-24 lg:w-16 lg:h-16">
            <AvatarImage src={store?.logo_url} className="object-cover" />
            <AvatarFallback>
              <Pyramid />
            </AvatarFallback>
          </Avatar>

          <div className="text-center lg:text-left w-full max-w-72">
            <h1 className="text-xl capitalize font-bold">{store?.name}</h1>
            {storeNiche && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {storeNiche.name}
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
          <SearchSheet publicStore={storeURL} />
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
