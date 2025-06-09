export async function POST(req: Request) {
  const { text, printerName } = await req.json()

  const res = await fetch('http://localhost:53281/print', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, printerName }),
  })

  if (!res.ok) {
    return new Response('Erro ao enviar para impressora', { status: 500 })
  }

  return new Response('Enviado com sucesso')
}
