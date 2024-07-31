// app/actions/addToCart.js
'use server'

import { createClient } from '@/lib/supabase/server'
import { CartProductType } from '@/models/cart'
import { cookies } from 'next/headers'

export async function getCart(storeUrl: string) {
  const cookieStore = cookies()
  return JSON.parse(cookieStore.get(`${storeUrl}_cart`)?.value || '[]')
}

export async function addToCart(storeUrl: string, newItem: CartProductType) {
  const cookieStore = cookies()
  const cart = JSON.parse(cookieStore.get(`${storeUrl}_cart`)?.value || '[]')

  // Encontre o item no carrinho
  const existingItemIndex = cart.findIndex(
    (item: CartProductType) => item.id === newItem.id,
  )

  if (existingItemIndex !== -1) {
    cart[existingItemIndex].amount += newItem.amount
  } else {
    cart.push(newItem)
  }

  cookieStore.set(`${storeUrl}_cart`, JSON.stringify(cart), { path: '/' })
}

export async function updateItemAmount(
  storeUrl: string,
  itemId: string,
  newAmount: number,
) {
  const cookieStore = cookies()
  const cart = JSON.parse(cookieStore.get(`${storeUrl}_cart`)?.value || '[]')

  const existingItemIndex = cart.findIndex(
    (item: CartProductType) => item.id === itemId,
  )

  if (existingItemIndex !== -1) {
    cart[existingItemIndex].amount = newAmount
  } else {
    throw new Error('Item not found in cart')
  }

  cookieStore.set(`${storeUrl}_cart`, JSON.stringify(cart), { path: '/' })
}

export async function removeFromCart(storeUrl: string, itemId: string) {
  const cookieStore = cookies()
  let cart = JSON.parse(cookieStore.get(`${storeUrl}_cart`)?.value || '[]')
  cart = cart.filter((item: CartProductType) => item.id !== itemId)
  cookieStore.set(`${storeUrl}_cart`, JSON.stringify(cart), { path: '/' })
}

export async function readStripeConnectedAccountByStoreUrl(
  storeUrl: string,
): Promise<{
  user: { stripe_connected_account: any } | null
  userError: any | null
}> {
  const supabase = createClient()

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('user_id')
    .eq('store_url', storeUrl)
    .single()

  if (storeError) {
    console.error(storeError)
  }

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('stripe_connected_account')
    .eq('id', store?.user_id)
    .single()

  return { user, userError }
}
