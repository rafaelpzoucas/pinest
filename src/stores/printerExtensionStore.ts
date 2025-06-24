import { create } from 'zustand'

type PrinterExtensionState = {
  isActive: boolean
  setIsActive: (state: boolean) => void
}

export const usePrinterExtensionStore = create<PrinterExtensionState>(
  (set) => ({
    isActive: false,
    setIsActive: (state) => set({ isActive: state }),
  }),
)
