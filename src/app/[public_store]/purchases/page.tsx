import { Header } from '@/components/header'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { cn, formatDate } from '@/lib/utils'
import { CartProductType } from '@/models/cart'
import { statuses } from '@/models/statuses'
import { Box, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { getStoreByStoreURL } from '../actions'
import { getCart, readStripeConnectedAccountByStoreUrl } from '../cart/actions'
import { readPurchases } from './actions'

type StatusKey = keyof typeof statuses

export default async function PurchasesPage({
  params,
}: {
  params: { public_store: string }
}) {
  const supabase = createClient()

  const { purchases, error } = await readPurchases()

  const maxItems = 3

  const { store, storeError } = await getStoreByStoreURL(params.public_store)

  const bagItems: CartProductType[] = await getCart(params.public_store)

  if (storeError) {
    console.error(storeError)
  }

  const { data: userData, error: userError } = await supabase.auth.getUser()

  const { user } = await readStripeConnectedAccountByStoreUrl(
    params.public_store,
  )

  const connectedAccount = user?.stripe_connected_account

  return (
    <div className="space-y-4">
      <Header
        title="Minhas compras"
        store={store}
        bagItems={bagItems}
        userData={userData}
        connectedAccount={connectedAccount}
      />

      <div className="flex flex-col gap-2">
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
                  {purchase.purchase_items.slice(0, maxItems).map((item) => (
                    <div key={item.products.id}>
                      x{item.quantity} {item.products.name}
                    </div>
                  ))}
                  {purchase.purchase_items.length > maxItems && (
                    <span>...</span>
                  )}
                </div>

                <ChevronRight className="absolute top-4 right-3 w-4 h-4" />
              </Card>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-4 w-full max-w-xs text-muted mx-auto">
            <Box className="w-20 h-20" />
            <p className="text-muted-foreground">Não há compras registradas</p>
          </div>
        )}
      </div>
    </div>
  )
}
