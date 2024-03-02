import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import { OrderDataType } from './orders'

import Link from 'next/link'

type OrderCardPropsType = {
  order: OrderDataType
}

export function OrderCard({ order }: OrderCardPropsType) {
  return (
    <Link href="/orders/id_da_order">
      <Card
        key={order.id}
        className={cn(
          'p-4',
          order.status === 'waiting' && 'bg-primary text-primary-foreground',
        )}
      >
        <header className="flex flex-row">
          <strong>
            {order.customer_name}{' '}
            <span
              className={cn(
                'text-xs text-muted-foreground font-normal',
                order.status === 'waiting' &&
                  'bg-primary text-primary-foreground',
              )}
            >
              #{order.order_id}
            </span>
          </strong>

          <span
            className={cn(
              'text-xs text-muted-foreground ml-auto',
              order.status === 'waiting' && 'text-muted',
            )}
          >
            {order.created_at}
          </span>

          <ChevronRight className="w-4 h-4 ml-2" />
        </header>

        <section
          className={cn(
            'pr-1 text-xs mt-2 space-y-1 text-muted-foreground',
            order.status === 'waiting' && 'bg-primary text-primary-foreground',
          )}
        >
          <div className="flex flex-row justify-between">
            <span>Forma de pagamento</span>
            <strong>{order.payment_type}</strong>
          </div>

          <div className="flex flex-row justify-between">
            <span>Frete</span>
            <strong>
              {order.delivery_price > 0
                ? new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(order.delivery_price)
                : 'Grátis'}
            </strong>
          </div>

          <div className="flex flex-row justify-between">
            <span>4 produtos</span>
            <strong>
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(order.total_amount)}
            </strong>
          </div>
        </section>
      </Card>
    </Link>
  )
}
