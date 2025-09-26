import { readStoreById } from '@/app/admin/(protected)/(app)/config/(options)/layout/register/store/actions'
import { readOrderById } from '@/app/old-store/orders/[id]/actions'
import { createClient } from '@/lib/supabase/server'
import { ProdutoType, RequestSolicitarType } from '@/models/kangu-shipping'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

async function updateOrderTrackingCode(orderId: string, trackingCode: string) {
  const supabse = createClient()

  const { error: updateTrackingCodeError } = await supabse
    .from('orders')
    .update({ tracking_code: trackingCode })
    .eq('id', orderId)

  return { updateTrackingCodeError }
}

async function solicitShipping(orderId: string) {
  const [orderData] = await readOrderById({ orderId })

  const order = orderData?.order

  if (!order) return

  const { store } = await readStoreById(order.store_id)

  if (!store) return

  const produtos = order?.order_items.map((item) => {
    if (!item.products) return null

    return {
      peso: item.products.pkg_weight,
      altura: item.products.pkg_height,
      largura: item.products.pkg_width,
      comprimento: item.products.pkg_length,
      valor: item.products.price,
      produto: item.products.name,
    }
  }) as unknown as ProdutoType[]

  const remetente = {
    nome: store.name,
    cnpjCpf: store.users.cpf_cnpj,
    endereco: {
      logradouro: store.addresses[0].street,
      numero: store.addresses[0].number,
      complemento: store.addresses[0].complement,
      bairro: store.addresses[0].neighborhood,
      cep: store.addresses[0].zip_code,
      cidade: store.addresses[0].city,
      uf: store.addresses[0].state,
    },
  }

  const destinatario = {
    nome: order.store_customers.customers.name,
    endereco: {
      logradouro: order.store_customers.customers.address.street,
      numero: order.store_customers.customers.address.number,
      complemento: order.store_customers.customers.address.complement,
      bairro: order.store_customers.customers.address.neighborhood,
      cep: order.store_customers.customers.address.zip_code,
      cidade: order.store_customers.customers.address.city,
      uf: order.store_customers.customers.address.state,
    },
  }

  const solicitData: RequestSolicitarType = {
    gerarPdf: false,
    pedido: {
      tipo: 'D',
    },
    remetente,
    destinatario,
    produtos,
    servicos: ['E'],
    usarTransportadoraContrato: false,
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/shipping/solicit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storeId: store.id, solicitData }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Erro: ${errorText}`)
    }

    const responseData = await response.json()
    const trackingCode = responseData.codigo

    const { updateTrackingCodeError } = await updateOrderTrackingCode(
      orderId,
      trackingCode,
    )

    if (updateTrackingCodeError) {
      console.error(
        'Erro ao atualizar código de rastreamento:',
        updateTrackingCodeError,
      )
    }
  } catch (error) {
    console.error('Erro ao simular frete:', error)
  }
}

export async function GET(request: Request) {
  const supabase = createClient()

  const requestUrl = new URL(request.url)
  const storeURL = requestUrl.searchParams.get('store_subdomain')
  const orderId = requestUrl.searchParams.get('order')
  const stripeAccountId = requestUrl.searchParams.get('stripe_account')
  const amount = requestUrl.searchParams.get('amount')
  const isShipping = requestUrl.searchParams.get('pickup') === 'shipping'

  const origin = requestUrl.origin

  if (!storeURL || !orderId) {
    const res = NextResponse.json(
      { error: 'Missing required parameters.' },
      { status: 400 },
    )
    res.headers.set(
      'Cache-Control',
      'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
    )
    return res
  }

  const { error } = await supabase
    .from('orders')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', orderId)

  if (error) {
    const res = NextResponse.json(
      { error: 'Failed to update order.' },
      { status: 500 },
    )
    res.headers.set(
      'Cache-Control',
      'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
    )
    return res
  }

  if (!amount || !stripeAccountId) {
    const res = NextResponse.json(
      { error: 'Missing required parameters. (amount & stripeAccountId)' },
      { status: 400 },
    )
    res.headers.set(
      'Cache-Control',
      'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
    )
    return res
  }

  if (isShipping) {
    await solicitShipping(orderId)
  }

  revalidatePath('/orders')

  const res = NextResponse.redirect(
    `${origin}/${storeURL}/orders?callback=home`,
  )
  res.headers.set(
    'Cache-Control',
    'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
  )
  return res
}
