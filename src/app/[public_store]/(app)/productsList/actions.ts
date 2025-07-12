'use server'

import { storeProcedure } from '@/lib/zsa-procedures'
import { CategoryType } from '@/models/category'
import { cache } from 'react'
import { generateRequestId, logCpu } from '../../utils'

export const readProductsByCategory = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const requestId = generateRequestId()

    return await logCpu(`${requestId}::readProductsByCategory`, async () => {
      const { store, supabase } = ctx

      const { data: categories, error } = await logCpu(
        `${requestId}::fetchProductsDB`,
        async () => {
          return await supabase
            .from('categories')
            .select(
              `
            *,
            products (
              *,
              product_images (*)
            )
          `,
            )
            .eq('store_id', store?.id)
        },
      )

      if (error) {
        console.error('Falha ao buscar categorias.', error)
        return { categories: [] }
      }

      return { categories: categories as CategoryType[] }
    })
  })

export const readProductsByCategoryCached = cache(readProductsByCategory)
