import { create } from 'zustand'

type UseProductType = {
  productPrice: number
  setProductPrice: (price: number) => void
  amount: number
  setAmount: (newAmount: number) => void

  increase: (max: number) => void
  decrease: () => void
}

export const useProduct = create<UseProductType>((set) => ({
  productPrice: 0,
  amount: 1,

  setProductPrice: (price) => set(() => ({ productPrice: price })),
  setAmount: (newAmount) => set(() => ({ amount: newAmount })),

  increase: (max) =>
    set((state) => ({
      amount: max ? Math.min(state.amount + 1, max) : state.amount + 1,
    })),

  decrease: () =>
    set((state) => ({
      amount: Math.max(state.amount - 1, 1),
    })),
}))
