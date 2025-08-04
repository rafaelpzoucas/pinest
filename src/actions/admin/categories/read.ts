'use server'

import { createClient } from '@/lib/supabase/server'
import { ProductType } from '@/models/product'
import { createServerAction, ZSAError } from 'zsa'
import { readStoreCategoriesSchema } from './schemas'

export const readAdminCategoriesServer = createServerAction()
  .input(readStoreCategoriesSchema)
  .handler(async ({ input }) => {
    const supabase = createClient()

    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('store_id', input.storeId)

    if (categoriesError) {
      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        categoriesError.message ?? 'Error fetching categories.',
      )
    }

    return { categories: categories as ProductType[] }
  })
