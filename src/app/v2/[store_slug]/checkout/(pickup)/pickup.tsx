'use client'

import { Card } from '@/components/ui/card'
import { useReadStoreAddress } from '@/features/store/addresses/hooks'
import { useReadCustomer } from '@/features/store/customers/hooks'
import { useReadStoreShippings } from '@/features/store/shippings/hooks'
import { formatStoreAddress } from '@/utils/format-address'
import { ChevronRight, Store } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Delivery } from './delivery-card'
import PickupOptionsLoading from './loading'

export function PickupStep() {
  const params = useParams()

  const storeSlug = params.store_slug

  const { data: customerData, isPending: isReadingCustomer } = useReadCustomer({
    subdomain: storeSlug as string,
  })
  const { data: storeAddressData, isPending: isReadingStoreAddress } =
    useReadStoreAddress({
      subdomain: storeSlug as string,
    })
  const { data: storeShippingsData, isPending: isReadingStoreShippings } =
    useReadStoreShippings({
      subdomain: storeSlug as string,
    })

  const customer = customerData?.customer
  const customerAddress = customer?.address
  const storeAddress = storeAddressData?.storeAddress
  const shipping = storeShippingsData?.storeShippings

  const formattedStoreAddress = storeAddress && formatStoreAddress(storeAddress)

  const isPending =
    isReadingCustomer || isReadingStoreAddress || isReadingStoreShippings

  if (isPending) {
    return <PickupOptionsLoading />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Como você quer receber?</h2>
        <p className="text-muted-foreground text-sm">
          Escolha a forma de entrega que preferir
        </p>
      </div>

      <div className="space-y-4">
        {/* Retirar na loja - Link direto */}
        <Link href="?step=payment&pickup=TAKEOUT">
          <Card className="p-4 hover:bg-accent transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Store className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Retirar na loja</p>
                  <p className="text-muted-foreground line-clamp-2 text-sm max-w-[265px]">
                    {formattedStoreAddress}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </Card>
        </Link>

        <Delivery shipping={shipping} customerAddress={customerAddress} />
      </div>
    </div>
  )
}
