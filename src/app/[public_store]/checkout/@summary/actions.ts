'use server'

import { updatePurchaseStatus } from '@/app/admin/(protected)/(app)/purchases/deliveries/[id]/actions'
import { createClient } from '@/lib/supabase/server'
import { createPath } from '@/lib/utils'
import { storeProcedure } from '@/lib/zsa-procedures'
import { AddressType } from '@/models/address'
import { CustomerType } from '@/models/customer'
import { StoreType } from '@/models/store'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { clearCart, readCart } from '../../cart/actions'
import { readStoreCustomer } from '../../purchases/actions'
import { readPurchaseItems } from '../actions'
import { createPurchaseSchema } from './schemas'

export async function readAddressById(id: string): Promise<{
  address: AddressType | null
  addressError: any | null
}> {
  const supabase = createClient()

  const { data: address, error: addressError } = await supabase
    .from('addresses')
    .select('*')
    .eq('id', id)
    .single()

  return { address, addressError }
}

export async function readCustomerById(userId: string): Promise<{
  data: CustomerType | null
  error: any | null
}> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', userId)
    .single()

  return { data, error }
}

export async function readStoreByName(storeName: string): Promise<{
  store: StoreType | null
  storeError: any | null
}> {
  const supabase = createClient()

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('*')
    .eq('store_subdomain', storeName)
    .single()

  return { store, storeError }
}

const updateStoreCustomerPurchasesQuantity = storeProcedure
  .createServerAction()
  .input(z.object({ customerId: z.string().optional() }))
  .handler(async ({ ctx, input }) => {
    const { store, supabase } = ctx

    const { data: storeCustomer, error } = await supabase
      .from('store_customers')
      .select('*')
      .eq('customer_id', input.customerId)
      .eq('store_id', store.id)
      .single()

    if (error || !storeCustomer) {
      console.log('Nenhum cliente encontrado.', error)
    }

    const { error: updateCustomerError } = await supabase
      .from('store_customers')
      .update({
        purchases_quantity:
          storeCustomer && storeCustomer.purchases_quantity + 1,
      })
      .eq('id', storeCustomer?.id)

    if (updateCustomerError) {
      console.error(
        'Não foi possível atualizar a quantidade de compras na loja.',
        updateCustomerError,
      )
    }
  })

export const createPurchase = storeProcedure
  .createServerAction()
  .input(createPurchaseSchema)
  .handler(async ({ ctx, input }) => {
    const { store, supabase } = ctx

    const [[cartData], [customerData]] = await Promise.all([
      readCart(),
      readStoreCustomer(),
    ])

    const cart = cartData?.cart
    const storeCustomer = customerData?.storeCustomer

    const type = input.type

    const newPurchaseValues = {
      customer_id: storeCustomer?.id ?? null,
      status: 'accept',
      updated_at: new Date().toISOString(),
      store_id: store?.id,
      type,
      payment_type: input.payment_type,
      total: {
        total_amount: input.totalAmount,
        shipping_price: type !== 'TAKEOUT' ? input.shippingPrice : 0,
        change_value: input.changeValue,
      },
      delivery: {
        time: type === 'DELIVERY' ? input.shippingTime : null,
        address: storeCustomer?.customers?.address,
      },
    }

    const { data: createdPurchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert(newPurchaseValues)
      .select()
      .single()

    if (purchaseError || !createdPurchase) {
      console.error('Erro ao criar compra: ', purchaseError)
    }

    const deliveryFee =
      type === 'DELIVERY'
        ? {
            purchase_id: createdPurchase?.id,
            is_paid: false,
            description: 'Taxa de entrega',
            product_price: createdPurchase?.total?.shipping_price,
            quantity: 1,
            observations: '',
            extras: [],
          }
        : null

    const cartItems =
      (cart &&
        cart.map((item) => ({
          purchase_id: createdPurchase.id,
          product_id: item?.product_id,
          quantity: item?.quantity,
          product_price: item?.product_price,
          observations: item?.observations,
          extras: item.extras,
        }))) ??
      []

    const purchaseItemsArray = [
      ...cartItems,
      ...(deliveryFee ? [deliveryFee] : []),
    ]

    const { data: purchaseItems, error: purchaseItemsError } = await supabase
      .from('purchase_items')
      .insert(purchaseItemsArray)
      .select('*')

    if (purchaseItemsError || !purchaseItems) {
      console.error('Erro ao adicionar itens da compra: ', purchaseItemsError)
    }

    if (purchaseItems) {
      for (const item of purchaseItems) {
        if (item.product_id) {
          await updateAmountSoldAndStock(item.product_id, item.quantity)
        }
      }
    }

    await handlePayment({ purchaseId: createdPurchase.id })
    await updateStoreCustomerPurchasesQuantity({
      customerId: storeCustomer?.customers?.id,
    })

    return redirect(
      createPath(
        `/purchases/${createdPurchase.id}?back=home`,
        store.store_subdomain,
      ),
    )
  })

export async function updateAmountSoldAndStock(
  productId: string,
  quantity: number,
) {
  const supabase = createClient()

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, name, amount_sold, stock')
    .eq('id', productId)
    .single()

  if (productError) {
    console.error('Erro ao buscar amount_sold e stock do produto', productError)
  }

  const { error: updateAmountSoldError } = await supabase
    .from('products')
    .update({
      amount_sold: product?.amount_sold + quantity,
      stock:
        product?.stock !== null ? product?.stock - quantity : product.stock,
    })
    .eq('id', productId)

  if (updateAmountSoldError) {
    console.error(
      `Erro ao atualizar amount_sold e stock do produto ${product?.id} - ${product?.name}`,
      updateAmountSoldError,
    )
  }
}

export const handlePayment = storeProcedure
  .createServerAction()
  .input(z.object({ purchaseId: z.string() }))
  .handler(async ({ input, ctx }) => {
    const { store } = ctx

    const { purchase } = await readPurchaseItems(input.purchaseId)

    if (!purchase) {
      return
    }

    await updatePurchaseStatus({
      newStatus: 'accept',
      purchaseId: purchase.id,
      isIfood: false,
    })

    await clearCart(store.store_subdomain)

    revalidatePath(`/`)
  })
