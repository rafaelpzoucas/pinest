'use server'

import { createClient } from '@/lib/supabase/server'
import { generateSlug } from '@/lib/utils'
import { adminProcedure } from '@/lib/zsa-procedures'
import { ProductType } from '@/models/product'
import { revalidatePath } from 'next/cache'
import { updateProductStatusSchema } from './schemas'

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

export async function duplicateProduct(id: string) {
  const supabase = createClient()

  // Buscar o produto original
  const { data, error: fetchError } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !data) {
    console.error('Erro ao buscar o produto original:', fetchError)
    return
  }

  // Função para gerar nome único
  async function generateUniqueName(baseName: string) {
    let newName = `${baseName} (cópia)`
    let count = 1

    while (true) {
      const { count: existingCount } = await supabase
        .from('products')
        .select('id', { count: 'exact' })
        .eq('name', newName)

      if (!existingCount) break // Nome único encontrado

      newName = `${baseName} (cópia ${count})`
      count++
    }

    return newName
  }

  // Função para gerar URL única
  async function generateUniqueUrl(baseUrl: string) {
    let newUrl = `${baseUrl}-copia`
    let count = 1

    while (true) {
      const { count: existingCount } = await supabase
        .from('products')
        .select('id', { count: 'exact' })
        .eq('product_url', newUrl)

      if (!existingCount) break // URL única encontrada

      newUrl = `${baseUrl}-copia-${count}`
      count++
    }

    return newUrl
  }

  // Criar um nome e URL únicos
  const newName = await generateUniqueName(data.name.trim())
  const newUrl = await generateUniqueUrl(generateSlug(newName))

  // Criar novo produto duplicado
  const newProduct = {
    name: newName,
    category_id: data.category_id,
    description: data.description,
    price: data.price,
    promotional_price: data.promotional_price,
    store_id: data.store_id,
    product_url: newUrl,
    stock: data.stock,
    allows_extras: data.allows_extras,
  }

  const { data: duplicatedProduct, error: insertError } = await supabase
    .from('products')
    .insert(newProduct)
    .select()
    .single()

  if (insertError) {
    console.error('Erro ao duplicar o produto:', insertError)
    return
  }

  // Revalidar cache do catálogo
  revalidatePath('/catalog')

  return { duplicatedProduct }
}

export async function deleteProduct(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('products').delete().eq('id', id)

  revalidatePath('/catalog')

  return { error }
}

export const updateProductStatus = adminProcedure
  .createServerAction()
  .input(updateProductStatusSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    const { error } = await supabase
      .from('products')
      .update({ status: input.status ? 'active' : 'inactive' })
      .eq('id', input.product_id)

    if (error) {
      console.error('Erro ao atualizar o status do produto.', error)
    }

    revalidatePath('/admin/catalog')
  })
