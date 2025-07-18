import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { subscribeSchema } from '../schemas'

export async function POST(req: Request) {
  const json = await req.json()
  const parsed = subscribeSchema.safeParse(json)

  const data = parsed.data

  if (!parsed.success || !data) {
    return new NextResponse('Invalid input', { status: 400 })
  }

  const supabase = createClient()

  await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', data.subscription.endpoint)

  const { error } = await supabase.from('push_subscriptions').insert({
    endpoint: data.subscription.endpoint,
    keys: data.subscription.keys,
    store_id: data.storeId ?? null,
    customer_phone: data.customerPhone ?? null,
  })

  if (error) throw new Error(error.message)

  return NextResponse.json({ status: 200 })
}
