'use client'

import { LoadingBar } from '@/components/loading-bar'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNowDate } from '@/lib/utils'
import { PurchaseType } from '@/models/purchase'
import { statuses } from '@/models/statuses'
import { addMinutes, format } from 'date-fns'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { StatusKey } from './status'

export function RealtimeStatus({ purchase }: { purchase: PurchaseType }) {
  const supabase = createClient()
  const router = useRouter()

  const currentStatus = statuses[purchase.status as StatusKey]

  useEffect(() => {
    const channel = supabase
      .channel('realtime-purchases')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'purchases',
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

  const isAccepted = purchase.status !== 'accept'
  const isPreparing = purchase.status === 'preparing'
  const isShipped = purchase.status === 'shipped'
  const isDelivered = purchase.status === 'delivered'
  const isReadyToPickup = purchase.status === 'readyToPickup'
  const isCancelled = purchase.status === 'cancelled'

  const deliveryTime = addMinutes(
    purchase.created_at,
    Number(purchase.delivery.time),
  )

  return (
    <Card className="flex flex-col items-start gap-2 p-4 space-y-4">
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
          <h2 className="text-xl">
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
            Atualizado há {formatDistanceToNowDate(purchase.updated_at)}
          </span>
        )}
      </div>
    </Card>
  )
}
