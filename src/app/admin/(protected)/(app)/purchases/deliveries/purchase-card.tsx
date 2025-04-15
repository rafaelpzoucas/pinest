import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn, formatDate } from '@/lib/utils'
import { PurchaseType } from '@/models/purchase'
import { statuses } from '@/models/statuses'
import { ChevronRight } from 'lucide-react'

import Link from 'next/link'

type PurchaseCardPropsType = {
  purchase: PurchaseType
}

type StatusKey = keyof typeof statuses

export function PurchaseCard({ purchase }: PurchaseCardPropsType) {
  const isIfood = purchase.is_ifood

  const customer = isIfood
    ? purchase.ifood_order_data.customer
    : purchase.store_customers.customers
  const customerNames = customer?.name.split(' ')
  const firstName = customerNames && customerNames[0]

  const displayId = purchase.id.substring(0, 4)

  return (
    <Link href={`purchases/deliveries/${purchase.id}`}>
      <Card key={purchase.id} className={cn('flex flex-col gap-2 p-4')}>
        <header className="flex flex-row">
          <Badge className={cn(statuses[purchase.status as StatusKey].color)}>
            {statuses[purchase.status as StatusKey].status}
          </Badge>

          <span className="text-muted-foreground ml-2">#{displayId}</span>

          <span
            className={cn(
              'text-xs text-muted-foreground ml-auto whitespace-nowrap',
              purchase.status === 'waiting' && 'text-muted',
            )}
          >
            {formatDate(purchase.created_at, 'dd/MM hh:mm')}
          </span>

          <ChevronRight className="w-4 h-4 ml-2" />
        </header>

        <strong>{`${firstName}`}</strong>

        <section
          className={cn(
            'pr-1 text-xs space-y-1 text-muted-foreground',
            purchase.status === 'waiting' &&
              'bg-primary text-primary-foreground',
          )}
        >
          <div className="flex flex-row justify-between">
            <span>{purchase.purchase_items.length} produto(s)</span>
            <strong>
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(purchase?.total?.total_amount ?? 0)}
            </strong>
          </div>
        </section>
      </Card>
    </Link>
  )
}
