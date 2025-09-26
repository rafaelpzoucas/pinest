import { storeProcedure } from '@/lib/zsa-procedures'
import { CategoryType } from '@/models/category'
import { cache } from 'react'

export const readCategories = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { store, supabase } = ctx

    const { data, error } = await supabase
      .from('categories')
      .select(
        `
          *,
          products (*)  
        `,
      )
      .eq('store_id', store?.id)

    if (error || !data) {
      console.error('Não foi possível ler as categorias.', error)
    }

    return { categories: data as CategoryType[] }
  })

export const readCategoriesCached = cache(readCategories)
