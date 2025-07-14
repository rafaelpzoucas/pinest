'use server'

import { storeProcedure } from '@/lib/zsa-procedures'
import { CartProductType } from '@/models/cart'
import { CategoryType } from '@/models/category'
import { ShowcaseType } from '@/models/showcase'
import { getCartSession } from '../cart/actions'

async function readCartData(subdomain: string, supabase: any) {
  const cartSession = await getCartSession(subdomain)

  const { data: cart, error: cartError } = await supabase
    .from('cart_sessions')
    .select(
      `
        *,
        products (
          *,
          product_images (*)
        )
      `,
    )
    .eq('session_id', cartSession?.value)

  if (cartError) {
    throw new Error('Erro ao buscar dados no carrinho', cartError)
  }

  return { cart: cart as CartProductType[] }
}

async function readCategoriesData(supabase: any, storeId: string) {
  const { data, error } = await supabase
    .from('categories')
    .select(
      `
        *,
        products (
          *,
          product_images (*)
        ) 
      `,
    )
    .eq('store_id', storeId)

  if (error || !data) {
    throw new Error('Não foi possível ler as categorias.', error)
  }

  return { categories: data as CategoryType[] }
}

async function readShowcasesData(supabase: any, storeId: string) {
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

export const readPublicStoreData = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store } = ctx

    const [{ cart }, { categories }, { showcases }] = await Promise.all([
      readCartData(store.store_subdomain, supabase),
      readCategoriesData(supabase, store.id),
      readShowcasesData(supabase, store.id),
    ])

    return { store, cart, categories, showcases }
  })
