import { readStoreKanguToken } from '../actions'

export async function GET(request: Request) {
  try {
    const { trackingCode, storeId }: { storeId: string; trackingCode: string } =
      await request.json()

    const token = await readStoreKanguToken(storeId)

    const response = await fetch(
      `https://portal.kangu.com.br/tms/transporte/rastrear/${trackingCode}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          token,
        },
      },
    )

    if (!response.ok) {
      console.error('Erro na resposta da API Kangu:', await response.text())
      return new Response('Erro ao rastrear frete', { status: 500 })
    }

    const data = await response.json()

    return new Response(JSON.stringify(data), { status: 200 })
  } catch (error) {
    console.error('Erro ao rastrear frete:', error)
    return new Response('Erro interno no servidor', { status: 500 })
  }
}
