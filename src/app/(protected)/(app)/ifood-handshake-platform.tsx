'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import IfoodHandshakeDisputeSchema from '@/app/api/v1/integrations/ifood/webhook/schemas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import Image from 'next/image'
import { useServerAction } from 'zsa-react'
import { handleDisputeAction, readIfoodIntegration } from './actions'

const FormSchema = z.object({
  reason: z
    .string()
    .min(2, {
      message: 'Campo obrigatório.',
    })
    .max(250, { message: 'Limite de caracteres excedido. (max. 250)' }),
})

function extractIfoodIds(url: string) {
  const parts = url.split('/')
  const orderIndex = parts.indexOf('orders')
  const evidenceIndex = parts.indexOf('cancellationEvidences')

  if (orderIndex === -1 || evidenceIndex === -1) return null

  return {
    orderId: parts[orderIndex + 1],
    evidenceId: parts[evidenceIndex + 1],
  }
}

export function IfoodHandshakePlatform({
  event,
}: {
  event?: z.infer<typeof IfoodHandshakeDisputeSchema>
}) {
  const supabase = createClient()
  const router = useRouter()

  const expiresAt = event?.metadata.expiresAt ?? new Date()
  const evidences = event?.metadata?.metadata?.evidences ?? []

  const [isOpen, setIsOpen] = useState(!!event)
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)
  const [accessToken, setAccessToken] = useState('')
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)

  const [timeLeft, setTimeLeft] = useState<string>('00:00:00')

  const { execute } = useServerAction(handleDisputeAction)
  const { execute: executeReadIfoodIntegration } = useServerAction(
    readIfoodIntegration,
    {
      onSuccess: ({ data }) => {
        setAccessToken(data.ifoodIntegration.access_token)
      },
    },
  )

  const orderId = event?.orderId

  function handleHandshakeAction(action: 'accept' | 'reject', reason: string) {
    execute({
      eventId: event?.id,
      disputeId: event?.metadata.disputeId,
      action,
      reason,
    })
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
    form.reset()
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

          if (payload.eventType === 'DELETE') {
            setIsOpen(false)
          } else {
            setIsOpen(true)
            router.refresh()
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, router])

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime()
      const target = new Date(expiresAt).getTime()
      const diff = target - now

      if (diff <= 0) {
        setTimeLeft('00:00:00')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
          seconds,
        ).padStart(2, '0')}`,
      )
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [expiresAt])

  useEffect(() => {
    executeReadIfoodIntegration()
  }, [])

  return (
    <>
      <Sheet open={isOpen}>
        <SheetContent className="space-y-6">
          <SheetHeader>
            <SheetTitle>iFood - O cliente deseja cancelar o pedido</SheetTitle>
          </SheetHeader>

          {event ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Motivo da solicitação</CardTitle>
                </CardHeader>
                <CardContent>
                  <strong>{event?.metadata.message}</strong>

                  {evidences.length > 0 ? (
                    <ul className="mt-4 grid grid-cols-3 gap-2">
                      {evidences.map((evidence) => {
                        const evidenceId = extractIfoodIds(
                          evidence.url,
                        )?.evidenceId
                        const imageUrl = `/api/v1/integrations/ifood/evidence-image?id=${evidenceId}&orderId=${orderId}&accessToken=${accessToken}`

                        return (
                          <li key={evidence.url}>
                            <button
                              onClick={() => {
                                setSelectedImageUrl(imageUrl)
                                setIsImageDialogOpen(true)
                              }}
                              className="overflow-hidden rounded-md border transition-all hover:ring-2 hover:ring-ring
                                hover:ring-offset-2"
                            >
                              <Image
                                src={imageUrl}
                                alt="Evidência do cancelamento"
                                width={100}
                                height={100}
                                className="aspect-square object-cover"
                              />
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  ) : null}
                </CardContent>
              </Card>
              <section className="text-center">
                <p>Tempo restante para aceitar:</p>
                <p className="text-2xl text-destructive">
                  <strong>{timeLeft}</strong>
                </p>

                <p>
                  Após este tempo o pedido <strong>poderá ser cancelado</strong>{' '}
                  sem a consulta do restaurante.
                </p>
              </section>

              <footer className="flex flex-col gap-2">
                <Button
                  variant="destructive"
                  onClick={() => handleHandshakeAction('accept', '')}
                >
                  Aceitar cancelamento
                </Button>
                <Button
                  variant={'outline'}
                  className="w-full"
                  onClick={() => setIsAlertDialogOpen(true)}
                >
                  Recusar cancelamento
                </Button>
              </footer>
            </>
          ) : (
            <p>Carregando informações...</p>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Qual o motivo da recusa?</DialogTitle>
            <DialogDescription>
              Explique a razão pela qual o cancelamento do pedido não pode ser
              aceito.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Insira o motivo..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose type="button">Fechar</DialogClose>
                <Button type="submit">Recusar cancelamento</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Visualizar Evidência</DialogTitle>
          </DialogHeader>
          {selectedImageUrl && (
            <div className="relative mt-4 h-[70vh]">
              <Image
                src={selectedImageUrl}
                alt="Evidência do cancelamento em tamanho ampliado"
                fill
                className="object-contain"
              />
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Fechar
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
