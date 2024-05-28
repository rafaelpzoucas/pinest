import { createClient } from '@/lib/supabase/server'

export async function readProductById(productId: string) {
  const supabase = createClient()
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)

  const product = products && products.length > 0 && products[0]

  return { product, error }
}
