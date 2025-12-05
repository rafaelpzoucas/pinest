export async function Tracking({
  code,
  storeId,
}: {
  code: string
  storeId: string
}) {
  const encodedCode = encodeURIComponent(code)

  const response = await fetch(`http://localhost:3000/api/v1/shipping/track`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ trackingCode: encodedCode, storeId }),
  })

  const data = await response.json()

  return (
    <div className="text-sm mt-3">
      <strong>Rastreio:</strong>
      {data.error ? (
        <p className="text-muted-foreground">{data.error.mensagem}</p>
      ) : (
        <p className="text-muted-foreground">{JSON.stringify(data)}</p>
      )}
    </div>
  )
}
