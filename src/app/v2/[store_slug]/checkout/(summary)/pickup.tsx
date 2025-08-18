'use client'

import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useReadStoreAddress } from '@/features/store/addresses/hooks'
import { useReadStoreCustomer } from '@/features/store/customers/hooks'
import { cn, formatAddress } from '@/lib/utils'
import { createPath } from '@/utils/createPath'
import { formatStoreAddress } from '@/utils/format-address'
import { MapPin } from 'lucide-react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'

export function Pickup() {
  const params = useParams()
  const searchParams = useSearchParams()
  const storeSlug = params.store_slug as string

  const { data: customerData, isPending: isCustomerPending } =
    useReadStoreCustomer({ subdomain: storeSlug })
  const { data: storeAddressData, isPending: isStoreAddressPending } =
    useReadStoreAddress({
      subdomain: storeSlug,
    })

  const customerAddress = customerData?.customer?.address
  const storeAddress = storeAddressData?.storeAddress

  const pickup = searchParams.get('pickup') as 'DELIVERY' | 'TAKEOUT'

  const formattedAddress = storeAddress && formatStoreAddress(storeAddress)

  const isLoading = isCustomerPending || isStoreAddressPending

  if (isLoading) {
    return (
      <section className="flex flex-col items-center gap-2 text-center border-b p-6">
        <Skeleton className="w-6 h-6" />

        <Skeleton className="w-full h-4" />

        <Skeleton className="w-full h-3" />
        <Skeleton className="w-36 h-3" />

        <div className="py-3">
          <Skeleton className="w-52 h-4" />
        </div>
      </section>
    )
  }

  return (
    <div>
      {pickup === 'DELIVERY' && (
        <section className="flex flex-col items-center gap-2 text-center border-b p-6">
          <MapPin />
          <p className="text-lg">Entregar no endereço</p>

          {customerAddress ? (
            <>
              <p className="text-muted-foreground">
                {formatAddress(customerAddress)}
              </p>
            </>
          ) : (
            <p>Nenhum endereço cadastrado</p>
          )}

          <Link
            href={createPath('/checkout?step=pickup', storeSlug)}
            className={cn(buttonVariants({ variant: 'link' }))}
          >
            Editar ou escolher outro
          </Link>
        </section>
      )}

      {pickup === 'TAKEOUT' && (
        <section className="flex flex-col items-center gap-2 text-center border-b p-6">
          <MapPin />
          <p>Retirar na loja</p>

          <p>
            {storeAddress?.street}, {storeAddress?.number}
          </p>

          <span className="text-xs text-muted-foreground">
            CEP {storeAddress?.zip_code} - {storeAddress?.neighborhood} -{' '}
            {storeAddress?.city}/{storeAddress?.state}
          </span>

          {formattedAddress && (
            <Link
              href={`https://www.google.com/maps?q=${formattedAddress.replaceAll(' ', '+')}`}
              className={cn(buttonVariants({ variant: 'link' }))}
            >
              Ver localização
            </Link>
          )}
        </section>
      )}
    </div>
  )
}
