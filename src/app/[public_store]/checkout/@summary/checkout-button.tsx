'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { z } from 'zod'
import { useServerAction } from 'zsa-react'
import { createPurchase } from './actions'
import { createPurchaseSchema } from './schemas'

export function CheckoutButton({
  values,
}: {
  values: z.infer<typeof createPurchaseSchema>
}) {
  console.log('Values: ', values)

  const { execute, isPending } = useServerAction(createPurchase)
  async function handleCreatePurchase() {
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
