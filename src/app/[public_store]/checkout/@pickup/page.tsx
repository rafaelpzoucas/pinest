import { Card } from '@/components/ui/card'
import { formatAddress, isSameCity } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { readOwnShipping } from '../../(app)/header/actions'
import { getCart } from '../../cart/actions'
import { readCustomerAddress, readStoreAddress } from '../actions'
import { Delivery } from './delivery'
import { ShippingOptions } from './shipping'

export default async function PickupOptions({
  params,
}: {
  params: { public_store: string }
}) {
  const { storeAddress, storeAddressError } = await readStoreAddress(
    params.public_store,
  )
  const { customerAddress, customerAddressError } = await readCustomerAddress()

  if (customerAddressError) {
    console.error(customerAddressError)
  }

  const { shipping } = await readOwnShipping(params.public_store)

  const { cart } = await getCart(params.public_store)

  if (customerAddressError) {
    console.error(customerAddressError)
  }

  if (storeAddressError) {
    console.error(storeAddressError)
  }

  const isAddressesSameCity =
    storeAddress &&
    (await isSameCity(storeAddress?.zip_code, customerAddress?.zip_code))

  const formattedAddress = storeAddress && formatAddress(storeAddress)

  return (
    <div className="flex flex-col items-center justify-center gap-2 w-full">
      {storeAddress && cart && !isAddressesSameCity && (
        <ShippingOptions
          storeZipCode={storeAddress.zip_code}
          customerAddress={customerAddress}
          storeURL={params.public_store}
        />
      )}

      {shipping && shipping.status && isAddressesSameCity && (
        <Delivery customerAddress={customerAddress} shipping={shipping} />
      )}

      {storeAddress && (
        <Card className="flex flex-col gap-2 w-full">
          <Link href={`?step=summary&pickup=pickup`} className="space-y-2 p-4">
            <header className="flex flex-row items-center justify-between">
              <strong className="text-sm">Retirar na loja</strong>

              <div className="flex flex-row items-center gap-1 text-xs text-muted-foreground">
                <p>Grátis</p>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </header>

            <p className="text-muted-foreground line-clamp-2">
              {formatAddress(storeAddress)}
            </p>
          </Link>

          {formattedAddress && (
            <Link
              href={`https://www.google.com/maps?q=${formattedAddress.replaceAll(' ', '+')}`}
              target="_blank"
            >
              <footer className="border-t p-4 text-sm">
                <strong>Ver localização</strong>
              </footer>
            </Link>
          )}
        </Card>
      )}
    </div>
  )
}
