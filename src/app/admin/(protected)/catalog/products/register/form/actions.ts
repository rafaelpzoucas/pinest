'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { VariationsFormType } from './form'

export async function updateProductVariations(values: VariationsFormType[]) {
  const supabase = createClient()
  const variations = []
  const variationsError = []

  for (const value of values) {
    const { data, error } = await supabase
      .from('product_variations')
      .update({
        price: value.price,
        stock: value.stock,
      })
      .eq('id', value.id)
      .select()

    if (data) {
      variations.push(data)
    }

    if (error) {
      variationsError.push(error)
    }
  }

  revalidatePath('/catalog')

  return { variations, variationsError }
}
