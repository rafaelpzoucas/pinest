import { createClient } from '@/lib/supabase/client'
import { RequestSimularType } from '@/models/shipping'

async function readStoreKanguToken(publicStore: string) {
  const supabase = createClient()

  const { data } = await supabase
    .from('stores')
    .select('kangu_token')
    .eq('store_url', publicStore)
    .single()

  return data?.kangu_token || process.env.KANGU_TOKEN_GLOBAL
}

export async function POST(request: Request) {
  try {
    const {
      publicStore,
      simulationData,
    }: { publicStore: string; simulationData: RequestSimularType } =
      await request.json()

    const token = await readStoreKanguToken(publicStore)

    const response = await fetch(
      'https://portal.kangu.com.br/tms/transporte/simular',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token,
        },
        body: JSON.stringify(simulationData),
      },
    )

    if (!response.ok) {
      console.error('Erro na resposta da API Kangu:', await response.text())
      return new Response('Erro ao simular frete', { status: 500 })
    }

    const data = await response.json()
    return new Response(JSON.stringify(data), { status: 200 })
  } catch (error) {
    console.error('Erro ao simular frete:', error)
    return new Response('Erro interno no servidor', { status: 500 })
  }
}
