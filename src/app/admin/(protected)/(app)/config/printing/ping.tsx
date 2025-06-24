'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useState } from 'react'

export default function PingButton() {
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handlePing = async () => {
    setLoading(true)
    setResponse(null)

    try {
      const res = await fetch('http://localhost:53281/ping')
      if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`)
      const data = await res.json()
      setResponse(data.message)
    } catch (error) {
      const errorMessage = (error as Error).message
      setResponse(`Falha: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-8">
      <Button onClick={handlePing} disabled={loading}>
        {loading ? 'Pingando...' : 'Ping'}
      </Button>
      {response && <p>Resposta: {response}</p>}
    </Card>
  )
}
