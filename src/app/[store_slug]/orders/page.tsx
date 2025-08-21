import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { readCustomer } from '@/features/store/customers/read'
import { StoreEdgeConfig } from '@/features/store/initial-data/schemas'
import { readStoreCustomerOrders } from '@/features/store/orders/read'
import { readStoreIdBySlug } from '@/features/store/store/read'
import { readStoreCustomer } from '@/features/store/store/read-customer'
import { extractSubdomainOrDomain } from '@/lib/helpers'
import { cn, createPath, formatDate } from '@/lib/utils'
import { statuses } from '@/models/statuses'
import { get } from '@vercel/edge-config'
import { Box, ChevronRight } from 'lucide-react'
import { Metadata } from 'next'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

type StatusKey = keyof typeof statuses

export async function generateMetadata({
  params,
}: {
  params: { store_slug: string }
}): Promise<Metadata> {
  const sub =
    params.store_slug !== 'undefined'
      ? params.store_slug
      : (extractSubdomainOrDomain() as string)

  const store = (await get(`store_${sub}`)) as StoreEdgeConfig

  if (!store) {
    return { title: 'Pinest' }
  }

  const formattedTitle = store?.name
    ?.toLowerCase()
    .replace(/\b\w/g, (char: string) => char.toUpperCase())

  return {
    title: `Meus pedidos | ${formattedTitle}`,
    description: store?.description,
    icons: { icon: store.logo_url },
  }
}

export default async function OrdersPage({
  params,
}: {
  params: { store_slug: string }
}) {
  const maxItems = 3
  const cookieStore = cookies()

  const [[customerData], [storeIdData]] = await Promise.all([
    readCustomer({ subdomain: params.store_slug }),
    readStoreIdBySlug({ storeSlug: params.store_slug }),
  ])

  const customer = customerData?.customer
  const storeId = storeIdData?.storeId

  const [storeCustomerData] = await readStoreCustomer({
    customerId: customer?.id,
    storeId,
  })

  const storeCustomer = storeCustomerData?.storeCustomer

  const [ordersData] = await readStoreCustomerOrders({
    storeCustomerId: storeCustomer?.id,
    storeId,
  })

  const orders = ordersData?.orders ?? []

  const storeCustomerPhone = cookieStore.get(
    `${params.store_slug}_customer_phone`,
  )

  if (!storeCustomerPhone) {
    const redirectPath = createPath('/account', params.store_slug)
    console.log('Orders page redirect debug:', {
      storeSubdomain: params.store_slug,
      redirectPath,
      createPathResult: createPath('/account', params.store_slug),
    })
    return redirect(redirectPath)
  }

  return (
    <div className="space-y-4 p-4 pb-24 mt-[68px]">
      <div className="flex flex-col gap-2 lg:grid grid-cols-4">
        {orders && orders.length > 0 ? (
          orders.map((order) => (
            <Link href={`orders/${order.id}`} key={order?.id}>
              <Card className="relative flex flex-col gap-1 items-start p-4 text-sm">
                <Badge
                  className={cn(statuses[order.status as StatusKey].color)}
                >
                  {statuses[order.status as StatusKey].status}
                </Badge>

                <span className="text-sm text-muted-foreground">
                  {formatDate(order?.created_at, 'dd/MM/yyyy')}
                </span>

                <div>
                  {order.order_items.slice(0, maxItems).map((item) => {
                    if (!item.products) return null
                    return (
                      <div key={item.products.id}>
                        x{item.quantity} {item.products.name}
                      </div>
                    )
                  })}
                  {order.order_items.length > maxItems && <span>...</span>}
                </div>

                <ChevronRight className="absolute top-4 right-3 w-4 h-4" />
              </Card>
            </Link>
          ))
        ) : (
          <div
            className="flex flex-col items-center justify-center gap-4 py-4 w-full max-w-xs text-muted
              mx-auto"
          >
            <Box className="w-20 h-20" />
            <p className="text-muted-foreground">Não há compras registradas</p>
          </div>
        )}
      </div>
    </div>
  )
}
