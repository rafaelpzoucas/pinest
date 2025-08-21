'use client'

import { Card } from '@/components/ui/card'
import { CustomerAddress } from '@/features/store/customers/schemas'
import { Shippings } from '@/features/store/shippings/schemas'
import { formatAddress, formatCurrencyBRL } from '@/lib/utils'

import { Bike, ChevronRight } from 'lucide-react'
import Link from 'next/link'

type DeliveryProps = {
  customerAddress?: CustomerAddress
  shipping?: Shippings
}

export function Delivery({ customerAddress, shipping }: DeliveryProps) {
  return (
    <Card className="flex flex-col gap-2 w-full">
      {!customerAddress ? (
        <Link href="addresses/register">
          <div className="flex flex-col gap-2 p-4 w-full hover:bg-secondary/30">
            <Bike className="w-5 h-5 text-primary" />

            <header className="flex flex-row items-center justify-between">
              <strong className="text-sm">Entregar</strong>

              <div className="flex flex-row items-center gap-1 text-xs text-muted-foreground">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </header>
            <p className="text-muted-foreground mt-2">
              Cadastre o seu endereço
            </p>
          </div>
        </Link>
      ) : (
        <>
          <Link href={`?step=payment&pickup=DELIVERY`} className="space-y-2">
            <div className="flex items-center space-x-3 p-4">
              <Bike className="w-5 h-5 text-primary" />

              <div className="flex flex-col gap-2 w-full">
                <header className="flex flex-row items-center justify-between">
                  <p className="font-medium">Entregar</p>

                  <div className="flex flex-row items-center gap-1 text-xs text-muted-foreground">
                    <div className="flex flex-row items-center gap-2">
                      <p>{shipping?.delivery_time}min</p>
                      &bull;
                      <p className="text-primary">
                        {formatCurrencyBRL(shipping?.price ?? 0)}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </header>

                <p className="text-sm text-muted-foreground line-clamp-3">
                  {formatAddress(customerAddress)}
                </p>
              </div>
            </div>
          </Link>

          <Link href={`account/register?checkout=true`}>
            <footer className="border-t p-4 text-sm">
              <strong>Editar endereço</strong>
            </footer>
          </Link>
        </>
      )}
    </Card>
  )
}
