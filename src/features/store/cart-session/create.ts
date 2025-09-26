'use server'

import { createClient } from '@/lib/supabase/server'
import { createServerAction, ZSAError } from 'zsa'
import { CreateCartProductSchema } from './schemas'

export const createCartProduct = createServerAction()
  .input(CreateCartProductSchema)
  .handler(async ({ input }) => {
    const supabase = createClient()

    const { newItem } = input

    const { error: insertedCartProductError } = await supabase
      .from('cart_sessions')
      .insert({
        session_id: input.session_id,
        product_id: newItem.product_id,
        quantity: newItem.quantity,
        product_price: newItem.product_price,
        observations: newItem.observations,
        extras: newItem.extras,
      })
      .select()

    if (insertedCartProductError) {
      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        insertedCartProductError.message,
      )
    }
  })
