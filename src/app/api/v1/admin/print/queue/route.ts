import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const storeId = url.searchParams.get('storeId')

  if (!storeId) {
    return new Response(JSON.stringify({ message: 'storeId é obrigatório' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('print_queue')
    .select('*')
    .eq('printed', false)
    .eq('store_id', storeId)

  if (error) {
    console.error('Erro ao buscar a fila de impressão:', error)
    return new Response(
      JSON.stringify({ message: 'Erro ao buscar a fila de impressão.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
