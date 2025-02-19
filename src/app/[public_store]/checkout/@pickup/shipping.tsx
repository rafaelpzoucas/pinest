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
  if (!customerAddress) {
    return (
      <Card className="flex flex-col gap-2 w-full">
        <Link href={`?step=summary&pickup=delivery`} className="space-y-2 p-4">
          <header className="flex flex-row items-center justify-between">
            <strong className="text-sm">Entregar no meu endereço</strong>
          </header>

          <p className="text-muted-foreground line-clamp-2">
            Você não possui nenhum endereço cadastrado.
          </p>
        </Link>

        <Link href={`addresses/register`}>
          <footer className="border-t p-4 text-sm">
            <strong>Cadastrar endereço</strong>
          </footer>
        </Link>
      </Card>
    )
  }

  const { data: shipping } = await simulateShipping({
    storeURL,
    customerZipCode: customerAddress.zip_code,
    storeZipCode,
  })

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
              href={`?step=summary&pickup=shipping&address=${customerAddress?.id}&reference=${ship.referencia}&shippingPrice=${ship.vlrFrete}&transp=${ship.descricao}`}
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
