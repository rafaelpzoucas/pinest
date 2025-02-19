import { RequestSolicitarType } from '@/models/kangu-shipping'
import { readStoreKanguToken } from '../actions'

export async function POST(request: Request) {
  try {
    const {
      storeId,
      solicitData,
    }: { storeId: string; solicitData: RequestSolicitarType } =
      await request.json()

    const token = await readStoreKanguToken(storeId)

    const response = await fetch(
      'https://portal.kangu.com.br/tms/transporte/solicitar',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token,
        },
        body: JSON.stringify(solicitData),
      },
    )

    if (!response.ok) {
      console.error('Erro na resposta da API Kangu:', await response.text())
      return new Response('Erro ao solicitar frete', { status: 500 })
    }

    const data = await response.json()

    return new Response(JSON.stringify(data), { status: 200 })
  } catch (error) {
    console.error('Erro ao solicitar frete:', error)
    return new Response('Erro interno no servidor', { status: 500 })
  }
}
