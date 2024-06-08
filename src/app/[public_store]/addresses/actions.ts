import { createClient } from '@/lib/supabase/server'
import { AddressType } from '@/models/user'

export async function readAddresses(): Promise<{
  addresses: AddressType[] | null
  addressesError: any | []
}> {
  const supabase = createClient()

  const { data: session } = await supabase.auth.getUser()

  const { data: addresses, error: addressesError } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', session.user?.id)

  return { addresses, addressesError }
}
