'use server'

import { storeProcedure } from '@/lib/zsa-procedures'
import { CategoryType } from '@/models/category'
import { cache } from 'react'

export const readProductsByCategory = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    console.time('readProductsByCategory')
    const { store, supabase } = ctx

    console.time('fetchProductsDB')
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
    console.timeEnd('fetchProductsDB')

    if (error) {
      console.error('Falha ao buscar categorias.', error)
      console.timeEnd('readProductsByCategory')
      return { categories: [] }
    }

    console.timeEnd('readProductsByCategory')
    return { categories: categories as CategoryType[] }
  })

export const readProductsByCategoryCached = cache(readProductsByCategory)
