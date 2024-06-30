'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { UserType } from '@/models/user'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { OwnerForm } from './form'

export function OwnerStep({ owner }: { owner: UserType | null }) {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (owner) {
      setIsLoading(true)
      router.push('?step=2')
    }

    setIsLoading(false)
  }, [owner, router])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Dados do proprietário</h1>

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
            <Skeleton className="ml-auto w-24 h-9" />
          </div>
        </div>
      ) : (
        <div>
          <OwnerForm />
        </div>
      )}
    </div>
  )
}
