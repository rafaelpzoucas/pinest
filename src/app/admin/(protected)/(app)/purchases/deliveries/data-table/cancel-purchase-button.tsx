'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { buttonVariants } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { cancelPurchase } from '../[id]/actions'
import { getCancellationReasons, requestCancellation } from './actions'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { CancellationReasonsType } from '@/models/ifood'
import { PurchaseType } from '@/models/purchase'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

const FormSchema = z.object({
  code: z.string(),
})

export function CancelPurchaseButton({ purchase }: { purchase: PurchaseType }) {
  const purchaseId = purchase.id

  const currentStatus = purchase?.status
  const isIfood = purchase?.is_ifood

  const accepted = currentStatus !== 'accept'
  const delivered = currentStatus === 'delivered'

  const isMobile = useIsMobile()

  const [cancellationReasons, setCancellationReasons] = useState<
    CancellationReasonsType[]
  >([])

  async function handleGetCancellationReasons() {
    const response = await getCancellationReasons(purchaseId)

    if (response) {
      setCancellationReasons(response.data)
    }
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const selectedReason = cancellationReasons.find(
      (r) => r.cancelCodeId === data.code,
    )

    const requestCancellationBody = {
      reason: selectedReason?.description ?? '',
      cancellationCode: selectedReason?.cancelCodeId ?? '',
    }

    requestCancellation(requestCancellationBody, purchaseId)
    cancelPurchase({ purchaseId })
  }

  if (currentStatus === 'cancelled') {
    return null
  }

  if (delivered) {
    return null
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className={cn(
          buttonVariants({
            variant: !accepted ? 'destructive' : 'ghost',
            size: !accepted ? 'default' : isMobile ? 'default' : 'icon',
          }),
        )}
        onClick={handleGetCancellationReasons}
      >
        <X className="w-5 h-5" />
        {!accepted && <span>Recusar</span>}
        {accepted && isMobile && 'Cancelar'}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Tem certeza que deseja cancelar esse pedido?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isIfood && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo do cancelamento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um motivo..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cancellationReasons &&
                          cancellationReasons.length > 0 &&
                          cancellationReasons.map((reason) => (
                            <SelectItem
                              key={reason.cancelCodeId}
                              value={reason.cancelCodeId}
                            >
                              {reason.description}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <AlertDialogFooter>
                <AlertDialogCancel>Não, manter pedido</AlertDialogCancel>
                <AlertDialogAction type="submit">
                  Sim, cancelar
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </Form>
        )}

        {!isIfood && (
          <AlertDialogFooter>
            <AlertDialogCancel>Não, manter pedido</AlertDialogCancel>
            <AlertDialogAction onClick={() => cancelPurchase({ purchaseId })}>
              Sim, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
