import { createClient } from '@/lib/supabase/server'
import { CartProductType } from '@/models/cart'
import { CustomerType } from '@/models/customer'
import { StoreType } from '@/models/store'
import { AddressType } from '@/models/user'
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
    .eq('name', storeName)
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

export async function createPurchase(
  totalAmount: number,
  storeName: string,
  addressId: string,
): Promise<{
  purchase: { id: string } | null
  purchaseError: any | null
}> {
  const supabase = createClient()
  const bagItems: CartProductType[] = await getCart()

  const { customer, customerError } = await handleCustomer()

  if (customerError) {
    console.error(customerError)
  }

  const { store, storeError } = await readStoreByName(storeName)

  if (storeError) {
    console.error(storeError)
  }

  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .insert([
      {
        customer_id: customer?.id,
        status: 'pending',
        total_amount: totalAmount,
        updated_at: new Date().toISOString(),
        address_id: addressId,
        store_id: store?.id,
      },
    ])
    .select('id')
    .single()

  if (purchaseError) {
    console.error(purchaseError)
  }

  const { data: purchaseItems, error: purchaseItemsError } = await supabase
    .from('purchase_items')
    .insert(
      bagItems.map((item) => ({
        purchase_id: purchase?.id,
        product_id: item?.id,
        quantity: item?.amount,
        product_price: item?.price,
      })),
    )
    .select('*')

  if (purchaseItemsError) {
    console.error(purchaseItemsError)
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
      stock: product?.stock - quantity,
    })
    .eq('id', productId)

  if (updateAmountSoldError) {
    console.error(updateAmountSoldError)
  }
}
