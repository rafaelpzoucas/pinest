'use client'

import {
  readCustomerByPhone,
  readDeliveryData,
} from '@/actions/client/app/public_store/header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrencyBRL } from '@/lib/utils'
import { CartProductType } from '@/models/cart'
import { usePublicStore } from '@/stores/public-store'
import { useQuery } from '@tanstack/react-query'
import { Pyramid } from 'lucide-react'
import { PublicStoreNavigation } from '../../navigation'
import { SearchSheet } from '../search/search-sheet'
import HeaderLoading from './loading'
import { Status } from './status'

export function Header() {
  const { store } = usePublicStore()

  const { data: customerData } = useQuery({
    queryKey: ['customer', store?.id],
    queryFn: () => readCustomerByPhone(store),
    enabled: !!store,
  })

  const { data: deliveryData, isLoading: isDeliveryDataLoading } = useQuery({
    queryKey: ['delivery', store?.id],
    queryFn: () => readDeliveryData(store),
    enabled: !!store,
  })

  const delivery = deliveryData?.delivery
  const customer = customerData?.customer
  const cart: CartProductType[] = []

  if (!store) {
    return <HeaderLoading />
  }

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

              {isDeliveryDataLoading ? (
                <Skeleton className="h-4 w-40 mt-2" />
              ) : (
                delivery &&
                delivery.status && (
                  <p className="text-xs mt-2 text-muted-foreground">
                    Entrega: {delivery.delivery_time}min &bull;{' '}
                    {formatCurrencyBRL(delivery.price)}
                  </p>
                )
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
