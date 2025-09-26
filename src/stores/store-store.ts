'use client'

import { StoreData } from '@/features/store/initial-data/schemas'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface StoreState {
  storeData: StoreData | null
  selectedCategoryId: string | null
  setStoreData: (data: StoreData | null) => void
  setSelectedCategoryId: (categoryId: string | null) => void
}

export const useStoreStore = create<StoreState>()(
  devtools(
    (set) => ({
      storeData: null,
      selectedCategoryId: null,
      setStoreData: (data) => set({ storeData: data }),
      setSelectedCategoryId: (categoryId) =>
        set({ selectedCategoryId: categoryId }),
    }),
    {
      name: 'store-store',
    },
  ),
)
