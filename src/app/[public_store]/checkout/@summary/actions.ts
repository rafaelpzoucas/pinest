import { createClient } from '@/lib/supabase/server'
import { CartProductType } from '@/models/cart'
import { AddressType } from '@/models/user'
import { getCart } from '../../cart/actions'
import { createStripeCheckout } from '../actions'

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

export async function createPurchase(
  totalAmount: number,
  storeName: string,
  addressId: string,
) {
  const supabase = createClient()
  const bagItems: CartProductType[] = await getCart()
  const { data: session } = await supabase.auth.getUser()

  const { data: order, error: orderError } = await supabase
    .from('purchases')
    .insert([
      {
        customer_id: session.user?.id,
        status: 'pending',
        total_amount: totalAmount,
        updated_at: null,
        address_id: addressId,
      },
    ])
    .select('id')
    .single()

  if (orderError) {
    console.error(orderError)
  }

  const { error: orderItemsError } = await supabase
    .from('purchase_items')
    .insert(
      bagItems.map((item) => ({
        order_id: order?.id,
        product_id: item?.id,
        quantity: item?.amount,
        product_price: item?.price,
      })),
    )

  if (orderItemsError) {
    console.error(orderItemsError)
  }

  await createStripeCheckout(storeName, order?.id)
}
