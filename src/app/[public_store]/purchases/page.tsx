import { Header } from '@/components/header'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn, formatDate } from '@/lib/utils'
import { Box, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { statuses } from './[id]/statuses'
import { readPurchases } from './actions'

type StatusKey = keyof typeof statuses

export default async function PurchasesPage() {
  const { purchases, error } = await readPurchases()

  const maxItems = 3

  return (
    <div className="p-4 space-y-4">
      <Header title="Minhas compras" />

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
