import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn, formatDistanceToNowDate } from '@/lib/utils'
import { PurchaseType } from '@/models/purchase'
import { statuses } from '@/models/statuses'
import { createStripeCheckout } from '../../checkout/actions'

export type StatusKey = keyof typeof statuses

export function Status({
  purchase,
  storeName,
}: {
  purchase: PurchaseType
  storeName: string
}) {
  const address = purchase.addresses
  const currentStatus = statuses[purchase.status as StatusKey]

  async function handleCreateStripeCheckout() {
    'use server'
    await createStripeCheckout(storeName, purchase.id)
  }

  return (
    <Card className="flex flex-col items-start gap-2 p-4">
      <header className="w-full flex flex-col items-start justify-between gap-2">
        <Badge className={cn(currentStatus.color)}>
          {currentStatus.status}
        </Badge>
        <span className="text-xs text-muted-foreground">
          Atualizado há {formatDistanceToNowDate(purchase.updated_at)}
        </span>
      </header>

      <strong>{currentStatus.next_step}</strong>

      {purchase.status === 'pending' && (
        <form action={handleCreateStripeCheckout} className="flex w-full">
          <Button className="w-full">Continuar para pagamento</Button>
        </form>
      )}
    </Card>
  )
}
