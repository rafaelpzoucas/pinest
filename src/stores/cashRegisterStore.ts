import { create } from 'zustand'

type UseCashRegisterType = {
  isCashOpen: boolean
  setIsCashOpen: (value: boolean) => void
}

export const useCashRegister = create<UseCashRegisterType>((set) => ({
  isCashOpen: false,

  setIsCashOpen: (value) => set(() => ({ isCashOpen: value })),
}))
