// ✅ Melhor abordagem - props opcionais + verificação interna
'use client'

import { StoreType } from '@/models/store'
import { usePublicStore } from '@/stores/public-store'
import { useEffect } from 'react'

type StoreHydratorProps = {
  publicStoreData?: {
    store: StoreType
  } | null
}

export function StoreHydrator({ publicStoreData }: StoreHydratorProps) {
  const setStoreData = usePublicStore((state) => state.setStoreData)

  useEffect(() => {
    if (publicStoreData) {
      setStoreData(publicStoreData)
    }
  }, [publicStoreData, setStoreData])

  return null
}
