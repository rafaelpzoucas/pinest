'use server'

import { createClient } from '@/lib/supabase/server'
import { ProductType } from '@/models/product'
import { revalidatePath } from 'next/cache'

export async function readProductsByStore(storeId?: string): Promise<{
  data: ProductType[] | null
  error: any | null
}> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      product_images (*)
    `,
    )
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function deleteProduct(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('products').delete().eq('id', id)

  revalidatePath('/catalog')

  return { error }
}
