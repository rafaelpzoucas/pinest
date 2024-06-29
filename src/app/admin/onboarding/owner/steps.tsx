'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { UserType } from '@/models/user'
import { useEffect, useState } from 'react'
import { NameStep } from './name'
import { PhoneStep } from './phone'

export function OwnerStep({ owner }: { owner: UserType | null }) {
  const [isLoading, setIsLoading] = useState(true)

  const hasName = owner && owner?.name
  const hasPhone = owner && owner?.phone

  useEffect(() => {
    setIsLoading(false)
  }, [owner])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Dados do proprietário</h1>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="ml-auto w-24 h-9" />
        </div>
      ) : (
        <div>
          {!hasName && <NameStep />}
          {hasName && !hasPhone && <PhoneStep />}
        </div>
      )}
    </div>
  )
}
