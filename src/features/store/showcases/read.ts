'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { createServerAction } from 'zsa'
import { StoreShowcase } from '../initial-data/schemas'

export const readStoreShowcases = createServerAction()
  .input(z.object({ storeId: z.string() }))
  .handler(async ({ input }) => {
    const supabase = createClient()

    // Buscar showcases ativas da loja
    const { data: showcases, error: showcasesError } = await supabase
      .from('store_showcases')
      .select('*')
      .eq('store_id', input.storeId)
      .eq('status', true)
      .order('position', { ascending: true })

    if (showcasesError) {
      console.error(showcasesError)
      return null
    }

    // Verifica se há showcases e mapeia cada uma com seus respectivos produtos
    const showcasesWithProducts = await Promise.all(
      showcases.map(async (showcase) => {
        // Busca os produtos relacionados a cada showcase
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select(
            `
          *,
          product_images (*)
        `,
          )
          .eq('store_id', input.storeId)
          .range(0, 9) // Pega até 10 produtos
          .order(showcase.order_by, { ascending: false })

        if (productsError) {
          console.error(productsError)
          return null
        }

        // Retorna o showcase com a lista de produtos associados
        return { ...showcase, products }
      }),
    )

    // Retorna o array de showcases com seus produtos
    return {
      showcasesWithProducts: showcasesWithProducts as StoreShowcase[],
    }
  })
