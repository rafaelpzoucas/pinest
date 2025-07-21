'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useServerAction } from 'zsa-react'
import { validateCoupon } from './actions'

export function CouponField({
  onApply,
  onClose,
}: {
  onApply: (data: any) => void
  onClose: (data: any) => void
}) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(
    null,
  )

  const { execute } = useServerAction(validateCoupon, {
    onSuccess: ({ data }) => {
      if (data?.valid) {
        setMessage('Cupom aplicado com sucesso!')
        setMessageType('success')
        onApply(data)
        onClose(false)
      } else {
        setMessage(data?.error || 'Cupom inválido.')
        setMessageType('error')
        onApply(null)
      }
    },
    onError: ({ err }) => {
      setMessage(err?.message || 'Erro ao validar cupom.')
      setMessageType('error')
      onApply(null)
    },
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setMessageType(null)
    setLoading(true)
    try {
      await execute({ code })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="flex flex-col gap-2 mb-4" onSubmit={handleSubmit}>
      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          name="coupon"
          placeholder="Cupom de desconto"
          maxLength={20}
          style={{ textTransform: 'uppercase' }}
          autoComplete="off"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !code}>
          {loading ? 'Aplicando...' : 'Aplicar'}
        </Button>
      </div>

      {message && (
        <span
          className={
            messageType === 'error'
              ? 'text-red-500 text-xs ml-2'
              : 'text-green-600 text-xs ml-2'
          }
        >
          {message}
        </span>
      )}
    </form>
  )
}
