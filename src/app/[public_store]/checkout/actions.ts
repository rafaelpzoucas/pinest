'use server'

import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { storeProcedure } from '@/lib/zsa-procedures'
import { AddressType } from '@/models/address'
import { PurchaseType } from '@/models/purchase'
import { redirect } from 'next/navigation'
import { readStore } from '../actions'
import { clearCart } from '../cart/actions'

export async function readUserConnectedAccountId(userId: string) {
  const supabase = createClient()

  const { data: stripeAccount, error: stripeAccountError } = await supabase
    .from('users')
    .select('stripe_account_id')
    .eq('id', userId)
    .single()

  return { stripeAccount, stripeAccountError }
}

export const readStoreAddress = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { store, supabase } = ctx

    const { data: storeAddress, error: storeAddressError } = await supabase
      .from('addresses')
      .select('*')
      .eq('store_id', store?.id)
      .single()

    if (storeAddressError) {
      console.error('Erro ao ler o endereço da loja.', storeAddressError)
    }

    return { storeAddress: storeAddress as AddressType }
  })

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

export async function createStripeCheckout(
  storeURL: string,
  purchaseId: string,
) {
  const { purchase, purchaseError } = await readPurchaseItems(purchaseId)
  const [storeData] = await readStore()
  const store = storeData?.store
  const { stripeAccount, stripeAccountError } =
    await readUserConnectedAccountId(store?.user_id ?? '')

  const shippingPrice = purchase?.total?.shipping_price ?? 0

  if (purchaseError || !store || stripeAccountError) {
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
        name: item?.products?.name ?? '',
        description: item?.products?.description ?? '',
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
    `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/customer/checkout/success?store_subdomain=${storeURL}&purchase=${purchaseId}&stripe_account=${stripeAccount?.stripe_account_id}&amount=${totalProductPrice}&pickup=${purchase.type}`,
    `${process.env.NEXT_PUBLIC_APP_URL}/${storeURL}/purchases/${purchaseId}`,
    stripeAccount?.stripe_account_id,
  )

  await clearCart(storeURL)

  return redirect(session.url as string)
}
