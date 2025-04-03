'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { cn, formatDistanceToNowDate } from '@/lib/utils'
import { PurchaseType } from '@/models/purchase'
import { statuses } from '@/models/statuses'
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
    </Card>
  )
}
