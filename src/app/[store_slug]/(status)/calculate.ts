import { Store } from '@/features/store/initial-data/schemas'
import { addDays, differenceInMinutes, isAfter, isBefore, set } from 'date-fns'

export interface StoreStatus {
  isOpen: boolean
  minutesToClose: number | null
  nextOpening: {
    date: Date
    sameDay: boolean
  } | null
  isManuallyOverridden: boolean
}

/**
 * Calcula o status da loja considerando horários de funcionamento e overrides manuais
 * Pode ser usada tanto no cliente quanto no servidor
 */
export function calculateStoreStatus(store: Store | null): StoreStatus {
  if (!store) {
    return {
      isOpen: false,
      minutesToClose: null,
      nextOpening: null,
      isManuallyOverridden: false,
    }
  }

  // Verifica override manual primeiro (maior prioridade)
  if (store.is_open_override !== null) {
    return {
      isOpen: store.is_open_override,
      minutesToClose: null,
      nextOpening: store.is_open_override
        ? null
        : findNextOpening(new Date(), store.store_hours),
      isManuallyOverridden: true,
    }
  }

  // Verifica fechamento manual
  if (store.is_open === false) {
    return {
      isOpen: false,
      minutesToClose: null,
      nextOpening: findNextOpening(new Date(), store.store_hours),
      isManuallyOverridden: true,
    }
  }

  // Se não há horários configurados
  if (!store.store_hours || store.store_hours.length === 0) {
    return {
      isOpen: false,
      minutesToClose: null,
      nextOpening: null,
      isManuallyOverridden: false,
    }
  }

  // Calcula baseado nos horários de funcionamento
  return calculateStoreStatusByHours(store)
}

/**
 * Calcula o status baseado apenas nos horários de funcionamento
 */
function calculateStoreStatusByHours(store: Store): StoreStatus {
  const now = new Date()
  const dayOfWeek = now
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase()

  const todayHours = store.store_hours?.find(
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
        isManuallyOverridden: false,
      }
    }

    // Depois do fechamento
    if (isAfter(now, closeDate)) {
      return {
        isOpen: false,
        minutesToClose: null,
        nextOpening: findNextOpening(now, store.store_hours),
        isManuallyOverridden: false,
      }
    }

    // Aberta agora
    const diff = differenceInMinutes(closeDate, now)
    return {
      isOpen: diff > 0,
      minutesToClose: diff >= 0 ? diff : null,
      nextOpening: null,
      isManuallyOverridden: false,
    }
  }

  // Hoje não abre → pega próximo dia
  return {
    isOpen: false,
    minutesToClose: null,
    nextOpening: findNextOpening(now, store.store_hours),
    isManuallyOverridden: false,
  }
}

/**
 * Encontra a próxima data de abertura da loja
 */
function findNextOpening(
  start: Date,
  hours: Store['store_hours'],
): { date: Date; sameDay: boolean } | null {
  if (!hours) return null

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
