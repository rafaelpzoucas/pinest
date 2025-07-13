'use server'

import { storeProcedure } from '@/lib/zsa-procedures'
import { ProductType } from '@/models/product'
import { ShowcaseType } from '@/models/showcase'
import { cache } from 'react'

type ShowcaseProductsType = ShowcaseType & {
  products: ProductType[]
}

export const readShowcases = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    console.time('readShowcases')
    const { store, supabase } = ctx

    // Buscar showcases ativas da loja
    console.time('fetchShowcasesDB')
    const { data: showcases, error: showcasesError } = await supabase
      .from('store_showcases')
      .select('*')
      .eq('store_id', store?.id)
      .eq('status', true)
      .order('position', { ascending: true })
    console.timeEnd('fetchShowcasesDB')

    if (showcasesError) {
      console.error(showcasesError)
      console.timeEnd('readShowcases')
      return null
    }

    // Verifica se há showcases e mapeia cada uma com seus respectivos produtos
    console.time('fetchShowcaseProducts')
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
    console.timeEnd('fetchShowcaseProducts')

    // Retorna o array de showcases com seus produtos
    console.timeEnd('readShowcases')
    return {
      showcasesWithProducts: showcasesWithProducts as ShowcaseProductsType[],
    }
  })

export const readShowcasesCached = cache(readShowcases)
