'use server'

import { createClient } from '@/lib/supabase/server'
import { createServerAction } from 'zsa'
import { UpdateCartItemSchema } from './schemas'

export const updateStoreCartProduct = createServerAction()
  .input(UpdateCartItemSchema)
  .handler(async ({ input }) => {
    const supabase = createClient()

    const { error: updatedCartProductError } = await supabase
      .from('cart_sessions')
      .update(input)
      .eq('id', input.id)
      .select()

    if (updatedCartProductError) {
      console.error(updatedCartProductError)
    }
  })
