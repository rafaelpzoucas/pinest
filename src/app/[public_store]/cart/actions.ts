// app/actions/addToCart.js
'use server'

import { CartProductType } from '@/models/cart'
import { cookies } from 'next/headers'

export async function getCart() {
  const cookieStore = cookies()
  return JSON.parse(cookieStore.get('ztore_cart')?.value || '[]')
}

export async function addToCart(newItem: CartProductType) {
  const cookieStore = cookies()
  const cart = JSON.parse(cookieStore.get('ztore_cart')?.value || '[]')

  // Encontre o item no carrinho
  const existingItemIndex = cart.findIndex(
    (item: CartProductType) => item.id === newItem.id,
  )

  if (existingItemIndex !== -1) {
    cart[existingItemIndex].amount += newItem.amount
  } else {
    cart.push(newItem)
  }

  cookieStore.set('ztore_cart', JSON.stringify(cart), { path: '/' })
}

export async function updateItemAmount(itemId: string, newAmount: number) {
  const cookieStore = cookies()
  const cart = JSON.parse(cookieStore.get('ztore_cart')?.value || '[]')

  const existingItemIndex = cart.findIndex(
    (item: CartProductType) => item.id === itemId,
  )

  if (existingItemIndex !== -1) {
    cart[existingItemIndex].amount = newAmount
  } else {
    throw new Error('Item not found in cart')
  }

  cookieStore.set('ztore_cart', JSON.stringify(cart), { path: '/' })
}

export async function removeFromCart(itemId: string) {
  const cookieStore = cookies()
  let cart = JSON.parse(cookieStore.get('ztore_cart')?.value || '[]')
  cart = cart.filter((item: CartProductType) => item.id !== itemId)
  cookieStore.set('ztore_cart', JSON.stringify(cart), { path: '/' })
}
