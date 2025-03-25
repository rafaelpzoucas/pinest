import { readPurchaseById } from '@/app/[public_store]/purchases/[id]/actions'
import { readStoreById } from '@/app/admin/(protected)/(app)/config/(options)/account/register/store/actions'
import { createClient } from '@/lib/supabase/server'
import { ProdutoType, RequestSolicitarType } from '@/models/kangu-shipping'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

async function updatePurchaseTrackingCode(
  purchaseId: string,
  trackingCode: string,
) {
  const supabse = createClient()

  const { error: updateTrackingCodeError } = await supabse
    .from('purchases')
    .update({ tracking_code: trackingCode })
    .eq('id', purchaseId)

  return { updateTrackingCodeError }
}

async function solicitShipping(purchaseId: string) {
  const { purchase } = await readPurchaseById(purchaseId)

  if (!purchase) return

  const { store } = await readStoreById(purchase.store_id)

  if (!store) return

  const produtos = purchase?.purchase_items.map((item) => {
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
    nome: purchase.customers.users.name,
    cnpjCpf: purchase.customers.users.cpf_cnpj,
    endereco: {
      logradouro: purchase.addresses.street,
      numero: purchase.addresses.number,
      complemento: purchase.addresses.complement,
      bairro: purchase.addresses.neighborhood,
      cep: purchase.addresses.zip_code,
      cidade: purchase.addresses.city,
      uf: purchase.addresses.state,
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

    const { updateTrackingCodeError } = await updatePurchaseTrackingCode(
      purchaseId,
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
  const storeURL = requestUrl.searchParams.get('store_url')
  const purchaseId = requestUrl.searchParams.get('purchase')
  const stripeAccountId = requestUrl.searchParams.get('stripe_account')
  const amount = requestUrl.searchParams.get('amount')
  const isShipping = requestUrl.searchParams.get('pickup') === 'shipping'

  const origin = requestUrl.origin

  if (!storeURL || !purchaseId) {
    return NextResponse.json(
      { error: 'Missing required parameters.' },
      { status: 400 },
    )
  }

  const { error } = await supabase
    .from('purchases')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', purchaseId)

  if (error) {
    console.error('Supabase Error:', error)
    return NextResponse.json(
      { error: 'Failed to update purchase.' },
      { status: 500 },
    )
  }

  if (!amount || !stripeAccountId) {
    return NextResponse.json(
      { error: 'Missing required parameters. (amount & stripeAccountId)' },
      { status: 400 },
    )
  }

  if (isShipping) {
    await solicitShipping(purchaseId)
  }

  revalidatePath('/purchases')

  return NextResponse.redirect(`${origin}/${storeURL}/purchases?callback=home`)
}
