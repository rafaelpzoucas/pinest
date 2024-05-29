// app/actions/addToCart.js
'use server'

import { CartProductType } from '@/models/cart'
import { cookies } from 'next/headers'

export async function getCart() {
  const cookieStore = cookies()
  return JSON.parse(cookieStore.get('ztore_cart')?.value || '[]')
}

export async function addToCart(item: CartProductType) {
  const cookieStore = cookies()
  const cart = JSON.parse(cookieStore.get('ztore_cart')?.value || '[]')
  cart.push(item)
  cookieStore.set('ztore_cart', JSON.stringify(cart), { path: '/' })
}

export async function removeFromCart(itemId: string) {
  const cookieStore = cookies()
  let cart = JSON.parse(cookieStore.get('ztore_cart')?.value || '[]')
  cart = cart.filter((item: CartProductType) => item.id !== itemId)
  cookieStore.set('ztore_cart', JSON.stringify(cart), { path: '/' })
}
