import { cookies } from 'next/headers'
import { createStripeCheckout } from '../../checkout/actions'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const storeName = requestUrl.searchParams.get('store-name')
  const purchaseId = requestUrl.searchParams.get('purchase')

  cookies().set(`${storeName}_cart`, '')

  if (storeName && purchaseId) {
    await createStripeCheckout(storeName, purchaseId)
  }
}
