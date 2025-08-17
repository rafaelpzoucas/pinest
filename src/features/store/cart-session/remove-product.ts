'use server'

import { createClient } from '@/lib/supabase/server'
import { createServerAction } from 'zsa'
import { RemoveCartItemSchema } from './schemas'

export const removeStoreCartProduct = createServerAction()
  .input(RemoveCartItemSchema)
  .handler(async ({ input }) => {
    const supabase = createClient()

    const { error: updatedCartProductError } = await supabase
      .from('cart_sessions')
      .delete()
      .eq('id', input.cartItemId)

    if (updatedCartProductError) {
      console.error(updatedCartProductError)
    }
  })
