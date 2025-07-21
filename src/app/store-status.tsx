'use client'

import { storeShouldBeOpen } from '@/actions/client/app/public_store/status'
import { usePublicStore } from '@/stores/public-store'
import { useMutation } from '@tanstack/react-query'
import { format, isAfter, isBefore, parse } from 'date-fns'

export function StoreStatus() {
  const { store } = usePublicStore()

  if (!store || store?.is_open_override) {
    return null
  }

  const now = new Date()
  const today = format(now, 'EEEE').toLowerCase() // Pega o dia da semana em inglês

  // Filtrar o horário de hoje
  const todayHours = store?.store_hours.find(
    (hour: any) => hour.day_of_week === today,
  )

  if (!todayHours) {
    return null // Se não houver horário cadastrado para hoje, não faz nada
  }

  const openTime = parse(todayHours.open_time, 'HH:mm:ss', now)
  const closeTime = parse(todayHours.close_time, 'HH:mm:ss', now)

  // Verifica se a loja deveria estar aberta ou fechada
  const shouldBeOpen = isAfter(now, openTime) && isBefore(now, closeTime)

  // Se o status atual estiver incorreto, atualiza no Supabase
  if (shouldBeOpen !== store?.is_open) {
    useMutation({
      mutationKey: ['store-status'],
      mutationFn: () => storeShouldBeOpen(shouldBeOpen, store.id),
      onError: () => console.error('Erro ao atualizar status da loja'),
    })
  }

  return null
}
