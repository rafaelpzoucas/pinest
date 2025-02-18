import { readStoreKanguToken } from '../actions';

export async function POST(request: Request) {
  try {
    // Recebe os dados do corpo da requisição
    const { trackingCode, storeId }: { storeId: string; trackingCode: string } =
      await request.json()

    if (!trackingCode || !storeId) {
      return new Response(
        'Parâmetros trackingCode e storeId são obrigatórios',
        {
          status: 400,
        },
      )
    }

    // Obtém o token da loja
    const token = await readStoreKanguToken(storeId)

    // Faz a requisição GET para a API da Kangu
    const response = await fetch(
      `https://portal.kangu.com.br/tms/transporte/imprimir-etiqueta/${trackingCode}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          token,
        },
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro na resposta da API Kangu:', errorText)
      return new Response('Erro ao rastrear frete', { status: 500 })
    }

    // Analisa a resposta como JSON
    const data = await response.json()

    // Retorna a resposta para o cliente
    return new Response(JSON.stringify(data), { status: 200 })
  } catch (error) {
    console.error('Erro ao solicitar etiqueta:', error)
    return new Response('Erro interno no servidor', { status: 500 })
  }
}
