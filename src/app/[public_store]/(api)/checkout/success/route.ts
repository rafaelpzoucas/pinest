import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createClient()

  const requestUrl = new URL(request.url)
  const storeName = requestUrl.searchParams.get('store-name')
  const purchaseId = requestUrl.searchParams.get('purchase')
  const origin = requestUrl.origin

  const { error } = await supabase
    .from('purchases')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', purchaseId)
    .select('*')

  if (error) {
    console.error(error)
  }

  cookies().delete('pinest_cart')

  revalidatePath('/purchases')

  return NextResponse.redirect(`${origin}/${storeName}/purchases?callback=home`)
}
