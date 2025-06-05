export async function POST() {
  const res = await fetch('http://localhost:53281/printers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) {
    return new Response('Erro ao enviar para impressora', { status: 500 })
  }

  return new Response('Enviado com sucesso')
}
