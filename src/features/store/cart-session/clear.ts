'use server'

import { createClient } from '@/lib/supabase/server'

export async function clearCartSession(cartSessionId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('cart_sessions')
    .delete()
    .eq('session_id', cartSessionId)

  if (error) {
    throw new Error(error.message)
  }
}
