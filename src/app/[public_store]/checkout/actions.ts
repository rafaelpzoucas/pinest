import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { CartProductType } from '@/models/cart'
import { StoreType } from '@/models/store'
import { AddressType } from '@/models/user'
import { redirect } from 'next/navigation'
import { getCart } from '../cart/actions'

export async function readCustomerAddress() {
  'use server'

  const supabase = createClient()

  const { data: session, error: sessionError } = await supabase.auth.getUser()

  if (sessionError) {
    console.error(sessionError)
  }

  const { data: customerAddress, error: customerAddressError } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', session.user?.id)
    .single()

  return {
    customerAddress,
    customerAddressError,
  }
}

export async function readStore(storeName: string): Promise<{
  store: StoreType | null
  storeError: any | null
}> {
  const supabase = createClient()

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('*')
    .eq('name', storeName.replaceAll('-', ' '))
    .single()

  return { store, storeError }
}

export async function readStoreAddress(storeName: string): Promise<{
  storeAddresses: { addresses: AddressType[] } | null
  storeAddressError: any | null
}> {
  const supabase = createClient()

  const { store, storeError } = await readStore(storeName)

  if (storeError) console.error(storeError)

  const { data: storeAddresses, error: storeAddressError } = await supabase
    .from('users')
    .select('addresses (*)')
    .eq('id', store?.user_id)
    .single()

  return { storeAddresses, storeAddressError }
}

export async function createStripeCheckout(storeName: string) {
  const bagItems: CartProductType[] = await getCart()
  const totalAmount = bagItems.reduce((acc, bagItem) => {
    const priceToAdd =
      bagItem.promotional_price > 0 ? bagItem.promotional_price : bagItem.price

    return acc + priceToAdd * bagItem.amount
  }, 0)

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: bagItems.map((item) => ({
      price_data: {
        currency: 'brl',
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name: item.name,
          description: item.description,
        },
      },
      quantity: item.amount,
    })),
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${storeName}/checkout/success?store-name=${storeName}&total-amount=${totalAmount}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${storeName}/cart`,
  })

  return redirect(session.url as string)
}
