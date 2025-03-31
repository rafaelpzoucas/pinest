'use client'

import { createClient } from '@/lib/supabase/client'
import { PurchaseType } from '@/models/purchase'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function RealtimeNotifications({
  purchases,
}: {
  purchases: PurchaseType[]
}) {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const hasPending = purchases.some(
      (purchase) => purchase.status === 'accept',
    )

    let interval: NodeJS.Timeout | null = null

    if (hasPending) {
      // Função que toca o som
      const playAudio = () => {
        const sound = new Audio('/new-order-notification.mp3')
        sound.play()
      }

      interval = setInterval(playAudio, 5000)

      playAudio()
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [purchases])

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

  return <></>
}
