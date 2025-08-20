'use client'

import { Store } from '@/features/store/initial-data/schemas'

import { useStoreStatusStore } from '@/stores/store-status'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import { StoreStatus } from './calculate'
import { useStoreStatus, useStoreStatusEffects } from './hooks'

interface StatusProps {
  store: Store | null
  initialStatus?: StoreStatus
}

export function Status({ store, initialStatus }: StatusProps) {
  const { status, currentStore, setStore } = useStoreStatus()

  const { setRealTimeEnabled, setRealtimeSubscriptionEnabled } =
    useStoreStatusEffects()

  // Estado local para controlar se já inicializamos
  const [isInitialized, setIsInitialized] = useState(false)

  // Inicialização da store
  useEffect(() => {
    if (!isInitialized) {
      // Se temos um initialStatus, define ele antes de definir a store
      if (initialStatus && store) {
        useStoreStatusStore.setState({
          status: initialStatus,
          currentStore: store,
        })
      } else {
        setStore(store)
      }

      // Habilita recursos de tempo real
      setRealTimeEnabled(true)
      setRealtimeSubscriptionEnabled(true)

      setIsInitialized(true)
    } else if (currentStore?.id !== store?.id) {
      // Se a loja mudou depois da inicialização
      setStore(store)
    }
  }, [
    store,
    initialStatus,
    isInitialized,
    currentStore,
    setStore,
    setRealTimeEnabled,
    setRealtimeSubscriptionEnabled,
  ])

  // Usa initialStatus enquanto não carregou da store (para evitar flash)
  const displayStatus = isInitialized ? status : initialStatus || status
  const { isOpen, minutesToClose, nextOpening, isManuallyOverridden } =
    displayStatus

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
