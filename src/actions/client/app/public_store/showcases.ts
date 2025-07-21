import { createClient } from '@/lib/supabase/client'
import { ShowcaseType } from '@/models/showcase'

export async function readShowcasesData(storeId?: string) {
  const supabase = createClient()

  const { data: showcases, error: showcasesError } = await supabase
    .from('store_showcases')
    .select('*')
    .eq('store_id', storeId)
    .eq('status', true)
    .order('position', { ascending: true })

  if (showcasesError) {
    throw new Error('Erro ao buscar vitrines (showcases)', showcasesError)
  }

  const showcasesWithProducts = await Promise.all(
    (showcases as ShowcaseType[]).map(async (showcase) => {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(
          `
            *,
            product_images (*)
          `,
        )
        .eq('store_id', storeId)
        .range(0, 9) // Pega até 10 produtos
        .order(showcase.order_by, { ascending: false })

      if (productsError) {
        console.error(productsError)
        return null
      }

      return { ...showcase, products }
    }),
  )

  // Retorna o array de showcases com seus produtos
  return {
    showcases: showcasesWithProducts as ShowcaseType[],
  }
}
