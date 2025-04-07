'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
import { PhoneInput } from '@/components/ui/input-phone'
import { createPath } from '@/lib/utils'
import { CustomerType } from '@/models/customer'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { parseCookies } from 'nookies'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useServerAction } from 'zsa-react'
import { createCustomer, updateCustomer } from './actions'
import { createCustomerSchema } from './schemas'

export function CustomerRegisterForm({
  customer,
  storeSubdomain,
}: {
  customer?: CustomerType
  storeSubdomain?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const cookies = parseCookies()

  const qCheckout = searchParams.get('checkout')

  const phone = cookies[`${storeSubdomain}_customer_phone`]

  const form = useForm<z.infer<typeof createCustomerSchema>>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: customer?.name ?? '',
      phone: customer?.phone ?? phone ?? '',
      address: {
        street: customer?.address.street ?? '',
        number: customer?.address.number ?? '',
        neighborhood: customer?.address.neighborhood ?? '',
        complement: customer?.address.complement ?? '',
        observations: customer?.address.observations ?? '',
      },
    },
  })

  const { execute: executeCreate, isPending: isCreating } =
    useServerAction(createCustomer)
  const { execute: executeUpdate, isPending: isUpdating } =
    useServerAction(updateCustomer)

  async function onSubmit(values: z.infer<typeof createCustomerSchema>) {
    if (customer) {
      executeUpdate({ ...values, id: customer.id })
    } else {
      executeCreate(values)
    }

    if (qCheckout) {
      return router.push(createPath(`/checkout?step=pickup`, storeSubdomain))
    }

    return router.push(createPath('/purchases', storeSubdomain))
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col w-full max-w-md mx-auto space-y-6"
      >
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <PhoneInput {...field} />
              </FormControl>
              <FormDescription>O número de WhatsApp.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Digite o seu nome..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card className="p-4 space-y-6">
          <FormField
            control={form.control}
            name="address.street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rua</FormLabel>
                <FormControl>
                  <Input placeholder="Insira a sua rua..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número</FormLabel>
                <FormControl>
                  <Input placeholder="Insira o número..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.neighborhood"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bairro</FormLabel>
                <FormControl>
                  <Input placeholder="Insira o bairro..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.complement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Complemento (opcional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Insira o complemento se tiver..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Insira uma observação..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        <Button
          type="submit"
          className="ml-auto"
          disabled={isCreating || isUpdating}
        >
          {(isCreating || isUpdating) && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          Continuar
        </Button>
      </form>
    </Form>
  )
}
