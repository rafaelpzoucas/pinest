'use server'

import { createClient } from '@/lib/supabase/server'
import { createServerAction } from 'zsa'
import { getCartSession } from './get-cart-session'
import { addToCartInput } from './schemas'

export const addToCart = createServerAction()
  .input(addToCartInput)
  .handler(async ({ input }) => {
    const supabase = createClient()

    const { newItem, subdomain } = input
    const cartSession = await getCartSession(subdomain)

    const { error: insertedCartProductError } = await supabase
      .from('cart_sessions')
      .insert({
        session_id: cartSession,
        product_id: newItem.product_id,
        quantity: newItem.quantity,
        product_variations: newItem.product_variations,
        product_price: newItem.product_price,
        observations: newItem.observations,
        extras: newItem.extras,
      })
      .select()

    if (insertedCartProductError) {
      console.error(insertedCartProductError)
    }

    return { ok: true }
  })
