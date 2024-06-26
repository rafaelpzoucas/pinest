import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { PurchaseType } from '@/models/purchase'
import { StoreType } from '@/models/store'
import { AddressType } from '@/models/user'
import { redirect } from 'next/navigation'

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

export async function readPurchaseItems(purchaseId: string): Promise<{
  purchase: PurchaseType | null
  purchaseError: any | null
}> {
  const supabase = createClient()

  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .select(
      `
        *,
        purchase_items (
          *,
          products (*)
        )
      `,
    )
    .eq('id', purchaseId)
    .single()

  return { purchase, purchaseError }
}

export async function createStripeCheckout(
  storeName: string,
  purchaseId: string,
) {
  const { purchase, purchaseError } = await readPurchaseItems(purchaseId)

  if (purchaseError) {
    console.error(purchaseError)
  }

  const purchaseItems = purchase?.purchase_items

  if (!purchaseItems) {
    return
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: purchaseItems.map((item) => ({
      price_data: {
        currency: 'brl',
        unit_amount: Math.round(item.products.price * 100),
        product_data: {
          name: item.products.name,
          description: item.products.description,
        },
      },
      quantity: item.quantity,
    })),
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${storeName}/checkout/success?store-name=${storeName}&purchase=${purchaseId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${storeName}/purchases/${purchaseId}`,
  })

  return redirect(session.url as string)
}
