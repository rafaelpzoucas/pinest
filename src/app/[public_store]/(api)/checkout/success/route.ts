import { getCart } from '@/app/[public_store]/cart/actions'
import { createClient } from '@/lib/supabase/server'
import { CartProductType } from '@/models/cart'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createClient()

  const bagItems: CartProductType[] = await getCart()

  const requestUrl = new URL(request.url)
  const storeName = requestUrl.searchParams.get('store-name')
  const totalAmount = requestUrl.searchParams.get('total-amount')
  const origin = requestUrl.origin

  const { data: session } = await supabase.auth.getUser()

  const { data: order, error: orderError } = await supabase
    .from('purchases')
    .insert([
      {
        customer_id: session.user?.id,
        status: 'paid',
        total_amount: totalAmount,
      },
    ])
    .select()
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
      })),
    )

  if (orderItemsError) {
    console.error(orderItemsError)
  }

  cookies().delete('ztore_cart')

  revalidatePath('/purchases')

  return NextResponse.redirect(`${origin}/${storeName}/purchases`)
}
