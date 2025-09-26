import { createClient } from '@/lib/supabase/client'
import { OrderType } from '@/models/order'
import { z } from 'zod'
import { readCustomer } from '../cart/customer'

const ReadOrdersSchema = z.object({
  storeId: z.string().optional(),
  subdomain: z.string().optional(),
})

type ReadOrders = z.infer<typeof ReadOrdersSchema>

export async function readOrdersData(input: ReadOrders) {
  const supabase = createClient()

  const customerData = await readCustomer({ subdomain: input.subdomain })
  const storeCustomer = customerData?.customer

  const { data: orders, error } = await supabase
    .from('orders')
    .select(
      `
        *,
        order_items (
          *,
          products (
            *
          )
        )
      `,
    )
    .eq('customer_id', storeCustomer?.id)
    .eq('store_id', input.storeId)
    .order('created_at', { ascending: false })

  if (error || !orders) {
    console.error('Não foi possível ler os pedidos.', error)
  }

  return { orders: orders as OrderType[] }
}
