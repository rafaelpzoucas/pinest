import { createClient } from '@/lib/supabase/server'
import webpush from '@/lib/webpush'
import { NextResponse } from 'next/server'
import { notifyStoreSchema } from '../schemas'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  let json: any

  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = notifyStoreSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: parsed.error.format() },
      { status: 400 },
    )
  }

  const { description, storeId, title, customerPhone, url } = parsed.data
  const supabase = createClient()

  const { data: subscriptions, error: subError } = await supabase
    .from('push_subscriptions')
    .select('*')
    .or(`store_id.eq.${storeId},customer_phone.eq.${customerPhone}`)

  if (subError) {
    return NextResponse.json(
      { error: 'Erro ao buscar subscriptions', details: subError.message },
      { status: 500 },
    )
  }

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json(
      { error: 'Nenhuma subscription encontrada' },
      { status: 404 },
    )
  }

  const errors: any[] = []

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        sub,
        JSON.stringify({ title, description, url }),
      )
    } catch (err: any) {
      errors.push({
        endpoint: sub.endpoint,
        message: err?.message,
      })

      if (err.statusCode === 410) {
        const { error: deleteError } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', sub.endpoint)

        if (deleteError) {
          errors.push({
            endpoint: sub.endpoint,
            message: 'Erro ao remover subscription inválida',
            details: deleteError.message,
          })
        }
      }
    }
  }

  if (errors.length > 0) {
    return NextResponse.json(
      {
        success: false,
        message: 'Algumas notificações falharam',
        errors,
      },
      { status: 207 }, // 207 Multi-Status (parcialmente bem-sucedido)
    )
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
