'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { StoreType } from '@/models/store'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AddressForm } from './address'
import { StoreForm } from './form'

export function StoreStep({ store }: { store: StoreType | null }) {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)

  const searchParams = useSearchParams()

  const info = searchParams.get('info')

  useEffect(() => {
    if (store && store?.addresses.length > 0) {
      router.push('/admin/dashboard')
    }

    setIsLoading(false)
  }, [store, router])

  return (
    <div className="flex flex-col gap-4 pb-16">
      <h1 className="text-3xl font-bold">Informações básicas da loja</h1>

      {isLoading ? (
        <div className="flex flex-col w-full space-y-6">
          <div className="flex flex-col gap-3">
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-full h-9" />
            <Skeleton className="w-full h-4" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-full h-9" />
            <Skeleton className="w-full h-4" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-full h-9" />
            <Skeleton className="w-full h-4" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-full h-9" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="ml-auto w-24 h-9" />
          </div>
        </div>
      ) : (
        <div>
          {info !== 'address' && <StoreForm store={store} />}
          {store && info === 'address' && <AddressForm storeId={store?.id} />}
        </div>
      )}
    </div>
  )
}
