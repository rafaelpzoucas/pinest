import { Order } from '@/features/_global/orders/schemas'
import { createClient } from '@/lib/supabase/server'
import { createServerAction } from 'zsa'
import { readCustomerOrdersSchema } from './schemas'

export const readStoreCustomerOrders = createServerAction()
  .input(readCustomerOrdersSchema)
  .handler(async ({ input }) => {
    const supabase = createClient()

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
      .eq('customer_id', input.storeCustomerId)
      .eq('store_id', input.storeId)
      .order('created_at', { ascending: false })

    if (error || !orders) {
      console.error('Não foi possível ler os pedidos.', error)
    }

    return { orders: orders as Order[] }
  })
