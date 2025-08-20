'use client'

import { Store } from '@/features/store/initial-data/schemas'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { StoreStatus } from './calculate'
import { useStoreStatus } from './hooks'

interface StatusProps {
  store: Store | null
  initialStatus?: StoreStatus
}

export function Status({ store, initialStatus }: StatusProps) {
  const { status } = useStoreStatus(store, {
    enableRealTime: true,
    enableRealtimeSubscription: true,
    initialStatus,
  })

  const { isOpen, minutesToClose, nextOpening, isManuallyOverridden } = status

  return (
    <span className="flex items-center text-sm gap-1 text-muted-foreground">
      <strong
        className="uppercase data-[isopen=true]:text-emerald-600 data-[isopen=false]:text-red-600
          data-[hurry=true]:text-amber-600 data-[manual=true]:opacity-75"
        data-isopen={isOpen}
        data-hurry={minutesToClose !== null && minutesToClose <= 15}
        data-manual={isManuallyOverridden}
      >
        {isOpen ? 'Aberta' : 'Fechada'} agora
      </strong>

      {isOpen && minutesToClose !== null && minutesToClose <= 30 && (
        <>
          &bull;
          <span className="text-xs">Fecha em {minutesToClose}min</span>
        </>
      )}

      {!isOpen && nextOpening && !isManuallyOverridden && (
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
