import { createClient } from '@/lib/supabase/server'
import { format, isAfter, isBefore, parse } from 'date-fns'

export async function StoreStatus({ storeUrl }: { storeUrl: string }) {
  const supabase = createClient()

  // Buscar informações da loja e horários
  const { data: store, error: readStoreError } = await supabase
    .from('stores')
    .select(
      `
        *, 
        store_hours (*)
      `,
    )
    .eq('store_url', storeUrl)
    .single()

  if (readStoreError) {
    console.error('Erro ao buscar is_open da loja.', readStoreError)
    return null
  }

  if (store.is_open_override) {
    return null
  }

  const now = new Date()
  const today = format(now, 'EEEE').toLowerCase() // Pega o dia da semana em inglês

  // Filtrar o horário de hoje
  const todayHours = store.store_hours.find(
    (hour: any) => hour.day_of_week === today,
  )

  if (!todayHours) return null // Se não houver horário cadastrado para hoje, não faz nada

  const openTime = parse(todayHours.open_time, 'HH:mm:ss', now)
  const closeTime = parse(todayHours.close_time, 'HH:mm:ss', now)

  // Verifica se a loja deveria estar aberta ou fechada
  const shouldBeOpen = isAfter(now, openTime) && isBefore(now, closeTime)

  // Se o status atual estiver incorreto, atualiza no Supabase
  if (shouldBeOpen !== store.is_open) {
    const { error: updateError } = await supabase
      .from('stores')
      .update({ is_open: shouldBeOpen })
      .eq('id', store.id)

    if (updateError) {
      console.error('Erro ao atualizar status da loja:', updateError)
    }
  }

  return null
}
