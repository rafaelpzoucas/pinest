import { createClient } from '@/lib/supabase/server'
import { PurchaseType } from '@/models/purchase'
import { endOfDay, startOfDay } from 'date-fns'

export async function getTotalPurchasesOfToday(): Promise<{
  purchases: PurchaseType[] | null
  purchasesError: any | null
  purchasesCount: number | null
}> {
  const supabase = createClient()

  const todayStart = startOfDay(new Date()).toISOString()
  const todayEnd = endOfDay(new Date()).toISOString()

  const {
    data: purchases,
    error: purchasesError,
    count: purchasesCount,
  } = await supabase
    .from('purchases')
    .select(
      `
      *,
      purchase_items (*)
    `,
      { count: 'exact' },
    )
    .gte('created_at', todayStart)
    .lte('created_at', todayEnd)

  return { purchases, purchasesCount, purchasesError }
}
