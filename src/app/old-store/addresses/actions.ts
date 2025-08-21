import { createClient } from '@/lib/supabase/server'
import { AddressType } from '@/models/address'

export async function readAddress(): Promise<{
  address: AddressType | null
  addressError: any | null
}> {
  const supabase = createClient()

  const { data: session } = await supabase.auth.getUser()

  const { data: address, error: addressError } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', session.user?.id)
    .single()

  return { address, addressError }
}
