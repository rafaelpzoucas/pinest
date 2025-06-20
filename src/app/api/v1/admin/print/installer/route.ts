import { createClient } from '@/lib/supabase/server'

const REPO_OWNER = 'rafaelpzoucas'
const REPO_NAME = 'pinest-printer'
const INSTALLER_PATH = 'releases/PinestPrinter_Setup.exe'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const storeId = url.searchParams.get('storeId')

  if (!storeId) {
    return new Response(JSON.stringify({ message: 'storeId é obrigatório' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    // Verifica se a loja existe
    const supabase = createClient()
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('id', storeId)
      .single()

    if (storeError || !store) {
      return new Response(JSON.stringify({ message: 'Loja não encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Baixa o instalador diretamente do repositório
    const response = await fetch(
      `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${INSTALLER_PATH}`,
    )

    if (!response.ok) {
      throw new Error('Instalador não encontrado')
    }

    const blob = await response.blob()

    // Retorna o arquivo executável
    return new Response(blob, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="PinestPrinter_Setup_${storeId}.exe"`,
      },
    })
  } catch (error) {
    console.error('Erro ao baixar instalador:', error)
    return new Response(
      JSON.stringify({ message: 'Erro ao baixar instalador' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
}
