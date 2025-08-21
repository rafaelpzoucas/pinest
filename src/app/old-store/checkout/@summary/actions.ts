'use server'

import { updateOrderStatus } from '@/app/admin/(protected)/(app)/orders/deliveries/[id]/actions'

import { notifySchema, NotifyType } from '@/app/api/v1/push/schemas'
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
import { readStoreCustomer } from '../../orders/actions'
import { readOrderItems } from '../actions'
import { createOrderSchema } from './schemas'

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

const updateStoreCustomerOrdersQuantity = storeProcedure
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
        orders_quantity: storeCustomer && storeCustomer.orders_quantity + 1,
      })
      .eq('id', storeCustomer?.id)

    if (updateCustomerError) {
      console.error(
        'Não foi possível atualizar a quantidade de compras na loja.',
        updateCustomerError,
      )
    }
  })

export const getNextDisplayId = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { store, supabase } = ctx

    const { data, error } = await supabase.rpc('get_next_display_id', {
      input_store_id: store?.id,
    })

    if (error || !data) {
      throw new Error('Erro ao gerar display_id')
    }

    return data // current_sequence retornado
  })

export const createOrder = storeProcedure
  .createServerAction()
  .input(createOrderSchema)
  .handler(async ({ ctx, input }) => {
    const { store, supabase } = ctx

    const [[cartData], [customerData]] = await Promise.all([
      readCart(),
      readStoreCustomer(),
    ])

    const [displayId] = await getNextDisplayId()

    const cart = cartData?.cart
    const storeCustomer = customerData?.storeCustomer
    const type = input.type
    const shippingPrice = type !== 'TAKEOUT' ? input.shippingPrice : 0
    let subtotal = input.totalAmount - shippingPrice
    let couponDiscount = 0

    // --- Lógica de cupom ---
    const couponId = input.coupon_id
    if (input.coupon_code && input.coupon_id) {
      // Busca cupom para validar regras novamente
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('id', input.coupon_id)
        .eq('store_id', store.id)
        .eq('code', input.coupon_code)
        .single()

      if (!error && coupon && coupon.status === 'active') {
        // Verifica expiração
        const isNotExpired =
          !coupon.expires_at || new Date(coupon.expires_at) >= new Date()
        if (isNotExpired) {
          // Verifica limites globais
          const canUseGlobal =
            !coupon.usage_limit ||
            (coupon.usage_count ?? 0) < coupon.usage_limit

          // Verifica limites por cliente
          let canUseByCustomer = true
          if (coupon.usage_limit_per_customer && storeCustomer?.id) {
            const { count: usageCount, error: usageError } = await supabase
              .from('coupon_usages')
              .select('*', { count: 'exact', head: true })
              .eq('coupon_id', coupon.id)
              .eq('customer_id', storeCustomer.id)

            if (usageError)
              throw new Error('Erro ao verificar uso do cupom pelo cliente')

            canUseByCustomer =
              (usageCount ?? 0) < coupon.usage_limit_per_customer
          }

          if (canUseGlobal && canUseByCustomer) {
            // Aplica desconto
            if (coupon.couponDiscount_type === 'percent') {
              couponDiscount = Math.min(
                subtotal,
                (subtotal * coupon.couponDiscount) / 100,
              )
            } else if (coupon.couponDiscount_type === 'fixed') {
              couponDiscount = Math.min(subtotal, coupon.discount)
            }

            subtotal -= couponDiscount

            // Atualiza usage_count
            await supabase
              .from('coupons')
              .update({ usage_count: (coupon.usage_count || 0) + 1 })
              .eq('id', coupon.id)

            // Registra uso por cliente
            if (storeCustomer?.id) {
              await supabase.from('coupon_usages').insert({
                coupon_id: coupon.id,
                customer_id: storeCustomer.id,
                used_at: new Date().toISOString(),
                order_id: null, // pode ser atualizado depois
              })
            }
          }
        }
      }
    }

    const newOrderValues = {
      display_id: displayId,
      customer_id: storeCustomer?.id ?? null,
      status: 'accept',
      updated_at: new Date().toISOString(),
      store_id: store?.id,
      type,
      payment_type: input.payment_type,
      total: {
        subtotal,
        discount: input.discount,
        total_amount: subtotal + shippingPrice,
        shipping_price: shippingPrice,
        change_value: input.changeValue ?? 0,
      },
      delivery: {
        time: type === 'DELIVERY' ? input.shippingTime : null,
        address: storeCustomer?.customers?.address,
      },
      coupon_id: couponId,
      coupon_code: input.coupon_code,
    }

    const { data: createdOrder, error: orderError } = await supabase
      .from('orders')
      .insert(newOrderValues)
      .select()
      .single()

    if (orderError || !createdOrder) {
      console.error('Erro ao criar compra: ', orderError)
    }

    const deliveryFee =
      type === 'DELIVERY'
        ? {
            order_id: createdOrder?.id,
            is_paid: false,
            description: 'Taxa de entrega',
            product_price: createdOrder?.total?.shipping_price,
            quantity: 1,
            observations: [],
            extras: [],
          }
        : null

    const cartItems =
      (cart &&
        cart.map((item) => ({
          order_id: createdOrder.id,
          product_id: item?.product_id,
          quantity: item?.quantity,
          product_price: item?.product_price,
          observations: item?.observations,
          extras: item.extras,
        }))) ??
      []

    const orderItemsArray = [
      ...cartItems,
      ...(deliveryFee ? [deliveryFee] : []),
    ]

    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItemsArray)
      .select('*')

    if (orderItemsError || !orderItems) {
      console.error('Erro ao adicionar itens da compra: ', orderItemsError)
    }

    if (orderItems) {
      for (const item of orderItems) {
        if (item.product_id) {
          await updateAmountSoldAndStock(item.product_id, item.quantity)
        }
      }
    }

    await handlePayment({ orderId: createdOrder.id })
    await updateStoreCustomerOrdersQuantity({
      customerId: storeCustomer?.customers?.id,
    })

    nofityStore({ storeId: store?.id })

    return redirect(
      createPath(`/orders/${createdOrder.id}?back=home`, store.store_subdomain),
    )
  })

export async function nofityStore(values: NotifyType) {
  const { description, storeId, title, url, icon } = notifySchema.parse(values)

  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/v1/push/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storeId,
        title: title ?? 'Novo pedido recebido',
        description: description ?? 'Você recebeu um novo pedido na sua loja!',
        url: url ?? '',
        icon,
      }),
    })
  } catch (error) {
    throw new Error('Erro ao notificar a loja', error as Error)
  }
}

export async function updateAmountSoldAndStock(
  productId: string,
  quantityDiff: number, // Pode ser positivo ou negativo
) {
  const supabase = createClient()

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, name, amount_sold, stock')
    .eq('id', productId)
    .single()

  if (productError) {
    console.error('Erro ao buscar produto', productError)
    return
  }

  const { error: updateError } = await supabase
    .from('products')
    .update({
      amount_sold: (product?.amount_sold ?? 0) + quantityDiff,
      stock:
        product?.stock !== null ? product.stock - quantityDiff : product.stock,
    })
    .eq('id', productId)

  if (updateError) {
    console.error(
      `Erro ao atualizar produto ${product?.id} - ${product?.name}`,
      updateError,
    )
  }
}

export const handlePayment = storeProcedure
  .createServerAction()
  .input(z.object({ orderId: z.string() }))
  .handler(async ({ input, ctx }) => {
    const { store } = ctx

    const { order } = await readOrderItems(input.orderId)

    if (!order) {
      return
    }

    await updateOrderStatus({
      newStatus: 'accept',
      orderId: order.id,
      isIfood: false,
    })

    await clearCart(store.store_subdomain)
    revalidatePath(`/`)
  })

export const validateCoupon = storeProcedure
  .createServerAction()
  .input(
    z.object({
      code: z.string().max(20),
      customer_id: z.string().optional(),
    }),
  )
  .handler(async ({ ctx, input }) => {
    const { store, supabase } = ctx
    const code = input.code.toUpperCase()

    // Busca cupom
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('store_id', store.id)
      .eq('code', code)
      .maybeSingle()

    if (error || !coupon) {
      return { valid: false, error: 'Cupom não encontrado.' }
    }

    // Status
    if (coupon.status !== 'active') {
      return { valid: false, error: 'Cupom inativo ou expirado.' }
    }

    // Expiração
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return { valid: false, error: 'Cupom expirado.' }
    }

    // Limite total
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return { valid: false, error: 'Limite de uso do cupom atingido.' }
    }

    // Limite por cliente
    if (input.customer_id && coupon.usage_limit_per_customer) {
      const { count, error: usageError } = await supabase
        .from('coupon_usages')
        .select('*', { count: 'exact', head: true })
        .eq('coupon_id', coupon.id)
        .eq('customer_id', input.customer_id)

      if (usageError) {
        return { valid: false, error: 'Erro ao validar uso do cupom.' }
      }
      if ((count ?? 0) >= coupon.usage_limit_per_customer) {
        return { valid: false, error: 'Limite de uso por cliente atingido.' }
      }
    }

    return {
      valid: true,
      discount: coupon.discount,
      discount_type: coupon.discount_type,
      coupon_id: coupon.id,
      code: coupon.code,
    }
  })
