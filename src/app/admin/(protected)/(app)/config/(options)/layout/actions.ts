'use server'

import { adminProcedure } from '@/lib/zsa-procedures'
import { StoreType } from '@/models/store'
import { cache } from 'react'
import { appearenceFormSchema } from './schemas'

export const readStore = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { store } = ctx

    return { store: store as StoreType }
  })

export const readStoreHours = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { store, supabase } = ctx

    const { data: hours, error: readHoursError } = await supabase
      .from('store_hours')
      .select('*')
      .eq('store_id', store?.id)

    if (readHoursError) {
      return { hours: null, readHoursError }
    }

    // Ordem dos dias da semana para referência
    const dayOrder = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ]

    // Ordenar os horários com base na referência
    const sortedHours = hours?.sort(
      (a, b) =>
        dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week),
    )

    return { hours: sortedHours, readHoursError: null }
  })

export const updateStoreTheme = adminProcedure
  .createServerAction()
  .input(appearenceFormSchema)
  .handler(async ({ ctx, input }) => {
    const { store, supabase } = ctx

    const { error } = await supabase
      .from('stores')
      .update({
        theme_color: input.theme_color,
        theme_mode: input.theme_mode,
      })
      .eq('id', store.id)

    if (error) {
      console.error('Erro ao atualizar tema da loja:', error)
    }
  })

export const readStoreHoursCached = cache(readStoreHours)
export const readStoreCached = cache(readStore)
