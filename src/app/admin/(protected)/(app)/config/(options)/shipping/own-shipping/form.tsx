'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { ShippingConfigType } from '@/models/shipping'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  createOwnShipping,
  updateOwnShipping,
  updateOwnShippingStatus,
} from '../actions'

export const ownShippingFormSchema = z.object({
  price: z.string().optional(),
  delivery_time: z
    .string()
    .min(1, { message: 'O tempo de entrega é obrigatório.' }),
  status: z.boolean(),
  pickup: z.boolean(),
  motoboy: z.boolean(),
})

export function OwnShippingForm({
  shipping,
}: {
  shipping: ShippingConfigType | null
}) {
  const params = useParams()
  const router = useRouter()

  const currentStep = params.current_step

  const form = useForm<z.infer<typeof ownShippingFormSchema>>({
    resolver: zodResolver(ownShippingFormSchema),
    defaultValues: {
      price: shipping?.price.toString() ?? '',
      delivery_time: shipping?.delivery_time?.toString() ?? '',
      status: shipping?.status ?? false,
      pickup: shipping?.pickup ?? false,
      motoboy: shipping?.motoboy ?? false,
    },
  })

  const formState = form.formState

  const status = form.watch('status')
  const deliveryTime = form.watch('delivery_time')

  async function onSubmit(values: z.infer<typeof ownShippingFormSchema>) {
    if (shipping) {
      const { updatedOwnShipping } = await updateOwnShipping(values)

      if (updatedOwnShipping) {
        toast('Forma de envio atualizada com sucesso!')
      }
    } else {
      const { createdOwnShipping } = await createOwnShipping(values)

      if (createdOwnShipping) {
        toast('Forma de envio configurada com sucesso!')
      }
    }

    if (currentStep) {
      router.push(`/admin/dashboard`)
    }
  }

  async function updateStatus() {
    if (status) {
      const { updatedStatus } = await updateOwnShippingStatus(status)

      if (updatedStatus) {
        toast(
          `Entrega própria ${status ? 'ativada' : 'desativada'} com sucesso!`,
        )
      }
    }
  }

  console.log(shipping, status)

  useEffect(() => {
    if (status !== shipping?.status) {
      updateStatus()
    }
  }, [status]) // eslint-disable-line

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle>Entrega própria</CardTitle>
        <CardDescription>Para entregas na mesma cidade.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={cn('space-y-8')}
          >
            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="absolute top-4 right-4">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <section
                className={cn(
                  'space-y-4',
                  status ? 'opacity-100' : 'opacity-30',
                )}
              >
                <Card className="space-y-3 p-3">
                  <FormField
                    control={form.control}
                    name="motoboy"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Motoboy</FormLabel>
                          <FormDescription>
                            Caso você ofereça o serviço de motoboy.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={!status ? false : field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço da entrega</FormLabel>
                        <FormControl>
                          <Input
                            maskType="currency"
                            placeholder="Insira o preço da entrega..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="delivery_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tempo de entrega</FormLabel>
                        {deliveryTime === '0' ? (
                          <FormControl>
                            <Input
                              placeholder="Insira o preço da entrega..."
                              {...field}
                            />
                          </FormControl>
                        ) : (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tempo de entrega..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="20">20min</SelectItem>
                              <SelectItem value="30">30min</SelectItem>
                              <SelectItem value="40">40min</SelectItem>
                              <SelectItem value="50">50min</SelectItem>
                              <SelectItem value="60">60min</SelectItem>
                              <SelectItem value="70">70min</SelectItem>
                              <SelectItem value="80">80min</SelectItem>
                              <SelectItem value="90">90min</SelectItem>
                              <SelectItem value="0">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>

                <FormField
                  control={form.control}
                  name="pickup"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Retirada na loja</FormLabel>
                        <FormDescription>
                          O cliente terá acesso ao endereço da loja para retirar
                          o pedido.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={!status ? false : field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </section>
            </div>

            <Button
              type="submit"
              disabled={formState.isSubmitting || !formState.isValid}
            >
              {formState.isSubmitting && (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              )}
              Salvar alterações {currentStep ? 'e finalizar cadastro' : ''}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
