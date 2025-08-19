'use client'

import { Store } from '@/features/store/initial-data/schemas'

import { createClient } from '@/lib/supabase/client'
import { StoreStatus } from '@/utils/store-status'
import {
  addDays,
  differenceInMinutes,
  format,
  isAfter,
  isBefore,
  set,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface StatusProps {
  store: Store | null
  initialStatus?: StoreStatus // <- Status inicial do servidor
}

export function Status({ store, initialStatus }: StatusProps) {
  const supabase = createClient()
  const router = useRouter()

  // Usa o status inicial do servidor como valor padrão
  const [minutesToClose, setMinutesToClose] = useState<number | null>(
    initialStatus?.minutesToClose ?? null,
  )
  const [isActuallyOpen, setIsActuallyOpen] = useState<boolean>(
    initialStatus?.isOpen ?? false,
  )
  const [nextOpening, setNextOpening] = useState<{
    date: Date
    sameDay: boolean
  } | null>(initialStatus?.nextOpening ?? null)

  const updateStatus = () => {
    if (!store?.store_hours) {
      setMinutesToClose(null)
      setIsActuallyOpen(false)
      setNextOpening(null)
      return
    }

    const now = new Date()
    const dayOfWeek = now
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase()

    const todayHours = store.store_hours.find(
      (h) => h.day_of_week?.toLowerCase() === dayOfWeek && h.is_open,
    )

    // Se hoje tem expediente
    if (todayHours?.open_time && todayHours?.close_time) {
      const [openH, openM, openS] = todayHours.open_time.split(':').map(Number)
      const [closeH, closeM, closeS] = todayHours.close_time
        .split(':')
        .map(Number)

      const openDate = set(now, {
        hours: openH,
        minutes: openM,
        seconds: openS || 0,
        milliseconds: 0,
      })

      const closeDate = set(now, {
        hours: closeH,
        minutes: closeM,
        seconds: closeS || 0,
        milliseconds: 0,
      })

      // Antes da abertura
      if (isBefore(now, openDate)) {
        setIsActuallyOpen(false)
        setMinutesToClose(null)
        setNextOpening({ date: openDate, sameDay: true })
        return
      }

      // Depois do fechamento
      if (isAfter(now, closeDate)) {
        setIsActuallyOpen(false)
        setMinutesToClose(null)
        setNextOpening(findNextOpening(now, store.store_hours))
        return
      }

      // Aberta agora
      const diff = differenceInMinutes(closeDate, now)
      setIsActuallyOpen(diff > 0)
      setMinutesToClose(diff >= 0 ? diff : null)
      setNextOpening(null)
      return
    }

    // Hoje não abre → pega próximo dia
    setIsActuallyOpen(false)
    setMinutesToClose(null)
    setNextOpening(findNextOpening(now, store.store_hours))
  }

  // Função para achar próximo dia de abertura
  const findNextOpening = (start: Date, hours: Store['store_hours']) => {
    for (let i = 1; i <= 7; i++) {
      const date = addDays(start, i)
      const dow = date
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toLowerCase()
      const dayHours = hours.find(
        (h) => h.day_of_week?.toLowerCase() === dow && h.is_open,
      )

      if (dayHours?.open_time) {
        const [h, m, s] = dayHours.open_time.split(':').map(Number)
        const openDate = set(date, {
          hours: h,
          minutes: m,
          seconds: s || 0,
          milliseconds: 0,
        })
        return { date: openDate, sameDay: false }
      }
    }
    return null
  }

  useEffect(() => {
    if (!store || initialStatus) {
      // Se temos status inicial, só configura o intervalo para updates futuros
      const interval = setInterval(updateStatus, 60_000)
      return () => clearInterval(interval)
    }

    // Se não temos status inicial, executa imediatamente e depois configura intervalo
    updateStatus()
    const interval = setInterval(updateStatus, 60_000)
    return () => clearInterval(interval)
  }, [store])

  useEffect(() => {
    if (!store?.id) return

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
  }, [store?.id])

  return (
    <span className="flex items-center text-sm gap-1 text-muted-foreground">
      <strong
        className="uppercase data-[isopen=true]:text-emerald-600 data-[isopen=false]:text-red-600
          data-[hurry=true]:text-amber-600"
        data-isopen={isActuallyOpen}
        data-hurry={minutesToClose !== null && minutesToClose <= 15}
      >
        {isActuallyOpen ? 'Aberta' : 'Fechada'} agora
      </strong>

      {isActuallyOpen && minutesToClose !== null && minutesToClose <= 30 && (
        <>
          &bull;
          <span className="text-xs">Fecha em {minutesToClose}min</span>
        </>
      )}

      {!isActuallyOpen && nextOpening && (
        <>
          &bull;
          <span className="text-xs">
            {nextOpening.sameDay
              ? `Abre às ${format(nextOpening.date, 'HH:mm')}`
              : `Abre ${format(nextOpening.date, "EEEE 'às' HH:mm", { locale: ptBR })}`}
          </span>
        </>
      )}
    </span>
  )
}
