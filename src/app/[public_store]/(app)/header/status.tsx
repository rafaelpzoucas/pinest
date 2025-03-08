'use client'

import { createClient } from '@/lib/supabase/client'
import { StoreType } from '@/models/store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function Status({ store }: { store: StoreType }) {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const channel = supabase
      .channel(`store-status-${store.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'stores',
          filter: `id=eq.${store.id}`,
        },
        () => {
          router.refresh()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [store.id])

  return (
    <strong className="flex flex-row items-center text-xs w-fit mx-auto lg:mx-0">
      <div
        className="w-3 h-3 rounded-full mr-2 data-[isopen=true]:bg-emerald-600
          data-[isopen=false]:bg-red-600"
        data-isopen={store.is_open}
      ></div>
      Loja {store.is_open ? 'aberta' : 'fechada'}
    </strong>
  )
}
