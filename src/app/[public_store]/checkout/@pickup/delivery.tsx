'use client'

import { Card } from '@/components/ui/card'
import { formatAddress, formatCurrencyBRL } from '@/lib/utils'
import { ShippingConfigType } from '@/models/shipping'
import { AddressType } from '@/models/user'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { parseCookies } from 'nookies'
import { useEffect, useState } from 'react'

type DeliveryProps = {
  customerAddress: AddressType | null
  shipping: ShippingConfigType
}

export function Delivery({ customerAddress, shipping }: DeliveryProps) {
  const [address, setAddress] = useState<AddressType | null>(customerAddress)

  useEffect(() => {
    if (!customerAddress) {
      const guestInfo = parseCookies().guest_data

      if (guestInfo) {
        const parsedGuestInfo = JSON.parse(guestInfo)
        if (parsedGuestInfo.address) {
          setAddress(parsedGuestInfo.address)
        }
      }
    }
  }, [customerAddress])

  return (
    <Card className="flex flex-col gap-2 w-full">
      {!address ? (
        <Link href="addresses/register">
          <div className="flex flex-col gap-2 p-4 w-full hover:bg-secondary/30">
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
          <Link
            href={`?step=payment&pickup=delivery&address=${customerAddress ? address?.id : 'guest'}`}
            className="space-y-2"
          >
            <div className="flex flex-col gap-2 p-4 w-full">
              <header className="flex flex-row items-center justify-between">
                <strong className="text-sm">Entregar</strong>

                <div className="flex flex-row items-center gap-1 text-xs text-muted-foreground">
                  <div className="flex flex-row items-center gap-2">
                    <p>{shipping.delivery_time}min</p>
                    &bull;
                    <p>{formatCurrencyBRL(shipping.price)}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </header>

              <p className="text-muted-foreground line-clamp-3">
                {formatAddress(address)}
              </p>
            </div>
          </Link>

          <Link href={`addresses/register?id=${address.id ?? 'guest'}`}>
            <footer className="border-t p-4 text-sm">
              <strong>Editar endereço</strong>
            </footer>
          </Link>
        </>
      )}
    </Card>
  )
}
