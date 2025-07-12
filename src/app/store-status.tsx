import { createClient } from '@/lib/supabase/server'
import { format, isAfter, isBefore, parse } from 'date-fns'
import { readStoreCached } from './[public_store]/actions'

export async function StoreStatus() {
  try {
    const supabase = createClient()

    const [storeData] = await readStoreCached()

    const store = storeData?.store

    if (!store || store?.is_open_override) {
      return null
    }

    const now = new Date()
    const today = format(now, 'EEEE').toLowerCase() // Pega o dia da semana em inglês

    // Filtrar o horário de hoje
    const todayHours = store?.store_hours.find(
      (hour: any) => hour.day_of_week === today,
    )

    if (!todayHours) return null // Se não houver horário cadastrado para hoje, não faz nada

    const openTime = parse(todayHours.open_time, 'HH:mm:ss', now)
    const closeTime = parse(todayHours.close_time, 'HH:mm:ss', now)

    // Verifica se a loja deveria estar aberta ou fechada
    const shouldBeOpen = isAfter(now, openTime) && isBefore(now, closeTime)

    // Se o status atual estiver incorreto, atualiza no Supabase
    if (shouldBeOpen !== store?.is_open) {
      const { error: updateError } = await supabase
        .from('stores')
        .update({ is_open: shouldBeOpen })
        .eq('id', store?.id)

      if (updateError) {
        console.error('Erro ao atualizar status da loja:', updateError)
      }
    }

    return null
  } catch (error) {
    console.error('Erro ao verificar status da loja:', error)
    return null
  }
}
