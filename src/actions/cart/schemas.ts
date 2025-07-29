import { CartProductType } from '@/models/cart'
import { z } from 'zod'

export const readCartInput = z.object({
  subdomain: z.string(),
})

export const addToCartInput = z.object({
  subdomain: z.string(),
  newItem: z.custom<CartProductType>(),
})

export const updateCartProductInput = z.object({
  newItem: z.custom<CartProductType>(),
  cartSession: z.string(),
})
