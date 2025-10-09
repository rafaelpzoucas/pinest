import { create } from "zustand";
import type { Product } from "@/features/store/products/schemas";

type UseProductType = {
  product: Product | null;
  setProduct: (product: Product) => void;
  clearProduct: () => void;
};

export const useProduct = create<UseProductType>((set) => ({
  product: null,

  setProduct: (product) => set(() => ({ product })),

  clearProduct: () => set(() => ({ product: null })),
}));
