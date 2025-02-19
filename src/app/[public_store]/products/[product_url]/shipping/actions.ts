import { createClient } from '@/lib/supabase/client'
import { RequestSimularType } from '@/models/kangu-shipping'
import axios from 'axios'

// Função que obtém as credenciais da loja ou a credencial global da Pinest
async function readStoreKanguToken(storeURL: string) {
  const supabase = createClient()

  const { data } = await supabase
    .from('stores')
    .select('kangu_token')
    .eq('store_url', storeURL)
    .single()

  return data?.kangu_token || process.env.KANGU_TOKEN_GLOBAL
}

export async function simulateShipping(
  storeURL: string,
  dadosFrete: RequestSimularType,
) {
  try {
    const token = await readStoreKanguToken(storeURL)

    const response = await axios.post(
      'https://portal.kangu.com.br/tms/transporte/simular',
      dadosFrete,
      {
        headers: {
          token: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    )

    return response.data
  } catch (error) {
    console.error('Erro ao calcular frete:', error)
    throw error
  }
}
