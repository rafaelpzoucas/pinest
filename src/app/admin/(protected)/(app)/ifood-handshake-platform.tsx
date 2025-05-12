'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import IfoodHandshakeDisputeSchema from '@/app/api/v1/integrations/ifood/webhook/schemas'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useServerAction } from 'zsa-react'
import { handleDisputeAction } from './actions'

const FormSchema = z.object({
  reason: z
    .string()
    .min(2, {
      message: 'Campo obrigatório.',
    })
    .max(250, { message: 'Limite de caracteres excedido. (max. 250)' }),
})

export function IfoodHandshakePlatform({
  event,
}: {
  event: z.infer<typeof IfoodHandshakeDisputeSchema>
}) {
  const supabase = createClient()
  const router = useRouter()

  const [isOpen, setIsOpen] = useState(!!event)
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)

  const expiresAt = event.metadata.expiresAt

  const { execute } = useServerAction(handleDisputeAction, {
    onSuccess: () => {
      setIsOpen(false)
    },
  })

  function handleHandshakeAction(action: 'accept' | 'reject', reason: string) {
    execute({ disputeId: event.id, action, reason })
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      reason: '',
    },
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    handleHandshakeAction('reject', data.reason)
    setIsAlertDialogOpen(false)
  }

  useEffect(() => {
    const channel = supabase
      .channel('realtime-webhook-events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ifood_events',
        },
        (payload) => {
          console.log('Novo evento recebido', payload)
          router.refresh()
          setIsOpen(true)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, router])

  return (
    <Sheet open={isOpen}>
      <SheetContent className="space-y-6">
        <SheetHeader>
          <SheetTitle>
            iFood - O cliente deseja cancelar o pedido #{event.orderId}
          </SheetTitle>
        </SheetHeader>

        <Card>
          <CardHeader>
            <CardTitle>Motivo da solicitação</CardTitle>
          </CardHeader>
          <CardContent>
            <strong>{event.metadata.message}</strong>
          </CardContent>
        </Card>

        <section className="text-center">
          <p>Você pode aceitar até as:</p>
          <p className="text-2xl text-destructive">
            <strong>{format(expiresAt, 'hh:mm:ss')}</strong>
          </p>
          <p>
            Após este tempo o pedido <strong>poderá ser cancelado</strong> sem a
            consulta do restaurante.
          </p>
        </section>

        <footer className="flex flex-col gap-2">
          <Button
            variant="destructive"
            onClick={() => handleHandshakeAction('accept', '')}
          >
            Aceitar cancelamento
          </Button>
          <AlertDialog
            open={isAlertDialogOpen}
            onOpenChange={setIsAlertDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button variant={'outline'} className="w-full">
                Recusar cancelamento
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Qual o motivo da recusa?</AlertDialogTitle>
                <AlertDialogDescription>
                  Explique a razão pela qual o cancelamento do pedido não pode
                  ser aceito.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motivo</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Insira o motivo..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel type="button">Fechar</AlertDialogCancel>
                    <Button type="submit">Recusar cancelamento</Button>
                  </AlertDialogFooter>
                </form>
              </Form>
            </AlertDialogContent>
          </AlertDialog>
        </footer>
      </SheetContent>
    </Sheet>
  )
}
