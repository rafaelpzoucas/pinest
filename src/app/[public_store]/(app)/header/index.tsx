import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { formatCurrencyBRL } from '@/lib/utils'
import { CartProductType } from '@/models/cart'
import { StoreType } from '@/models/store'
import { Pyramid } from 'lucide-react'
import { readCustomerCached } from '../../account/actions'
import { PublicStoreNavigation } from '../../navigation'
import { SearchSheet } from '../search/search-sheet'
import { readOwnShippingCached } from './actions'
import { Status } from './status'

export async function Header({
  store,
  cart,
}: {
  store?: StoreType
  cart: CartProductType[]
}) {
  const [[customerData], [shippingData]] = await Promise.all([
    await readCustomerCached({}),
    await readOwnShippingCached(),
  ])

  const customer = customerData?.customer
  const shipping = shippingData?.shipping
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

          <div className="space-y-2">
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

            {store && <Status store={store} />}
          </div>
        </div>

        <div className="hidden lg:block">
          <SearchSheet subdomain={store?.store_subdomain} />
        </div>

        <div className="hidden lg:block">
          <PublicStoreNavigation
            cartProducts={cart ?? []}
            customer={customer}
            storeSubdomain={store?.store_subdomain}
          />
        </div>
      </Card>
    </header>
  )
}
