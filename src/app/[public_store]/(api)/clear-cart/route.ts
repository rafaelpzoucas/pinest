import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createStripeCheckout } from '../../checkout/actions'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const storeName = requestUrl.searchParams.get('store-name')
  const purchaseId = requestUrl.searchParams.get('purchase')

  console.log('Pássou poraqui')
  cookies().set('pinest_cart', '')

  if (storeName && purchaseId) {
    await createStripeCheckout(storeName, purchaseId)
  }

  return NextResponse
}
