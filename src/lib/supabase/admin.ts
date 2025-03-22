import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!, // ⚠️ NÃO EXPOE ESSA CHAVE NO FRONTEND!
    {
      auth: { persistSession: false },
    },
  )
}
