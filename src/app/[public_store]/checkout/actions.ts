import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { PurchaseType } from '@/models/purchase'
import { StoreType } from '@/models/store'
import { AddressType } from '@/models/user'
import { redirect } from 'next/navigation'
import { clearCart } from '../cart/actions'
import { readStoreByName } from './@summary/actions'

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

export async function readUserConnectedAccountId(userId: string) {
  const supabase = createClient()

  const { data: stripeAccount, error: stripeAccountError } = await supabase
    .from('users')
    .select('stripe_account_id')
    .eq('id', userId)
    .single()

  return { stripeAccount, stripeAccountError }
}

export async function readStoreAddress(storeName: string): Promise<{
  storeAddress: AddressType | null
  storeAddressError: any | null
}> {
  const supabase = createClient()

  const { store, storeError } = await readStoreByName(storeName)

  if (storeError) console.error(storeError)

  const { data: storeAddress, error: storeAddressError } = await supabase
    .from('addresses')
    .select('*')
    .eq('store_id', store?.id)
    .single()

  return { storeAddress, storeAddressError }
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

  const { store, storeError } = await readStore(storeName)

  if (storeError) {
    console.error(storeError)
  }

  const { stripeAccount, stripeAccountError } =
    await readUserConnectedAccountId(store?.user_id ?? '')

  if (stripeAccountError) {
    console.error(stripeAccountError)
  }

  const purchaseItems = purchase?.purchase_items

  if (!purchaseItems) {
    return
  }

  const lineItems = purchaseItems.map((item) => ({
    price_data: {
      currency: 'brl',
      unit_amount: Math.round(item.product_price * 100),
      product_data: {
        name: item.products.name,
        description: item.products.description,
      },
    },
    quantity: item.quantity,
  }))

  const totalProductPrice = purchaseItems.reduce((acc, item) => {
    return acc + item.product_price * item.quantity
  }, 0)

  const session = await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      line_items: [
        ...lineItems,
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: 'Frete',
            },
            unit_amount: Math.round(purchase.shipping_price * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${storeName}/checkout/success?store-name=${storeName}&purchase=${purchaseId}&stripe_account=${stripeAccount?.stripe_account_id}&amount=${totalProductPrice}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${storeName}/purchases/${purchaseId}`,
    },
    {
      stripeAccount: stripeAccount?.stripe_account_id,
    },
  )

  await clearCart(storeName)

  return redirect(session.url as string)
}
