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
  console.log('CheckoutButton renderizado com valores:', values)

  const { execute, isPending } = useServerAction(createPurchase)

  async function handleCreatePurchase() {
    console.log('Botão de checkout clicado')
    console.log('Valores do pedido:', values)
    try {
      console.log('Tentando executar server action')
      const result = await execute(values)
      console.log('Server action executada com sucesso:', result)
    } catch (error) {
      console.error('Erro ao criar pedido:', error)
    }
  }

  return (
    <Button
      onClick={handleCreatePurchase}
      disabled={isPending}
      className="w-full"
    >
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
