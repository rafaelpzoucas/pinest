'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ProductType = {
  id: string
  name: string
  description: string
  created_at: string
}

export async function readProducts(): Promise<{
  data: ProductType[] | null
  error: any | null
}> {
  const supabase = createClient()
  const { data, error } = await supabase.from('products').select('*')

  return { data, error }
}

export async function deleteProduct(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('products').delete().eq('id', id)

  revalidatePath('/catalog')

  return { error }
}
