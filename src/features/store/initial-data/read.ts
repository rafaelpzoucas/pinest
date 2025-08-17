'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { createServerAction, ZSAError } from 'zsa'
import { Category, StoreData } from './schemas'

export const getStoreInitialData = createServerAction()
  .input(
    z.object({
      subdomain: z.string().min(1),
    }),
  )
  .handler(async ({ input }) => {
    const supabase = createClient()

    const { data: storeInitialData, error: initialDataError } = await supabase
      .from('stores')
      .select(
        `
          *,
          store_hours (*),
          shippings (*),
          categories (*)!inner(status=eq.active),
        `,
      )
      .eq('store_subdomain', input.subdomain)
      .single<StoreData>()

    if (initialDataError) {
      throw new ZSAError('INTERNAL_SERVER_ERROR', initialDataError.message)
    }

    const { categories, ...store } = storeInitialData

    return {
      store,
      categories: categories ?? [],
    }
  })

export const readCategoryWithProducts = createServerAction()
  .input(
    z.object({
      categoryId: z.string().min(1),
    }),
  )
  .handler(async ({ input }) => {
    const supabase = createClient()

    const { data: category, error } = await supabase
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
      .eq('id', input.categoryId)
      .single()

    if (error) {
      console.error('Falha ao buscar categoria.', error)
      throw new ZSAError('INTERNAL_SERVER_ERROR', error.message)
    }

    return { category: category as Category }
  })
