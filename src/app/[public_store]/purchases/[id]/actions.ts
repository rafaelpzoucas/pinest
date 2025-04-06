'use server'

import { createClient } from '@/lib/supabase/server'
import { PurchaseType } from '@/models/purchase'
import { z } from 'zod'
import { createServerAction } from 'zsa'

export const readPurchaseById = createServerAction()
  .input(z.object({ purchaseId: z.string() }))
  .handler(async ({ input }) => {
    const supabase = createClient()

    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select(
        `
          *,
          purchase_items (
            *,
            products (
              *,
              product_images (*)
            )
          ),
          purchase_item_variations (
            *,
            product_variations (*)
          ),
          store_customers (
            *,
            customers (*)
          )
        `,
      )
      .eq('id', input.purchaseId)
      .single()

    if (purchaseError) {
      console.error(
        'Não foi possível buscar os dados da compra.',
        purchaseError,
      )
    }

    return { purchase: purchase as PurchaseType }
  })
