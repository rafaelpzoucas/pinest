import { CartItem } from '@/features/store/cart-session/schemas'
import { SelectedExtra } from '@/features/store/extras/schemas'
import { create } from 'zustand'

type UseCartItemType = {
  cart: CartItem[]
  currentCartItem: CartItem

  deliveryPrice: number
  setDeliveryPrice: (price: number) => void

  // Ações para o cart completo
  setCart: (items: CartItem[]) => void
  clearCart: () => void

  // Ações para o currentCartItem
  setCurrentCartItem: (item: Partial<CartItem> | null) => void
  setQuantity: (qty: number, max: number | null) => void
  increaseQuantity: (max: number | null) => void
  decreaseQuantity: () => void
  setExtras: (extras: SelectedExtra[]) => void
  updateExtraQuantity: (extraId: string, quantity: number) => void
  setObservations: (obs: string) => void
  resetCurrentCartItem: () => void

  // Getters computados para o cart
  totalItems: number
  totalPrice: number
  hasItems: boolean
  getItemTotal: (item: CartItem) => number
}

const initialCartItem: CartItem = {
  id: undefined,
  product_id: '',
  session_id: undefined,
  products: {} as any,
  quantity: 1,
  product_price: 0,
  observations: [],
  extras: [],
}

export const useCart = create<UseCartItemType>((set, get) => ({
  cart: [],
  currentCartItem: initialCartItem,

  deliveryPrice: 0,
  setDeliveryPrice: (price) => set(() => ({ deliveryPrice: price })),

  // Atualizar o cart completo
  setCart: (items) =>
    set(() => ({
      cart: items,
    })),

  clearCart: () => set(() => ({ cart: [] })),

  // Ações para o currentCartItem
  setCurrentCartItem: (item) =>
    set((state) => ({
      currentCartItem: { ...state.currentCartItem, ...item },
    })),

  setQuantity: (qty, max) =>
    set((state) => ({
      currentCartItem: {
        ...state.currentCartItem,
        quantity: max ? Math.min(qty, max) : qty,
      },
    })),

  increaseQuantity: (max) =>
    set((state) => ({
      currentCartItem: {
        ...state.currentCartItem,
        quantity: max
          ? Math.min(state.currentCartItem.quantity + 1, max)
          : state.currentCartItem.quantity + 1,
      },
    })),

  decreaseQuantity: () =>
    set((state) => ({
      currentCartItem: {
        ...state.currentCartItem,
        quantity: Math.max(state.currentCartItem.quantity - 1, 1),
      },
    })),

  setExtras: (extras) =>
    set((state) => ({
      currentCartItem: { ...state.currentCartItem, extras },
    })),

  updateExtraQuantity: (extraId, quantity) =>
    set((state) => ({
      currentCartItem: {
        ...state.currentCartItem,
        extras: state.currentCartItem.extras.map((extra) =>
          extra.extra_id === extraId ? { ...extra, quantity } : extra,
        ),
      },
    })),

  setObservations: (obs) =>
    set((state) => ({
      currentCartItem: {
        ...state.currentCartItem,
        observations: obs ? [obs] : [],
      },
    })),

  resetCurrentCartItem: () =>
    set((state) => ({
      currentCartItem: {
        ...initialCartItem,
        extras: state.currentCartItem.extras.map((extra) => ({
          ...extra,
          quantity: 0,
        })),
      },
    })),

  // Getters computados
  get totalItems() {
    return get().cart.reduce((total, item) => total + item.quantity, 0)
  },

  get totalPrice() {
    return get().cart.reduce((total, item) => {
      return total + get().getItemTotal(item)
    }, 0)
  },

  get hasItems() {
    return get().cart.length > 0
  },

  // Calcular total de um item específico (produto + extras)
  getItemTotal: (item) => {
    // Preço do produto
    const itemTotal = item.product_price

    // Somar preços dos extras
    const extrasTotal =
      item.extras?.reduce((total, extra) => {
        return total + extra.price * extra.quantity
      }, 0) || 0

    return (itemTotal + extrasTotal) * item.quantity
  },
}))
