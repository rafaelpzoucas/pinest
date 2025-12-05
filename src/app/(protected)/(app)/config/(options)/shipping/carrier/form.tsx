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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { CarrierType } from '@/models/carrier'
import { ShippingConfigType } from '@/models/shipping'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info, Loader } from 'lucide-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { updateShippingCarrier } from './actions'

export const carrierFormSchema = z.object({
  carrier_id: z.string(),
  carrier_token: z.string(),
})

export function CarrierShippingForm({
  shipping,
  carriers,
}: {
  shipping: ShippingConfigType | null
  carriers: CarrierType[] | null
}) {
  const form = useForm<z.infer<typeof carrierFormSchema>>({
    resolver: zodResolver(carrierFormSchema),
    defaultValues: {
      carrier_id: shipping?.carrier_id ?? '',
      carrier_token: shipping?.carrier_token ?? '',
    },
  })

  const formState = form.formState

  async function onSubmit(values: z.infer<typeof carrierFormSchema>) {
    const { updateOwnShippingError } = await updateShippingCarrier(values)

    if (updateOwnShippingError) {
      console.error(updateOwnShippingError)
    }
  }

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle>Transportadora</CardTitle>
        <CardDescription>Para entregas fora da sua cidade.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex flex-row gap-4 items-baseline">
              <FormField
                control={form.control}
                name="carrier_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transportadora</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleciona uma transportadora" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {carriers &&
                          carriers.length > 0 &&
                          carriers.map((carrier) => (
                            <SelectItem key={carrier.id} value={carrier.id}>
                              {carrier.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="carrier_token"
                render={({ field }) => (
                  <FormItem className="w-full max-w-lg">
                    <div className="flex flex-row gap-2">
                      <FormLabel>Token</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger type="button">
                            <Info className="w-4 h-4" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>
                              Crie ou acesse sua conta na{' '}
                              <Link
                                href={
                                  'https://portal.kangu.com.br/sellers/meu-acesso'
                                }
                                target="_blank"
                                className={cn(
                                  'font-bold hover:underline',
                                  'p-0',
                                )}
                              >
                                Kangu
                              </Link>
                              , e encontre a seção &quot;API - Credenciais /
                              Tokens&quot;, depois crie uma nova credencial, e
                              clique em copiar. Em seguida, cole sua credencial
                              no campo Token abaixo
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormControl>
                      <Input placeholder="Insira aqui o token..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="submit"
              disabled={formState.isSubmitting || !formState.isValid}
            >
              {formState.isSubmitting && (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              )}
              Salvar alterações
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
