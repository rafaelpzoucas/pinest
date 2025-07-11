// stores/useCartStore.ts
import { CartProductType } from '@/models/cart'
import { create } from 'zustand'

type CartStore = {
  cart: CartProductType[]
  setCart: (cart: CartProductType[]) => void
}

export const useCartStore = create<CartStore>((set) => ({
  cart: [],
  setCart: (cart) => set({ cart }),
}))
