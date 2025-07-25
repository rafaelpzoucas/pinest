'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { useServerAction } from 'zsa-react'
import { createPurchase } from './actions'
import { createPurchaseSchema } from './schemas'

export function CheckoutButton({
  values,
}: {
  values: z.infer<typeof createPurchaseSchema>
}) {
  const { execute, isPending } = useServerAction(createPurchase, {
    onError: ({ err }) => {
      console.error(err)
      toast.error('Ocorreu um erro inesperado.')
    },
  })

  async function handleCreatePurchase() {
    const result = createPurchaseSchema.safeParse(values)

    if (!result.success) {
      console.error('Erro de validação', result.error)
      toast.error('Dados inválidos. Verifique e tente novamente.')
      return
    }

    execute(values)
  }
  return (
    <Button onClick={handleCreatePurchase} disabled={isPending}>
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Criando pedido</span>
        </>
      ) : (
        'Finalizar pedido'
      )}
    </Button>
  )
}
