import { create } from 'zustand'

type UseProductType = {
  productPrice: number
  setProductPrice: (price: number) => void
  amount: number
  increase: (max: number) => void
  decrease: () => void
}

export const useProduct = create<UseProductType>((set) => ({
  productPrice: 0,
  amount: 1,

  setProductPrice: (price) => set(() => ({ productPrice: price })),

  increase: (max) =>
    set((state) => ({
      amount: Math.min(state.amount + 1, max),
    })),

  decrease: () =>
    set((state) => ({
      amount: Math.max(state.amount - 1, 1),
    })),
}))
