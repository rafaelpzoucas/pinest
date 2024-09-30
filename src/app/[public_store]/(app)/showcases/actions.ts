'use server'

import { createClient } from '@/lib/supabase/server'
import { ProductType } from '@/models/product'
import { ShowcaseType } from '@/models/showcase'
import { getStoreByStoreURL } from '../../actions'

type ShowcaseProductsType = ShowcaseType & {
  products: ProductType[]
}

export async function readShowcases(
  storeURL: string,
): Promise<ShowcaseProductsType[]> {
  const supabase = createClient()

  // Obter a loja pelo storeURL
  const { store, storeError } = await getStoreByStoreURL(storeURL)

  if (storeError) {
    console.error(storeError)
    return [] // Retorna um array vazio em caso de erro
  }

  // Buscar showcases ativas da loja
  const { data: showcases, error: showcasesError } = await supabase
    .from('store_showcases')
    .select('*')
    .eq('store_id', store?.id)
    .eq('status', true)
    .order('position', { ascending: true })

  if (showcasesError) {
    console.error(showcasesError)
    return [] // Retorna um array vazio em caso de erro
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
        .eq('store_id', store?.id)
        .range(0, 9) // Pega até 10 produtos
        .order(showcase.order_by, { ascending: false })

      if (productsError) {
        console.error(productsError)
        return { ...showcase, products: [] } // Retorna showcase com produtos vazios se ocorrer erro
      }

      // Retorna o showcase com a lista de produtos associados
      return { ...showcase, products }
    }),
  )

  // Retorna o array de showcases com seus produtos
  return showcasesWithProducts
}
