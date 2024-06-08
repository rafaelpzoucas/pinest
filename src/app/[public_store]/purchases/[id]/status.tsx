import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn, formatDistanceToNowDate } from '@/lib/utils'
import { PurchaseType } from '@/models/purchase'
import { statuses } from './statuses'

type StatusKey = keyof typeof statuses

export function Status({ purchase }: { purchase: PurchaseType }) {
  const address = purchase.addresses
  const currentStatus = statuses[purchase.status as StatusKey]

  return (
    <Card className="flex flex-col items-start gap-2 p-4">
      <header className="w-full flex flex-row items-start justify-between">
        <Badge className={cn(currentStatus.color)}>
          {currentStatus.status}
        </Badge>
        <span className="text-xs text-muted-foreground">
          Atualizado há {formatDistanceToNowDate(purchase.updated_at)}
        </span>
      </header>

      <strong>{currentStatus.next_step}</strong>

      <p className="text-muted-foreground">
        {currentStatus.delivery_address} na {address?.street}, {address?.number}
        {address?.complement && `, ${address?.complement}`} -{' '}
        {address?.neighborhood} - {address?.city}/{address?.state}
      </p>
    </Card>
  )
}
