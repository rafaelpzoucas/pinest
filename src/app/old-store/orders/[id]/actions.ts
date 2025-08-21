'use server'

import { createClient } from '@/lib/supabase/server'
import { OrderType } from '@/models/order'
import { z } from 'zod'
import { createServerAction } from 'zsa'

export const readOrderById = createServerAction()
  .input(z.object({ orderId: z.string() }))
  .handler(async ({ input }) => {
    const supabase = createClient()

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(
        `
          *,
          order_items (
            *,
            products (
              *,
              product_images (*)
            ),
            order_item_variations (
              *,
              product_variations (*)
            )
          ),
          store_customers (
            *,
            customers (*)
          )
        `,
      )
      .eq('id', input.orderId)
      .single()

    if (orderError) {
      console.error('Não foi possível buscar os dados da compra.', orderError)
    }

    return { order: order as OrderType }
  })
