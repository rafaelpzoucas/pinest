'use client'

import { storeShouldBeOpen } from '@/actions/client/app/public_store/status'
import { usePublicStore } from '@/stores/public-store'
import { useMutation } from '@tanstack/react-query'
import {
  differenceInMilliseconds,
  format,
  isAfter,
  isBefore,
  parse,
} from 'date-fns'
import { useCallback, useEffect, useRef } from 'react'

export function StoreStatus() {
  const { store } = usePublicStore()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  console.log({ store }, 'Status')

  const { mutateAsync: updateStoreStatus } = useMutation({
    mutationKey: ['store-status'],
    mutationFn: (shouldBeOpen: boolean) =>
      storeShouldBeOpen(shouldBeOpen, store?.id),
    onError: () => console.error('Erro ao atualizar status da loja'),
  })

  const checkStoreStatus = useCallback(() => {
    if (!store || store?.is_open_override) return

    const now = new Date()
    const today = format(now, 'EEEE').toLowerCase()
    const todayHours = store?.store_hours.find(
      (hour: any) => hour.day_of_week === today,
    )

    console.log({ todayHours })
    if (!todayHours) return

    const openTime = parse(todayHours.open_time, 'HH:mm:ss', now)
    const closeTime = parse(todayHours.close_time, 'HH:mm:ss', now)
    const shouldBeOpen = isAfter(now, openTime) && isBefore(now, closeTime)

    console.log({ now, openTime, closeTime, shouldBeOpen })

    if (shouldBeOpen !== store?.is_open) {
      updateStoreStatus(shouldBeOpen)
    }

    return { shouldBeOpen, openTime, closeTime, now }
  }, [store, updateStoreStatus])

  const scheduleNextCheck = useCallback(() => {
    if (!store || store?.is_open_override) return

    const now = new Date()
    const today = format(now, 'EEEE').toLowerCase()
    const todayHours = store?.store_hours.find(
      (hour: any) => hour.day_of_week === today,
    )

    if (!todayHours) return

    const openTime = parse(todayHours.open_time, 'HH:mm:ss', now)
    const closeTime = parse(todayHours.close_time, 'HH:mm:ss', now)

    let nextCheckTime: Date | null = null

    // Se a loja está fechada e ainda não abriu hoje
    if (isBefore(now, openTime)) {
      nextCheckTime = openTime
    }
    // Se a loja está aberta e ainda não fechou hoje
    else if (isBefore(now, closeTime)) {
      nextCheckTime = closeTime
    }

    if (nextCheckTime) {
      const msUntilNextCheck = differenceInMilliseconds(nextCheckTime, now)

      // Adiciona 1 segundo extra para garantir que passou do horário exato
      const timeoutMs = msUntilNextCheck + 1000

      console.log(
        `Próxima verificação em ${Math.round(timeoutMs / 1000)} segundos`,
      )

      timeoutRef.current = setTimeout(() => {
        checkStoreStatus()
        scheduleNextCheck()
      }, timeoutMs)
    }
  }, [store, checkStoreStatus])

  useEffect(() => {
    // Limpa intervalos e timeouts anteriores
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (!store || store?.is_open_override) return

    // Verificação initial
    checkStoreStatus()

    // Agenda a próxima verificação baseada no horário de funcionamento
    scheduleNextCheck()

    // Verificação a cada minuto como fallback
    intervalRef.current = setInterval(checkStoreStatus, 60000)

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [store, checkStoreStatus, scheduleNextCheck])

  return null
}
