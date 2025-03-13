'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useServerAction } from 'zsa-react'

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CustomerType } from '@/models/customer'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { readCustomers } from './customers/actions'
import { CustomersCombobox } from './customers/combobox'
import { ProductsList } from './products/list'

export const createPurchaseFormSchema = z.object({
  customer_id: z.string(),
  purchase_items: z.array(
    z.object({
      product_id: z.string(),
      quantity: z.number(),
      product_price: z.number(),
      observations: z.string(),
      extras: z.array(z.object({})),
    }),
  ),
  type: z.enum(['delivery', 'pickup'], {
    message: 'Escolhe o tipo de entrega.',
  }),
  payment_type: z.enum(['card', 'pix', 'cash'], {
    message: 'Escolhe a forma de pagamento.',
  }),
  change_value: z.number().optional(),
  discount: z.number().optional(),
})

export function CreatePurchaseForm() {
  const searchParams = useSearchParams()

  const createdCustomer = searchParams.get('created_customer')

  const [customers, setCustomers] = useState<CustomerType[]>([])
  const customerFormSheetState = useState(false)

  const { execute: executeReadCustomers, data } = useServerAction(
    readCustomers,
    {
      onError: (err: any) => {
        console.error('Failed to fetch customers:', err)
      },
      onSuccess: () => {
        if (data?.customers) {
          setCustomers(data.customers)
        }
      },
    },
  )
  // 1. Define your form.
  const form = useForm<z.infer<typeof createPurchaseFormSchema>>({
    resolver: zodResolver(createPurchaseFormSchema),
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof createPurchaseFormSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  useEffect(() => {
    executeReadCustomers()
    if (createdCustomer) {
      form.setValue('customer_id', createdCustomer)
    }
  }, [createdCustomer])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <CustomersCombobox
          customers={customers}
          form={form}
          customerFormSheetState={customerFormSheetState}
          updateCustomers={executeReadCustomers}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo de pedido</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="delivery" />
                    </FormControl>
                    <FormLabel className="font-normal">Entrega</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="pickup" />
                    </FormControl>
                    <FormLabel className="font-normal">Retirada</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ProductsList form={form} />

        <FormField
          control={form.control}
          name="payment_type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Forma de pagamento</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="card" />
                    </FormControl>
                    <FormLabel className="font-normal">Cartão</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="pix" />
                    </FormControl>
                    <FormLabel className="font-normal">PIX</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="cash" />
                    </FormControl>
                    <FormLabel className="font-normal">Dinheiro</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch('payment_type') === 'cash' && (
          <FormField
            control={form.control}
            name="change_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Troco (opcional)</FormLabel>
                <FormControl>
                  <Input maskType="currency" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="discount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Desconto (opcional)</FormLabel>
              <FormControl>
                <Input
                  maskType="currency"
                  placeholder="Insira o valor do desconto..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Criar pedido</Button>
      </form>
    </Form>
  )
}
