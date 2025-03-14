'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
import { Switch } from '@/components/ui/switch'
import { formatCurrencyBRL, stringToNumber } from '@/lib/utils'
import { CategoryType } from '@/models/category'
import { CustomerType } from '@/models/customer'
import { ExtraType } from '@/models/extras'
import { ProductType } from '@/models/product'
import { Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useServerAction } from 'zsa-react'
import { createPurchase } from './actions'
import { CustomersCombobox } from './customers/combobox'
import { ProductsList } from './products/list'
import { SelectedProducts } from './products/selected-products'
import { createPurchaseFormSchema } from './schemas'

export function CreatePurchaseForm({
  customers,
  products,
  categories,
  extras,
}: {
  customers: CustomerType[]
  products: ProductType[]
  categories: CategoryType[]
  extras: ExtraType[]
}) {
  const searchParams = useSearchParams()

  const customerFormSheetState = useState(false)

  // 1. Define your form.
  const form = useForm<z.infer<typeof createPurchaseFormSchema>>({
    resolver: zodResolver(createPurchaseFormSchema),
    defaultValues: {
      customer_id: '',
      purchase_items: [],
      type: 'delivery',
      payment_type: 'card',
      change_value: '',
      discount: '',
      status: 'preparing',
      accepted: true,
      total_amount: 0,
      shipping_price: 6,
    },
  })

  const purchaseType = form.watch('type')
  const discountValue = form.watch('discount') ?? 'R$ 0,00'
  const discount = stringToNumber(discountValue)
  const shippingPrice = form.watch('shipping_price') ?? 0

  const totalAmount = form.watch('total_amount') ?? 0

  const totalPurchasePrice =
    totalAmount +
    (purchaseType === 'delivery' ? shippingPrice : 0) -
    (discount || 0)

  const { execute, isPending } = useServerAction(createPurchase)

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof createPurchaseFormSchema>) {
    const [err] = await execute(values)

    if (err) {
      console.error({ err })
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-[2fr_1fr] items-start gap-8"
      >
        <aside className="sticky top-4">
          <Card className="space-y-6 p-4 h-[calc(100vh_-_1rem_-_5rem)]">
            <h1 className="text-lg font-bold">Produtos</h1>
            <ProductsList
              form={form}
              products={products}
              categories={categories}
            />
          </Card>
        </aside>
        <Card className="space-y-6 p-4">
          <h1 className="text-lg font-bold">Resumo do pedido</h1>

          <CustomersCombobox
            customers={customers}
            form={form}
            customerFormSheetState={customerFormSheetState}
          />

          <div className="grid grid-cols-2">
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
          </div>

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

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => <input type="hidden" {...field} />}
          />

          <FormField
            control={form.control}
            name="shipping_price"
            render={({ field }) => <input type="hidden" {...field} />}
          />

          <FormField
            control={form.control}
            name="accepted"
            render={({ field }) => (
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                className="hidden"
              />
            )}
          />

          <SelectedProducts form={form} products={products} extras={extras} />

          <div className="flex flex-col w-full">
            <div className="flex flex-row items-center justify-between w-full text-sm text-muted-foreground">
              <span>Subtotal</span>
              <strong>{formatCurrencyBRL(totalAmount)}</strong>
            </div>

            {form.watch('type') === 'delivery' && (
              <div className="flex flex-row items-center justify-between w-full text-sm text-muted-foreground">
                <span>Entrega</span>
                <strong>
                  {formatCurrencyBRL(form.watch('shipping_price') ?? 0)}
                </strong>
              </div>
            )}

            <div className="flex flex-row items-center justify-between w-full">
              <span>Total da venda</span>
              <strong>{formatCurrencyBRL(totalPurchasePrice ?? 0)}</strong>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Criando pedido</span>
              </>
            ) : (
              <span>Criar pedido</span>
            )}
          </Button>
        </Card>
      </form>
    </Form>
  )
}
