'use server'

import { storeProcedure } from '@/lib/zsa-procedures'
import { CategoryType } from '@/models/category'

export const readProductsByCategory = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { store, supabase } = ctx

    const { data: categories, error } = await supabase
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

    if (error) {
      console.error('Falha ao buscar categorias.', error)
      return { categories: [] }
    }

    return { categories: categories as CategoryType[] }
  })
