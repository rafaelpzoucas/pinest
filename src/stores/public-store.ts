// lib/stores/public-store.ts
'use client'

import { CartProductType } from '@/models/cart'
import { CategoryType } from '@/models/category'
import { ShowcaseType } from '@/models/showcase'
import { StoreType } from '@/models/store'
import { create } from 'zustand'

type PublicStoreState = {
  store: StoreType | null
  cart: CartProductType[]
  categories: CategoryType[]
  showcases: ShowcaseType[]

  // Actions
  setStoreData: (data: Partial<PublicStoreState>) => void
  updateCart: (cart: CartProductType[]) => void
  clearStore: () => void
}

export const usePublicStore = create<PublicStoreState>((set) => ({
  store: null,
  cart: [],
  categories: [],
  showcases: [],

  setStoreData: (data) => set((state) => ({ ...state, ...data })),
  updateCart: (cart) => set({ cart }),
  clearStore: () =>
    set({
      store: null,
      cart: [],
      categories: [],
      showcases: [],
    }),
}))
