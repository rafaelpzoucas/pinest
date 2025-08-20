import { Store } from '@/features/store/initial-data/schemas'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { calculateStoreStatus, StoreStatus } from './calculate'

interface UseStoreStatusOptions {
  /**
   * Habilita atualizações automáticas a cada minuto
   * @default false
   */
  enableRealTime?: boolean
  /**
   * Habilita escuta de mudanças via Supabase realtime
   * @default false
   */
  enableRealtimeSubscription?: boolean
  /**
   * Status inicial calculado no servidor (para hidratação)
   */
  initialStatus?: StoreStatus
}

/**
 * Hook para calcular e gerenciar o status de abertura de uma loja
 * Considera horários de funcionamento, fechamento manual (is_open) e override manual (is_open_override)
 */
export function useStoreStatus(
  store: Store | null,
  options: UseStoreStatusOptions = {},
) {
  const {
    enableRealTime = false,
    enableRealtimeSubscription = false,
    initialStatus,
  } = options

  const supabase = createClient()
  const router = useRouter()

  const [status, setStatus] = useState<StoreStatus>(
    initialStatus || {
      isOpen: false,
      minutesToClose: null,
      nextOpening: null,
      isManuallyOverridden: false,
    },
  )

  const updateStatus = useCallback(() => {
    const newStatus = calculateStoreStatus(store)
    setStatus(newStatus)
  }, [store])

  // Efeito para atualizações automáticas (tempo real)
  useEffect(() => {
    if (!enableRealTime) return

    // Executa imediatamente se não temos status inicial
    if (!initialStatus) {
      updateStatus()
    }

    // Configura intervalo para atualizações
    const interval = setInterval(updateStatus, 60_000)
    return () => clearInterval(interval)
  }, [enableRealTime, initialStatus, updateStatus])

  // Efeito para subscição realtime do Supabase
  useEffect(() => {
    if (!enableRealtimeSubscription || !store?.id) return

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
  }, [enableRealtimeSubscription, store?.id, router, supabase])

  // Função para cálculo manual (útil para uso sem estado)
  const getStoreStatus = useCallback(() => calculateStoreStatus(store), [store])

  return {
    status,
    getStoreStatus,
    updateStatus,
  }
}
