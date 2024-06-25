'use server'

import { cookies } from 'next/headers'

export async function clearCart() {
  cookies().set('pinest_cart', '')
}
