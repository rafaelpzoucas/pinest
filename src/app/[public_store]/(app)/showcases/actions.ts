'use server'

import { storeProcedure } from '@/lib/zsa-procedures'
import { ProductType } from '@/models/product'
import { ShowcaseType } from '@/models/showcase'

type ShowcaseProductsType = ShowcaseType & {
  products: ProductType[]
}

export const readShowcases = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { store, supabase } = ctx

    // Buscar showcases ativas da loja
    const { data: showcases, error: showcasesError } = await supabase
      .from('store_showcases')
      .select('*')
      .eq('store_id', store?.id)
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
          .eq('store_id', store?.id)
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
      showcasesWithProducts: showcasesWithProducts as ShowcaseProductsType[],
    }
  })
