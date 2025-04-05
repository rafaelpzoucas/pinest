'use client'

import { buttonVariants } from '@/components/ui/button'
import { cn, createPath, formatAddress } from '@/lib/utils'
import { AddressType } from '@/models/address'
import { StoreType } from '@/models/store'
import { MapPin } from 'lucide-react'
import Link from 'next/link'
import { parseCookies } from 'nookies'
import { useEffect, useState } from 'react'

export function Delivery({
  customerAddress,
  store,
}: {
  customerAddress?: AddressType
  store?: StoreType
}) {
  const [address, setAddress] = useState<AddressType | undefined>(
    customerAddress,
  )

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
          <p>{formatAddress(address)}</p>
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
