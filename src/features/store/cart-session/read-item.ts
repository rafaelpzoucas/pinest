'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { createServerAction, ZSAError } from 'zsa'
import { CartItem } from './schemas'

export const readCartItem = createServerAction()
  .input(z.object({ cartItemId: z.string().uuid() }))
  .handler(async ({ input }) => {
    const supabase = createClient()

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
      .eq('id', input.cartItemId)
      .single()

    if (cartError) {
      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        cartError.message ?? 'Erro ao buscar o item do carrinho.',
      )
    }

    return { cartItem: cart as CartItem }
  })
