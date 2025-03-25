import { updatePurchaseStatus } from '@/app/admin/(protected)/(app)/purchases/deliveries/[id]/actions'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { PurchaseType } from '@/models/purchase'
import { StoreType } from '@/models/store'
import { AddressType } from '@/models/user'
import { revalidatePath } from 'next/cache'
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

export async function readStore(storeURL: string): Promise<{
  store: StoreType | null
  storeError: any | null
}> {
  const supabase = createClient()

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('*')
    .eq('store_url', storeURL)
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

async function createStripeCheckoutSession(
  lineItems: {
    price_data: {
      currency: string
      unit_amount: number
      product_data: { name: string; description: string }
    }
    quantity: number
  }[],
  successUrl: string,
  cancelUrl: string,
  stripeAccountId: string,
) {
  try {
    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        line_items: lineItems,
        success_url: successUrl,
        cancel_url: cancelUrl,
      },
      {
        stripeAccount: stripeAccountId,
      },
    )

    return session
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error)
    throw error
  }
}

export async function handlePayment(purchaseId: string, storeURL: string) {
  const { purchase } = await readPurchaseItems(purchaseId)

  if (!purchase) {
    return
  }

  await updatePurchaseStatus('accept', purchase.id)

  await clearCart(storeURL)

  revalidatePath(`/`)

  return redirect(`/${storeURL}/purchases/${purchase.id}?callback=purchases`)
}

export async function createStripeCheckout(
  storeURL: string,
  purchaseId: string,
) {
  const { purchase, purchaseError } = await readPurchaseItems(purchaseId)
  const { store, storeError } = await readStore(storeURL)
  const { stripeAccount, stripeAccountError } =
    await readUserConnectedAccountId(store?.user_id ?? '')

  const shippingPrice = purchase?.total?.shipping_price ?? 0

  if (purchaseError || storeError || stripeAccountError) {
    throw new Error('Erro ao obter dados necessários para criar o checkout')
  }

  const purchaseItems = purchase?.purchase_items
  if (!purchaseItems) {
    return null
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

  if (shippingPrice > 0) {
    lineItems.push({
      price_data: {
        currency: 'brl',
        unit_amount: Math.round(shippingPrice * 100),
        product_data: {
          name: 'Frete',
          description: 'Custo de frete',
        },
      },
      quantity: 1,
    })
  }

  const totalProductPrice = purchaseItems.reduce((acc, item) => {
    return acc + item.product_price * item.quantity
  }, 0)

  if (!stripeAccount?.stripe_account_id) {
    throw new Error('Lojista não está conectado ao Stripe')
  }

  const session = await createStripeCheckoutSession(
    lineItems,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/customer/checkout/success?store_url=${storeURL}&purchase=${purchaseId}&stripe_account=${stripeAccount?.stripe_account_id}&amount=${totalProductPrice}&pickup=${purchase.type}`,
    `${process.env.NEXT_PUBLIC_APP_URL}/${storeURL}/purchases/${purchaseId}`,
    stripeAccount?.stripe_account_id,
  )

  await clearCart(storeURL)

  return redirect(session.url as string)
}
