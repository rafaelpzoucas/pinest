'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { useServerAction } from 'zsa-react'
import { createOrder } from './actions'
import { createOrderSchema } from './schemas'

export function CheckoutButton({
  values,
}: {
  values: z.infer<typeof createOrderSchema>
}) {
  const { execute, isPending } = useServerAction(createOrder, {
    onError: ({ err }) => {
      console.error(err)
      toast.error('Ocorreu um erro inesperado.')
    },
  })

  async function handleCreateOrder() {
    const result = createOrderSchema.safeParse(values)

    if (!result.success) {
      console.error('Erro de validação', result.error)
      toast.error('Dados inválidos. Verifique e tente novamente.')
      return
    }

    execute(values)
  }
  return (
    <Button onClick={handleCreateOrder} disabled={isPending}>
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
