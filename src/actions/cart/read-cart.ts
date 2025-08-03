'use server'

import { createClient } from '@/lib/supabase/server'
import { CartProductType } from '@/models/cart'
import { createServerAction, ZSAError } from 'zsa'
import { getCartSession } from './get-cart-session'
import { readCartInput } from './schemas'

export const readCart = createServerAction()
  .input(readCartInput)
  .handler(async ({ input }) => {
    const supabase = createClient()

    const cartSession = await getCartSession(input.subdomain)

    if (!cartSession?.value) {
      throw new ZSAError(
        'NOT_FOUND',
        'Sessão de carrinho não encontrada ou não pôde ser criada.',
      )
    }

    const { data: cart, error: cartError } = await supabase
      .from('cart_sessions')
      .select(
        `
          *,
          products (
          *,
          product_images (*)
          )
        `,
      )
      .eq('session_id', cartSession?.value)

    if (cartError) {
      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        cartError.message ?? 'Erro ao buscar o carrinho.',
      )
    }

    return { cart: cart as CartProductType[] }
  })
