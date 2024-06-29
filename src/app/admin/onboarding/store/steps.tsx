'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { StoreType } from '@/models/store'
import { useEffect, useState } from 'react'
import { AddressForm } from './address'
import { DescriptionForm } from './description'
import { NameForm } from './name'
import { PhoneForm } from './phone'
import { RoleForm } from './role'

export function StoreStep({ store }: { store: StoreType | null }) {
  const [isLoading, setIsLoading] = useState(true)

  const hasName = store && store?.name
  const hasDescription = store && store?.description
  const hasPhone = store && store?.phone
  const hasRole = store && store?.role
  const hasAddress = store && store.addresses && store.addresses.length > 0

  useEffect(() => {
    setIsLoading(false)
  }, [store])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Informações básicas da loja</h1>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="ml-auto w-24 h-9" />
        </div>
      ) : (
        <div>
          {!hasName && <NameForm />}
          {hasName && !hasDescription && <DescriptionForm />}
          {hasName && hasDescription && !hasPhone && <PhoneForm />}
          {hasName && hasDescription && hasPhone && !hasRole && <RoleForm />}
          {hasName && hasDescription && hasPhone && hasRole && !hasAddress && (
            <AddressForm storeId={store.id} />
          )}
        </div>
      )}
    </div>
  )
}
