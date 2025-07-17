'use client'

import { useStoreNotifications } from '@/hooks/useStoreNotifications'
import { createClient } from '@/lib/supabase/client'
import { PurchaseType } from '@/models/purchase'
import { StoreType } from '@/models/store'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export function RealtimeNotifications({
  purchases,
  store,
}: {
  purchases: PurchaseType[]
  store: StoreType | null
}) {
  const supabase = createClient()
  const router = useRouter()
  const [canPlay, setCanPlay] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useStoreNotifications({ storeId: store?.id })

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          console.log('Permissão para notificações:', permission)
          if (permission === 'granted') {
            // você pode registrar o service worker aqui, se ainda não tiver feito
          }
        })
      }
    }

    const hasPending = purchases.some(
      (purchase) => purchase.status === 'accept',
    )

    // Função que toca o som com debounce
    const playAudio = () => {
      if (!canPlay) return
      const sound = new Audio('/new-order-notification.mp3')
      sound.play()
      setCanPlay(false)
      timeoutRef.current = setTimeout(() => {
        setCanPlay(true)
      }, 10000)
    }

    let interval: NodeJS.Timeout | null = null

    if (hasPending) {
      interval = setInterval(playAudio, 10000)
      playAudio()
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [purchases, canPlay])

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
