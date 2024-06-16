import { Card } from '@/components/ui/card'
import { cn, formatDistanceToNowDate } from '@/lib/utils'
import { PurchaseType } from '@/models/purchase'
import { ChevronRight } from 'lucide-react'

import Link from 'next/link'

type PurchaseCardPropsType = {
  purchase: PurchaseType
}

export function PurchaseCard({ purchase }: PurchaseCardPropsType) {
  const customer = purchase.customers.users

  const customerNames = customer.name.split(' ')
  const firstName = customerNames[0]
  const lastName = customerNames[customerNames.length - 1]

  console.log(customer)

  return (
    <Link href={`purchases/${purchase.id}`}>
      <Card
        key={purchase.id}
        className={cn(
          'p-4',
          purchase.status === 'waiting' && 'bg-primary text-primary-foreground',
        )}
      >
        <header className="flex flex-row">
          <strong>{`${firstName} ${lastName}`}</strong>

          <span
            className={cn(
              'text-xs text-muted-foreground ml-auto whitespace-nowrap',
              purchase.status === 'waiting' && 'text-muted',
            )}
          >
            há {formatDistanceToNowDate(purchase.created_at)}
          </span>

          <ChevronRight className="w-4 h-4 ml-2" />
        </header>

        <section
          className={cn(
            'pr-1 text-xs mt-2 space-y-1 text-muted-foreground',
            purchase.status === 'waiting' &&
              'bg-primary text-primary-foreground',
          )}
        >
          <div className="flex flex-row justify-between">
            <span>Frete</span>
            <strong>Grátis</strong>
          </div>

          <div className="flex flex-row justify-between">
            <span>{purchase.purchase_items.length} produto(s)</span>
            <strong>
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(purchase.total_amount)}
            </strong>
          </div>
        </section>
      </Card>
    </Link>
  )
}
