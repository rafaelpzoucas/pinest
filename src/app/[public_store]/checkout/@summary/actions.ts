import { createClient } from '@/lib/supabase/server'
import { generateSlug } from '@/lib/utils'
import { CustomerType } from '@/models/customer'
import { CreatePurchaseType } from '@/models/purchase'
import { StoreType } from '@/models/store'
import { AddressType } from '@/models/user'
import { cookies } from 'next/headers'
import { getCart } from '../../cart/actions'

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
    .eq('store_url', storeName)
    .single()

  return { store, storeError }
}

export async function handleCustomer(): Promise<{
  customer: CustomerType | null
  customerError: any | null
}> {
  const supabase = createClient()

  const { data: session } = await supabase.auth.getUser()

  const { data: customer, error: customerError } = await readCustomerById(
    session.user?.id ?? '',
  )

  if (customerError) {
    console.error(customerError)
  }

  if (!customer) {
    const { error: insertCustomerError } = await supabase
      .from('customers')
      .insert([
        {
          user_id: session.user?.id,
          purchases_quantity: 1,
        },
      ])

    if (insertCustomerError) {
      console.error(insertCustomerError)
    }

    const { data: customer, error: customerError } = await readCustomerById(
      session.user?.id ?? '',
    )

    return { customer, customerError }
  }

  const { error: insertCustomerError } = await supabase
    .from('customers')
    .update({ purchases_quantity: customer && customer.purchases_quantity + 1 })
    .eq('id', customer.id)

  if (insertCustomerError) {
    console.error(insertCustomerError)
  }

  return { customer, customerError }
}

export async function createPurchase(newPurchase: CreatePurchaseType): Promise<{
  purchase: { id: string } | null
  purchaseError: any | null
}> {
  const supabase = createClient()
  const cookieStore = cookies()

  const { cart } = await getCart(generateSlug(newPurchase.storeName))

  const { customer, customerError } = await handleCustomer()

  if (customerError) {
    console.error('Erro ao buscar o cliente: ', customerError)
  }

  const type = newPurchase.type

  const { store, storeError } = await readStoreByName(newPurchase.storeName)

  if (storeError) {
    console.error('Erro ao buscar a loja: ', storeError)
  }

  const guestData = cookieStore.get('guest_data')

  const valuesToInsert = {
    customer_id: customer?.id ?? null,
    status: 'accept',
    updated_at: new Date().toISOString(),
    address_id: newPurchase.addressId,
    store_id: store?.id,
    delivery_time: type === 'DELIVERY' ? newPurchase.shippingTime : null,
    type,
    payment_type: newPurchase.payment_type,
    guest_data: guestData ? JSON.parse(guestData.value) : null,
    total: {
      total_amount: newPurchase.totalAmount,
      shipping_price: type !== 'TAKEOUT' ? newPurchase.shippingPrice : 0,
      change_value: newPurchase.changeValue,
    },
  }

  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .insert(valuesToInsert)
    .select()
    .single()

  if (purchaseError) {
    console.error('Erro ao criar compra: ', purchaseError)
  }

  const variationsToInsert =
    cart &&
    cart.map((variation) =>
      variation.product_variations.map((variation) => ({
        purchase_id: purchase?.id,
        variation_id: variation.variation_id,
      })),
    )[0]

  const { error: createPurchaseVariationsError } = await supabase
    .from('purchase_item_variations')
    .insert(variationsToInsert)

  if (createPurchaseVariationsError) {
    console.error('Erro ao criar variações: ', createPurchaseVariationsError)
  }

  const deliveryFee = newPurchase.type === 'DELIVERY' && {
    purchase_id: purchase?.id,
    is_paid: false,
    description: 'Taxa de entrega',
    product_price: purchase?.total?.shipping_price,
    quantity: 1,
    observations: '',
    extras: [],
  }

  const cartItems =
    (cart &&
      cart.map((item) => ({
        purchase_id: purchase.id,
        product_id: item?.product_id,
        quantity: item?.quantity,
        product_price: item?.product_price,
        observations: item?.observations,
        extras: item.extras,
      }))) ??
    []

  const purchaseItemsArray = [...cartItems, deliveryFee]

  console.log({ purchaseItemsArray })

  const { data: purchaseItems, error: purchaseItemsError } = await supabase
    .from('purchase_items')
    .insert(purchaseItemsArray)
    .select('*')

  if (purchaseItemsError) {
    console.error('Erro ao adicionar itens da compra: ', purchaseItemsError)
  }

  if (purchaseItems) {
    for (const item of purchaseItems) {
      await updateAmountSoldAndStock(item.product_id, item.quantity)
    }
  }

  return { purchase, purchaseError }
}

export async function updateAmountSoldAndStock(
  productId: string,
  quantity: number,
) {
  const supabase = createClient()

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('amount_sold, stock')
    .eq('id', productId)
    .single()

  if (productError) {
    console.error(productError)
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
    console.error(updateAmountSoldError)
  }
}
