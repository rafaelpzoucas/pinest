'use client'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AddressType } from '@/models/user'
import { MapPin } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { parseCookies } from 'nookies'
import { useEffect, useState } from 'react'

export function Delivery({
  customerAddress,
}: {
  customerAddress: AddressType | null
}) {
  const params = useParams()

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
        href={`/${params.public_store}/checkout?step=pickup`}
        className={cn(buttonVariants({ variant: 'link' }))}
      >
        Editar ou escolher outro
      </Link>
    </section>
  )
}
