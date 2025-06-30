import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const imageId = searchParams.get('id')
  const orderId = searchParams.get('orderId')
  const accessToken = searchParams.get('accessToken')

  if (!imageId) {
    return new Response('Missing image ID', { status: 400 })
  }

  const ifoodImageUrl = `https://merchant-api.ifood.com.br/order/v1.0/orders/${orderId}/cancellationEvidences/${imageId}`

  const res = await fetch(ifoodImageUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!res.ok) {
    console.error('Failed to fetch image from iFood', {
      status: res.status,
      statusText: res.statusText,
    })
    return new Response('Failed to fetch image', { status: res.status })
  }

  const contentType = res.headers.get('content-type') ?? 'image/jpeg'
  const buffer = await res.arrayBuffer()

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=60',
    },
  })
}
