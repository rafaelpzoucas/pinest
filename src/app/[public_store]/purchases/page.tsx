import { Header } from '@/components/store-header'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn, createPath, formatDate } from '@/lib/utils'
import { statuses } from '@/models/statuses'
import { Box, ChevronRight } from 'lucide-react'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { readStoreCached } from '../actions'
import { readCartCached } from '../cart/actions'
import { generateRequestId, logCpu } from '../utils'
import { readPurchasesCached } from './actions'

type StatusKey = keyof typeof statuses

export default async function PurchasesPage() {
  const requestId = generateRequestId()

  return await logCpu(`${requestId}::PurchasesPage`, async () => {
    const maxItems = 3
    const cookieStore = cookies()

    const [[storeData], [cartData], [purchasesData]] = await logCpu(
      `${requestId}::fetchPurchasesData`,
      async () => {
        return await Promise.all([
          readStoreCached(),
          readCartCached(),
          readPurchasesCached(),
        ])
      },
    )

    const { store, cart, purchases, storeCustomerPhone } = {
      store: storeData?.store,
      cart: cartData?.cart,
      purchases: purchasesData?.purchases ?? [],
      storeCustomerPhone: cookieStore.get(
        `${storeData?.store?.store_subdomain}_customer_phone`,
      ),
    }

    if (!storeCustomerPhone) {
      await logCpu(`${requestId}::redirectToAccount`, async () => {
        const redirectPath = createPath('/account', store?.store_subdomain)
        console.log('Purchases page redirect debug:', {
          storeSubdomain: store?.store_subdomain,
          redirectPath,
          createPathResult: createPath('/account', store?.store_subdomain),
        })
        return redirect(redirectPath)
      })
    }

    return (
      <div className="space-y-4">
        <Header title="Minhas compras" store={store} cartProducts={cart} />

        <div className="flex flex-col gap-2 lg:grid grid-cols-4">
          {purchases && purchases.length > 0 ? (
            purchases.map((purchase) => (
              <Link href={`purchases/${purchase.id}`} key={purchase?.id}>
                <Card className="relative flex flex-col gap-1 items-start p-4 text-sm">
                  <Badge
                    className={cn(statuses[purchase.status as StatusKey].color)}
                  >
                    {statuses[purchase.status as StatusKey].status}
                  </Badge>

                  <span className="text-sm text-muted-foreground">
                    {formatDate(purchase?.created_at, 'dd/MM/yyyy')}
                  </span>

                  <div>
                    {purchase.purchase_items.slice(0, maxItems).map((item) => {
                      if (!item.products) return null
                      return (
                        <div key={item.products.id}>
                          x{item.quantity} {item.products.name}
                        </div>
                      )
                    })}
                    {purchase.purchase_items.length > maxItems && (
                      <span>...</span>
                    )}
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
              <p className="text-muted-foreground">
                Não há compras registradas
              </p>
            </div>
          )}
        </div>
      </div>
    )
  })
}
