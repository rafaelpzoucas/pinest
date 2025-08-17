'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { createServerAction, ZSAError } from 'zsa'
import { getStoreCartSession } from './get-cart-session'
import { CartItem } from './schemas'

export const readCart = createServerAction()
  .input(z.object({ subdomain: z.string() }))
  .handler(async ({ input }) => {
    const supabase = createClient()

    const cartSession = await getStoreCartSession(input.subdomain)

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

    return { cart: cart as CartItem[] }
  })
