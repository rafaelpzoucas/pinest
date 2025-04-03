'use client'

import { buttonVariants } from '@/components/ui/button'
import { cn, createPath } from '@/lib/utils'
import { StoreType } from '@/models/store'
import { AddressType } from '@/models/user'
import { MapPin } from 'lucide-react'
import Link from 'next/link'
import { parseCookies } from 'nookies'
import { useEffect, useState } from 'react'

export function Delivery({
  customerAddress,
  store,
}: {
  customerAddress: AddressType | null
  store?: StoreType
}) {
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
    <section className="flex flex-col items-center gap-2 text-center border-b py-6">
      <MapPin />
      {address ? (
        <>
          <p>
            {address?.street}, {address?.number}
          </p>
          <span className="text-xs text-muted-foreground">
            CEP {address?.zip_code} - {address?.neighborhood} - {address?.city}/
            {address?.state}
          </span>
        </>
      ) : (
        <p>Nenhum endereço cadastrado</p>
      )}

      <Link
        href={createPath('/checkout?step=pickup', store?.store_subdomain)}
        className={cn(buttonVariants({ variant: 'link' }))}
      >
        Editar ou escolher outro
      </Link>
    </section>
  )
}
