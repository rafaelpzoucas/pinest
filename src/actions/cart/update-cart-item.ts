'use server'

import { createClient } from '@/lib/supabase/server'
import { createServerAction } from 'zsa'
import { updateCartProductInput } from './schemas'

export const updateCartProduct = createServerAction()
  .input(updateCartProductInput)
  .handler(async ({ input }) => {
    const supabase = createClient()
    const { newItem, cartSession } = input
    const { error: updatedCartProductError } = await supabase
      .from('cart_sessions')
      .update({
        product_variations: newItem.product_variations,
        product_price: newItem.product_price,
        quantity: newItem.quantity,
        observations: newItem.observations,
        extras: newItem.extras,
      })
      .eq('session_id', cartSession)
      .eq('id', newItem.id)
      .select()

    if (updatedCartProductError) {
      console.error(updatedCartProductError)
    }
  })
