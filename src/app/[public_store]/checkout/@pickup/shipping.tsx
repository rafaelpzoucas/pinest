import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import {
  formatAddress,
  formatCurrencyBRL,
  formatDistanceToFuture,
} from '@/lib/utils'
import { AddressType } from '@/models/user'
import { ChevronRight, Edit } from 'lucide-react'
import Link from 'next/link'
import { simulateShipping } from './actions'

type ShippingOptionsType = {
  storeURL: string
  storeZipCode: string
  customerAddress: AddressType
}

export async function ShippingOptions({
  storeURL,
  storeZipCode,
  customerAddress,
}: ShippingOptionsType) {
  const { data: shipping } = await simulateShipping({
    storeURL,
    customerZipCode: customerAddress.zip_code,
    storeZipCode,
  })

  console.log(shipping)

  return (
    <Card className="p-4 w-full space-y-6">
      <header className="space-y-2 relative">
        <CardTitle>Entregar no meu endereço</CardTitle>
        <CardDescription>{formatAddress(customerAddress)}</CardDescription>
        <Link
          href={`addresses/register?id=${customerAddress.id}`}
          className="absolute top-0 right-0"
        >
          <Edit className="w-4 h-4" />
        </Link>
      </header>

      <div className="flex flex-col gap-2">
        {shipping &&
          shipping.length > 0 &&
          shipping.map((ship) => (
            <Link
              key={ship.idTransp}
              href={`?step=summary&pickup=delivery&address=${customerAddress?.id}&reference=${ship.referencia}&priceShip=${ship.vlrFrete}&transp=${ship.descricao}`}
            >
              <Card className="relative p-4 bg-secondary/50">
                <strong className="text-sm max-w-48 line-clamp-2">
                  {ship.descricao}
                </strong>

                <p className="text-xs text-muted-foreground">
                  Chegará {formatDistanceToFuture(ship.dtPrevEnt)} úteis
                </p>

                <div className="absolute right-4 top-4">
                  <span className="text-xs flex flex-row items-center">
                    {formatCurrencyBRL(ship.vlrFrete)}
                    <ChevronRight className="w-4 h-4 ml-2 text-muted-foreground" />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
      </div>
    </Card>
  )
}
