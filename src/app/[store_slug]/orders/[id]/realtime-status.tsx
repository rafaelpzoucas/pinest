'use client'

import { LoadingBar } from '@/components/loading-bar'
import { Card } from '@/components/ui/card'
import { Order } from '@/features/_global/orders/schemas'
import { useStoreNotifications } from '@/hooks/useStoreNotifications'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatDistanceToNowDate } from '@/lib/utils'
import { statuses } from '@/models/statuses'
import { addMinutes, format } from 'date-fns'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { StatusKey } from './status'

export function RealtimeStatus({
  order,
  customerPhone,
}: {
  order: Order
  customerPhone?: string
}) {
  const supabase = createClient()
  const router = useRouter()

  const currentStatus = statuses[order.status as StatusKey]

  useStoreNotifications({ customerPhone })

  useEffect(() => {
    const channel = supabase
      .channel('realtime-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          router.refresh()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, router])

  const isAccepted = order.status !== 'accept'
  const isPreparing = order.status === 'preparing'
  const isShipped = order.status === 'shipped'
  const isDelivered = order.status === 'delivered'
  const isReadyToPickup = order.status === 'readyToPickup'
  const isCancelled = order.status === 'cancelled'

  const deliveryTime = addMinutes(order.created_at, Number(order.delivery.time))

  return (
    <Card className="flex flex-col items-start gap-2 p-4 space-y-4">
      <span className="text-muted-foreground">
        {order && formatDate(order?.created_at, 'dd/MM HH:mm:ss')}
      </span>

      {isCancelled && (
        <div className="flex flex-row gap-2 text-destructive">
          <XCircle />
          <h2 className="text-xl font-bold">Pedido cancelado.</h2>
        </div>
      )}
      {isDelivered && (
        <div className="flex flex-row gap-2">
          <CheckCircle2 />
          <h2 className="text-xl font-bold">Seu pedido chegou!</h2>
        </div>
      )}
      {!isCancelled && !isDelivered && (
        <div>
          <span>Previsão de entrega</span>
          <h2 className="text-xl font-bold">
            {format(deliveryTime, 'HH:mm')} -{' '}
            {format(addMinutes(deliveryTime, 10), 'HH:mm')}
          </h2>
        </div>
      )}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-row w-full space-x-2">
          <LoadingBar
            stop={isAccepted || isCancelled}
            isLoading={!isAccepted}
          />
          <LoadingBar
            stop={isShipped || isDelivered || isReadyToPickup || isCancelled}
            isLoading={isPreparing}
          />
          <LoadingBar
            stop={isDelivered || isCancelled}
            isLoading={isShipped || isReadyToPickup}
          />
        </div>
        <strong>{currentStatus.next_step}</strong>
        {!isDelivered && (
          <span className="text-xs text-muted-foreground">
            Atualizado há {formatDistanceToNowDate(order.updated_at)}
          </span>
        )}
      </div>
    </Card>
  )
}
