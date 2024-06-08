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
        status: 'approved',
        total_amount: totalAmount,
        updated_at: new Date().toISOString(),
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

  // Update stock
  for (const item of bagItems) {
    const { data: product, error: getProductError } = await supabase
      .from('products')
      .select('stock, amount_sold')
      .eq('id', item.id)
      .single()

    if (getProductError) {
      console.error(`Erro ao obter o produto ${item.id}:`, getProductError)
      return NextResponse.json(
        { error: 'Error fetching product stock' },
        { status: 500 },
      )
    }

    const newStock = product.stock - item.amount
    const newSold = product.amount_sold + item.amount

    const { error: updateStockError } = await supabase
      .from('products')
      .update({ stock: newStock, amount_sold: newSold })
      .eq('id', item.id)

    if (updateStockError) {
      console.error(
        `Erro ao atualizar o estoque do produto ${item.id}:`,
        updateStockError,
      )
      return NextResponse.json(
        { error: 'Error updating product stock' },
        { status: 500 },
      )
    }
  }

  cookies().delete('ztore_cart')

  revalidatePath('/purchases')

  return NextResponse.redirect(`${origin}/${storeName}/purchases?callback=home`)
}

// - [ ] add address id to purchase
