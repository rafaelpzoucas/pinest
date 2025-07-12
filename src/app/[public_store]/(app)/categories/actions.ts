import { storeProcedure } from '@/lib/zsa-procedures'
import { CategoryType } from '@/models/category'
import { cache } from 'react'

export const readCategories = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    console.time('readCategories')
    const { store, supabase } = ctx

    console.time('fetchCategoriesDB')
    const { data, error } = await supabase
      .from('categories')
      .select(
        `
          *,
          products (*)  
        `,
      )
      .eq('store_id', store?.id)
    console.timeEnd('fetchCategoriesDB')

    if (error || !data) {
      console.error('Não foi possível ler as categorias.', error)
    }

    console.timeEnd('readCategories')
    return { categories: data as CategoryType[] }
  })

export const readCategoriesCached = cache(readCategories)
