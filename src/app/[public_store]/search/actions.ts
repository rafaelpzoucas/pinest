'use server'

import { createClient } from '@/lib/supabase/server'

export async function getSearchedProducts(query: string) {
  const supabase = createClient()

  const sanitizedQuery = `%${query.replace(/[^a-zA-Z0-9 ]/g, '')}%`

  const { data: products, error: searchError } = await supabase
    .from('products')
    .select('*')
    .ilike('name', sanitizedQuery)

  console.log('entrou')

  return { products, searchError }
}
