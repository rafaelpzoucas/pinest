// app/actions/addToCart.js
'use server'

import { createClient } from '@/lib/supabase/server'
import { getRootPath } from '@/lib/utils'
import { storeProcedure } from '@/lib/zsa-procedures'
import { CartProductType } from '@/models/cart'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

async function createCartSession(storeUrl: string) {
  const cookieStore = cookies()
  const uuid = uuidv4()

  try {
    cookieStore.set(`${storeUrl}_cart_session`, uuid)
    return cookieStore.get(`${storeUrl}_cart_session`)
  } catch (error) {
    console.error('Error setting cookie:', error)
  }
}

export async function getCartSession(storeSubdomain: string) {
  const cookieStore = cookies()

  const session = cookieStore.get(`${storeSubdomain}_cart_session`)

  if (!session) {
    const createdSession = await createCartSession(storeSubdomain)

    if (createdSession) {
      return createdSession
    }
  }

  return session
}

export const readCartProduct = storeProcedure
  .createServerAction()
  .input(z.object({ cartSessionId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { store, supabase } = ctx

    const cartSession = await getCartSession(store.store_subdomain)

    const { data: cartProduct, error: cartProductError } = await supabase
      .from('cart_sessions')
      .select('*')
      .eq('session_id', cartSession?.value)
      .eq('id', input.cartSessionId)
      .single()

    if (cartProductError) {
      console.error(cartProductError)
    }

    return { cartProduct: cartProduct as CartProductType }
  })

export const readCartProductCached = cache(readCartProduct)

async function insertCartProduct(
  newItem: CartProductType,
  cartSession?: string,
) {
  const supabase = createClient()

  const { error: insertedCartProductError } = await supabase
    .from('cart_sessions')
    .insert({
      session_id: cartSession,
      product_id: newItem.product_id,
      quantity: newItem.quantity,
      product_variations: newItem.product_variations,
      product_price: newItem.product_price,
      observations: newItem.observations,
      extras: newItem.extras,
    })
    .select()

  if (insertedCartProductError) {
    console.error(insertedCartProductError)
  }
}

async function updateCartProduct(
  newItem: CartProductType,
  cartProduct: CartProductType,
  cartSession?: string,
) {
  const supabase = createClient()

  const { error: updatedCartProductError } = await supabase
    .from('cart_sessions')
    .update({
      product_variations: newItem.product_variations,
      product_price: newItem.product_price,
      quantity: newItem?.id
        ? newItem.quantity
        : cartProduct?.quantity + newItem.quantity,
      observations: newItem.observations,
      extras: newItem.extras,
    })
    .eq('session_id', cartSession)
    .eq('id', newItem.id)
    .select()

  if (updatedCartProductError) {
    console.error(updatedCartProductError)
  }

  revalidatePath('/')
}

export const readCart = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { store, supabase } = ctx

    const cartSession = await getCartSession(store.store_subdomain)

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
      console.error('Erro ao buscar dados do carrinho.', cartError)
    }

    return { cart: cart as CartProductType[] }
  })

export const readCartCached = cache(readCart)

// export async function getCart(storeUrl: string): Promise<{
//   cart: CartProductType[] | null
//   cartError: any | null
// }> {
//   const supabase = createClient()
//   const cartSession = await getCartSession(storeUrl)

//   const { data: cart, error: cartError } = await supabase
//     .from('cart_sessions')
//     .select(
//       `
//         *,
//         products (
//          *,
//          product_images (*)
//         )
//       `,
//     )
//     .eq('session_id', cartSession?.value)

//   if (cartError) {
//     console.error(cartError)
//   }

//   return { cart, cartError }
// }

export const addToCart = storeProcedure
  .createServerAction()
  .input(z.object({ newItem: z.custom<CartProductType>() }))
  .handler(async ({ ctx, input }) => {
    const { store } = ctx
    const { newItem } = input

    const cartSession = await getCartSession(store.store_subdomain)

    const rootPath = getRootPath(store.store_subdomain)

    const redirectURL = rootPath ? `/${rootPath}/cart` : '/cart'

    if (!newItem?.id) {
      await insertCartProduct(newItem, cartSession?.value)

      return revalidatePath(redirectURL)
    }

    const [cartProductData] = await readCartProductCached({
      cartSessionId: newItem.id,
    })

    const cartProduct = cartProductData?.cartProduct

    if (!cartProduct) {
      return
    }

    await updateCartProduct(newItem, cartProduct, cartSession?.value)

    revalidatePath(redirectURL)
  })

export async function updateCartProductQuantity(
  cartProductId: string,
  newQuantity: number,
) {
  const supabase = createClient()

  const { error: updatedCartProductError } = await supabase
    .from('cart_sessions')
    .update({ quantity: newQuantity })
    .eq('id', cartProductId)

  if (updatedCartProductError) {
    console.error(updatedCartProductError)
  }

  revalidatePath('/')
}

export async function removeFromCart(cartProductId: string) {
  const supabase = createClient()

  const { error: removedFromCartError } = await supabase
    .from('cart_sessions')
    .delete()
    .eq('id', cartProductId)

  if (removedFromCartError) {
    console.error(removedFromCartError)
  }

  revalidatePath('/')
}

export async function clearCart(storeUrl: string) {
  const supabase = createClient()

  const cartSession = await getCartSession(storeUrl)

  const { error: clearCartError } = await supabase
    .from('cart_sessions')
    .delete()
    .eq('session_id', cartSession?.value)

  if (clearCartError) {
    console.error(clearCartError)
  }
}

export async function readStripeConnectedAccountByStoreUrl(
  storeUrl?: string,
): Promise<{
  user: { stripe_connected_account: 'connected' | null } | null
  userError: any | null
}> {
  const supabase = createClient()

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('user_id')
    .eq('store_subdomain', storeUrl)
    .single()

  if (storeError) {
    console.error(storeError)
  }

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('stripe_connected_account')
    .eq('id', store?.user_id)
    .single()

  if (userError) {
    console.error(userError)
  }

  return { user, userError }
}

export async function readCartProductVariations(
  variationsIds: { variation_id: string }[],
) {
  const supabase = createClient()

  const variations = []

  for (const variation of variationsIds) {
    const { data: productVariation, error: readProductVariationError } =
      await supabase
        .from('product_variations')
        .select('*')
        .eq('id', variation.variation_id)
        .single()

    if (readProductVariationError) {
      console.error(readProductVariationError)
    }

    variations.push(productVariation)
  }

  if (variations.length === 0) {
    return null
  }

  return variations
}
