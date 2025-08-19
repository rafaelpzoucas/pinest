import { Store } from '@/features/store/initial-data/schemas'
import { addDays, differenceInMinutes, isAfter, isBefore, set } from 'date-fns'

export interface StoreStatus {
  isOpen: boolean
  minutesToClose: number | null
  nextOpening: {
    date: Date
    sameDay: boolean
  } | null
}

export function calculateStoreStatus(store: Store | null): StoreStatus {
  if (!store?.store_hours) {
    return {
      isOpen: false,
      minutesToClose: null,
      nextOpening: null,
    }
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
      return {
        isOpen: false,
        minutesToClose: null,
        nextOpening: { date: openDate, sameDay: true },
      }
    }

    // Depois do fechamento
    if (isAfter(now, closeDate)) {
      return {
        isOpen: false,
        minutesToClose: null,
        nextOpening: findNextOpening(now, store.store_hours),
      }
    }

    // Aberta agora
    const diff = differenceInMinutes(closeDate, now)
    return {
      isOpen: diff > 0,
      minutesToClose: diff >= 0 ? diff : null,
      nextOpening: null,
    }
  }

  // Hoje não abre → pega próximo dia
  return {
    isOpen: false,
    minutesToClose: null,
    nextOpening: findNextOpening(now, store.store_hours),
  }
}

function findNextOpening(start: Date, hours: Store['store_hours']) {
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
