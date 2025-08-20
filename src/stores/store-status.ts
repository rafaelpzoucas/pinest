import {
  calculateStoreStatus,
  StoreStatus,
} from '@/app/v2/[store_slug]/(status)/calculate'
import { Store } from '@/features/store/initial-data/schemas'
import { createClient } from '@/lib/supabase/client'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface StoreStatusState {
  // Estado
  currentStore: Store | null
  status: StoreStatus
  isLoading: boolean
  error: string | null

  // Configurações
  enableRealTime: boolean
  enableRealtimeSubscription: boolean

  // Controles internos
  intervalId: NodeJS.Timeout | null
  supabaseChannel: any | null

  // Actions
  setStore: (store: Store | null) => void
  updateStatus: () => void
  setRealTimeEnabled: (enabled: boolean) => void
  setRealtimeSubscriptionEnabled: (enabled: boolean) => void
  reset: () => void

  // Funções utilitárias
  getStoreStatus: (store?: Store | null) => StoreStatus
}

const initialStatus: StoreStatus = {
  isOpen: false,
  minutesToClose: null,
  nextOpening: null,
  isManuallyOverridden: false,
}

export const useStoreStatusStore = create<StoreStatusState>()(
  subscribeWithSelector((set, get) => ({
    // Estado inicial
    currentStore: null,
    status: initialStatus,
    isLoading: false,
    error: null,
    enableRealTime: false,
    enableRealtimeSubscription: false,
    intervalId: null,
    supabaseChannel: null,

    // Função para definir a loja atual
    setStore: (store) => {
      const state = get()

      // Limpa recursos anteriores se mudar de loja
      if (state.currentStore?.id !== store?.id) {
        if (state.intervalId) {
          clearInterval(state.intervalId)
        }
        if (state.supabaseChannel) {
          const supabase = createClient()
          supabase.removeChannel(state.supabaseChannel)
        }
      }

      set({
        currentStore: store,
        intervalId: null,
        supabaseChannel: null,
      })

      // Recalcula o status imediatamente
      get().updateStatus()
    },

    // Função para atualizar o status
    updateStatus: () => {
      const { currentStore } = get()
      const newStatus = calculateStoreStatus(currentStore)
      set({ status: newStatus })
    },

    // Função para habilitar/desabilitar tempo real
    setRealTimeEnabled: (enabled) => {
      const state = get()

      if (!enabled && state.intervalId) {
        clearInterval(state.intervalId)
        set({ intervalId: null })
      }

      set({ enableRealTime: enabled })
    },

    // Função para habilitar/desabilitar subscription realtime
    setRealtimeSubscriptionEnabled: (enabled) => {
      const state = get()

      if (!enabled && state.supabaseChannel) {
        const supabase = createClient()
        supabase.removeChannel(state.supabaseChannel)
        set({ supabaseChannel: null })
      }

      set({ enableRealtimeSubscription: enabled })
    },

    // Função para resetar tudo
    reset: () => {
      const state = get()

      if (state.intervalId) {
        clearInterval(state.intervalId)
      }
      if (state.supabaseChannel) {
        const supabase = createClient()
        supabase.removeChannel(state.supabaseChannel)
      }

      set({
        currentStore: null,
        status: initialStatus,
        isLoading: false,
        error: null,
        enableRealTime: false,
        enableRealtimeSubscription: false,
        intervalId: null,
        supabaseChannel: null,
      })
    },

    // Função utilitária para calcular status sem afetar o estado
    getStoreStatus: (store) => {
      return calculateStoreStatus(store || get().currentStore)
    },
  })),
)
