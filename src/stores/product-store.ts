import { Product } from '@/features/store/products/schemas'
import { create } from 'zustand'

type UseProductType = {
  product: Product | null
  setProduct: (product: Product) => void
}

export const useProduct = create<UseProductType>((set) => ({
  product: null,

  setProduct: (product) => set(() => ({ product })),
}))
