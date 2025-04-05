import { Card } from '@/components/ui/card'
import { formatAddress } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { readOwnShipping } from '../../(app)/header/actions'
import { readCustomer } from '../../account/actions'
import { readStoreAddress } from '../actions'
import { Delivery } from './delivery'

export default async function PickupOptions() {
  const [[storeAddressData], [customerData], [shippingData]] =
    await Promise.all([readStoreAddress(), readCustomer({}), readOwnShipping()])

  const storeAddress = storeAddressData?.storeAddress
  const customerAddress = customerData?.customer.address
  const shipping = shippingData?.shipping

  const formattedAddress = storeAddress && formatAddress(storeAddress)

  return (
    <div className="flex flex-col items-center justify-center gap-2 w-full">
      {shipping && shipping.status && (
        <Delivery customerAddress={customerAddress} shipping={shipping} />
      )}

      {storeAddress && (
        <Card className="flex flex-col gap-2 w-full">
          <Link href={`?step=payment&pickup=TAKEOUT`} className="space-y-2 p-4">
            <header className="flex flex-row items-center justify-between">
              <strong className="text-sm">Retirar na loja</strong>

              <div className="flex flex-row items-center gap-1 text-xs text-muted-foreground">
                <p>Grátis</p>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </header>

            <p className="text-muted-foreground line-clamp-3">
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
