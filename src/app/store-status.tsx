'use client'

import { storeShouldBeOpen } from '@/actions/client/app/public_store/status'
import { usePublicStore } from '@/stores/public-store'
import { useMutation } from '@tanstack/react-query'
import { format, isAfter, isBefore, parse } from 'date-fns'
import { useEffect } from 'react'

export function StoreStatus() {
  const { store } = usePublicStore()

  const { mutateAsync: updateStoreStatus } = useMutation({
    mutationKey: ['store-status'],
    mutationFn: (shouldBeOpen: boolean) =>
      storeShouldBeOpen(shouldBeOpen, store?.id),
    onError: () => console.error('Erro ao atualizar status da loja'),
  })

  useEffect(() => {
    if (!store || store?.is_open_override) return

    const now = new Date()
    const today = format(now, 'EEEE').toLowerCase()
    const todayHours = store?.store_hours.find(
      (hour: any) => hour.day_of_week === today,
    )
    if (!todayHours) return

    const openTime = parse(todayHours.open_time, 'HH:mm:ss', now)
    const closeTime = parse(todayHours.close_time, 'HH:mm:ss', now)
    const shouldBeOpen = isAfter(now, openTime) && isBefore(now, closeTime)

    if (shouldBeOpen !== store?.is_open) {
      updateStoreStatus(shouldBeOpen)
    }
  }, [store, updateStoreStatus])

  return null
}
